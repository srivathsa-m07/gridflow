# GRIDFLOW Agent Provisioning & Management Architecture (v2)

Status: **Draft for review — not implemented**
Author: Principal Architect (assistant), 2026-07-31
Supersedes: current ad-hoc implementation in `apps/agent`, `apps/api/src/routes/agent*.ts`, `apps/api/src/services/agentRegistry.ts`

---

## 1. Current-state findings (baseline)

| Area | Current reality |
|---|---|
| Agent runtime | Real Node process (`apps/agent/src/index.ts`), polls `systeminformation` every 5s, POSTs metrics — no distinct heartbeat, no retry/backoff, no update mechanism |
| Auth | Single static plaintext `agentKey` (32 random bytes), stored unhashed in Mongo, sent as JSON body field, no rotation/revocation/scoping/expiry |
| Status/liveness | In-memory `Map` in `agentRegistry.ts`, reset on every API process restart, not persisted, 15s offline threshold hardcoded |
| DB schema | Mongoose `Agent` model has no `status`, `lastSeen`, `revoked`, or `version` fields |
| Docker distribution | Dockerfile exists but **no registry publish** — operators must `docker build` locally, no GHCR/Docker Hub image |
| CI/CD | None — no `.github/workflows` at all |
| Install experience | Copy-paste block generated client-side by `AgentOnboardingPanel.tsx`; no `install.sh`/`install.ps1`, no package manager distribution |
| Endpoints | `POST /api/agent/metrics` (agent→server), `GET/POST /api/agents(/create)` (dashboard→server); no heartbeat, delete, rotate-key, or install-script endpoints |
| Replay protection | None — a leaked key is valid forever with no timestamp/nonce checks |

This document treats the above as the problem statement and designs the replacement end-to-end. Nothing below assumes the current code survives as-is; where reuse is possible it's called out explicitly.

---

## 2. Design goals & non-goals

**Goals**
- An agent identity and lifecycle model that matches how Datadog/Grafana Agent/New Relic actually behave: register once, authenticate every call, transition through well-defined states, survive server restarts.
- A real "one command" install for Linux/macOS/Windows, backed by a published, versioned, multi-arch Docker image (and optionally a static binary later).
- Secrets that are never stored in plaintext, are scoped, rotatable, and revocable without redeploying the agent.
- A management UI that shows the truth: real status transitions, real last-seen, real version, with drill-down and bulk actions (revoke, rename, delete).
- A design that scales from 10 agents to 100k+ without re-architecting (i.e., no naive in-memory registry as source of truth, no O(n) polling).

**Non-goals (for this document)**
- Full APM/tracing/log-shipping pipeline design (out of scope; this is infra/host-metrics agent management).
- Multi-region/multi-tenant data residency — noted as a future scalability concern only.
- Actual code implementation — this is the architecture; milestones below sequence the build.

---

## 3. Agent lifecycle

### 3.1 States

```
 CREATED ──(install+first successful heartbeat)──▶ ONLINE
    │                                                  │  │
    │ (never connects within TTL)                      │  │ (missed N heartbeats)
    ▼                                                   │  ▼
 EXPIRED                                                │ DEGRADED ──(missed further N)──▶ OFFLINE
    (soft-deletable)                                    │                                     │
                                                         │◀──(heartbeat resumes)───────────────┘
                                                         │
                                          (user action: revoke/delete)
                                                         ▼
                                                    REVOKED / DELETED
```

- **CREATED** — record exists (key issued), agent has never sent a heartbeat. TTL (default 24h) before auto-transition to `EXPIRED` — surfaces stale onboarding attempts instead of leaving zombie "pending" rows forever.
- **ONLINE** — heartbeat received within `2 × heartbeat_interval` (default interval 30s → 60s grace).
- **DEGRADED** — heartbeat missed once beyond grace but within `5 × heartbeat_interval` — early warning state, distinct from hard offline, shown as amber in UI (this state doesn't exist today; it's the biggest UX gap vs. Datadog, which distinguishes "flapping" from "down").
- **OFFLINE** — no heartbeat beyond the degraded window. Triggers optional alert/incident.
- **REVOKED** — key invalidated by user action; agent can no longer authenticate (401s immediately), row kept for audit history.
- **DELETED** — soft-deleted (retained for audit trail per §11), hidden from default UI views.

State transitions are computed **server-side**, driven by a scheduled sweep (§4.4) plus event-driven updates on each heartbeat — never solely inferred client-side, and never lost on process restart (§8).

### 3.2 Lifecycle events emitted

Every transition emits a domain event (`agent.created`, `agent.online`, `agent.degraded`, `agent.offline`, `agent.revoked`, `agent.deleted`) onto an internal event bus (§4.5). Consumers: WebSocket broadcaster (UI), audit log writer, alerting/incident engine, analytics.

---

## 4. Agent provisioning & registration

### 4.1 Two-phase provisioning (replaces single-shot key issuance)

Today, `POST /api/agents/create` mints a long-lived static secret up front. That secret is what ships inside every install command, which means it leaks into shell history, CI logs, and screenshots. Replace with a two-phase flow used by Datadog/GA/Grafana Agent:

1. **Provisioning token** (short-lived, single-use, scoped): dashboard calls `POST /api/agents/provisioning-tokens` → server returns a token valid for 1 hour, usable once, scoped to one organization and (optionally) one environment/tag-set. This is what's embedded in the install command shown to the user.
2. **Agent registration**: the agent binary, on first start, exchanges the provisioning token for its real long-lived credentials via `POST /api/agents/register` (`{provisioningToken, hostname, os, arch, version}`). Server validates the token (unused, unexpired, correct org), creates the `Agent` row in `CREATED` state, generates an **asymmetric or HMAC keypair scoped to that agent** (§6), marks the token consumed, and returns `{agentId, agentSecret}` to the agent **once**. The agent persists this locally (e.g. `/etc/gridflow/agent.credentials`, mode 0600) and never receives it again — if lost, the operator must re-provision, not "view" the secret again (matches how Datadog install keys behave).

This means a leaked install command is only as dangerous as a 1-hour, single-use, org-scoped token — not a forever-valid device credential.

### 4.2 Re-registration / reinstall

If an agent's local credential file is deleted (reimaged host, container recreated) it re-registers with a *new* provisioning token, producing a new `Agent` row. Optional: `POST /api/agents/register` accepts an idempotency key (e.g. a stable machine-id hash) so re-registration from the *same* host updates the existing row instead of duplicating it — configurable per org (some customers want strict per-instance identity, e.g. ephemeral containers; others want stable per-host identity).

### 4.3 Provisioning UI flow

Replaces `AgentOnboardingPanel.tsx`'s current behavior (which already generates a real key up front):

1. User clicks "Add Agent" → picks a name/tag/environment → dashboard calls the provisioning-token endpoint (not agent-create).
2. UI renders the **install command** (§9) embedding the provisioning token and backend URL, with a copy button and a visible countdown ("this command expires in 59:42").
3. Panel polls (or subscribes via WebSocket to) `GET /api/agents/provisioning-tokens/:id/status` until it observes the resulting agent transition CREATED → ONLINE, then auto-advances the UI to "Agent connected ✅" with hostname/version — closing the loop instead of leaving the user guessing (current panel never confirms success).
4. On token expiry with no registration, UI shows "Didn't work? Regenerate command."

### 4.4 Liveness sweep

A scheduled job (not a busy in-memory `setInterval` on the API's own event loop as today) — implemented as a cron-style worker (or a TTL index / capped background job in whichever queue is adopted, §12) — runs every 15–30s, scans agents whose `lastHeartbeatAt` has crossed a threshold, and performs the state transitions in §3.1 directly against the persisted record, emitting lifecycle events. This must run correctly even with multiple API replicas (leader election or a dedicated worker process — not per-replica timers, which today would double-fire once the API is horizontally scaled).

### 4.5 Event bus

Internal pub/sub (Redis Streams/pub-sub is the pragmatic choice given the stack, or a lightweight in-process EventEmitter behind an interface if Redis isn't yet in the stack) decouples "something about an agent changed" from "who needs to know" (WebSocket room broadcast, audit log, alerting). This replaces the tight coupling in today's `agentRegistry.ts`, which directly calls Socket.IO from inside the registry.

---

## 5. Agent heartbeat & last-seen

### 5.1 Separate heartbeat from metrics

Today metrics POST *is* the heartbeat — no way to know "agent is alive but metrics collection failed" vs. "agent is dead." Split into two endpoints:

- `POST /api/agents/heartbeat` — tiny, frequent (every 15–30s), body: `{agentId, version, uptimeSec}` (or empty + auth-derived identity). Updates `lastHeartbeatAt`, `agentVersion`, and flips state per §3.1.
- `POST /api/agents/metrics` — heavier payload, can run on a different/slower interval (e.g. every 60s), does not itself drive liveness state (though receiving metrics implicitly counts as a heartbeat too — a metrics POST updates `lastHeartbeatAt` as a side effect, so a healthy agent doesn't need to double-send).

### 5.2 Last-seen semantics

`lastHeartbeatAt` (or `lastSeenAt`) is a persisted DB field (not in-memory), updated with every accepted heartbeat/metrics call, always stored in UTC, rendered client-side as relative time ("3s ago", "2m ago", "offline since 14:32"). This is the field the sweep job (§4.4) reads to compute state — single source of truth, survives restarts.

### 5.3 Backoff & jitter

Agent-side heartbeat client uses exponential backoff with jitter on failure (current agent has no retry logic at all — a single failed POST is just logged and dropped until the next 5s tick). Also cap heartbeat/metrics payload retries to avoid thundering-herd on API recovery after an outage (all agents reconnecting simultaneously).

---

## 6. Secure key management

Replaces the single static plaintext bearer secret.

- **At rest**: agent secrets are never stored in plaintext server-side. Store only a salted hash (Argon2id or bcrypt, matching the existing `bcrypt` dependency already used for user passwords) — verification is hash-compare, same pattern as password auth. If low-latency verification at very high request volume becomes a bottleneck, move to HMAC-based auth (§6.1) which avoids hashing on every request entirely.
- **In transit**: TLS enforced at the ingress/load-balancer layer (today nothing in-repo enforces this — must be explicit in deployment config, not assumed).
- **Scoping**: each agent credential is scoped to exactly one `organizationId` and one `agentId` — never a shared org-wide secret. (Today's key is already per-agent, which is good; keep that property.)
- **Rotation**: `POST /api/agents/:id/rotate-key` invalidates the old secret and returns a new one exactly once; old credential has a short overlap grace window (e.g. 5 minutes) to avoid hard-cutting an agent mid-request during a rolling credential update.
- **Revocation**: `POST /api/agents/:id/revoke` sets state to `REVOKED` immediately — auth middleware checks state on every request, not just credential validity, so a revoked-but-technically-correct secret is rejected instantly (today there is no revocation path at all).
- **No secrets in logs**: audit/logging middleware must redact `agentSecret`/`provisioningToken` fields — add an explicit denylist in the logger config.

### 6.1 Recommended auth mechanism: HMAC request signing (v2 target), bearer secret (v1 acceptable bridge)

- **v1 (bridge, low lift)**: keep bearer-secret-in-header (moved from body → `Authorization: Bearer <secret>` header, at minimum — never in the JSON body or query string), but hash server-side and add expiry/revocation as above. Acceptable for milestone 1.
- **v2 (target)**: HMAC-SHA256 request signing — agent signs `timestamp + body` with its secret; server recomputes and compares, rejecting requests with timestamp skew beyond ±5 minutes (replay protection, which is entirely absent today). This avoids sending the secret itself over the wire on every call and is the pattern Datadog's agent API key handling and most webhook-style provisioning systems use.

---

## 7. Status transitions & "last seen" UI semantics

Management UI must render, per agent:
- Status pill: Online (green) / Degraded (amber) / Offline (red) / Revoked (grey) / Pending install (blue, for `CREATED`).
- Last seen: relative + absolute (tooltip) timestamp.
- Version, hostname, OS/arch, tags/environment.
- History drawer: last N lifecycle transitions (from the audit/event log, §11) — "why is this agent offline" is answerable without SSH-ing into infra.

State badge logic must read from the persisted `status` field computed by the sweep job — the UI must never recompute "is it online" from a raw timestamp diff itself in more than one place (today `InfrastructurePanel`/`TopologyView` both derive from the same `isOnline` boolean via sockets, which is correct in spirit — keep that single-derivation principle, just move the source of truth from in-memory registry to persisted+event-driven state).

---

## 8. Database schema changes

Staying on MongoDB/Mongoose (matches existing stack; no reason to force a migration to SQL for this).

### `Agent` (revised)
```
{
  _id,
  organizationId: ObjectId (indexed),
  name: string,
  hostname: string,
  os: enum[linux, darwin, windows],
  arch: enum[x64, arm64],
  agentVersion: string,
  tags: string[]                 // environment/tag-based grouping, e.g. ["prod","web"]
  secretHash: string,             // Argon2id/bcrypt hash, never plaintext
  secretRotatedAt: Date,
  status: enum[created, online, degraded, offline, revoked, deleted, expired],
  lastHeartbeatAt: Date | null,
  lastMetricsAt: Date | null,
  createdAt: Date,
  revokedAt: Date | null,
  deletedAt: Date | null,         // soft delete
}
// indexes: {organizationId, status}, {lastHeartbeatAt} (for sweep job), {secretHash} unique
```

### `ProvisioningToken` (new)
```
{
  _id,
  organizationId: ObjectId,
  token: string (hashed, single-use),
  createdBy: ObjectId (User),
  expiresAt: Date,               // TTL index — auto-expire in Mongo
  usedAt: Date | null,
  resultingAgentId: ObjectId | null,
  scopedTags: string[] | null,
}
// TTL index on expiresAt for auto-cleanup
```

### `AgentEvent` (new — audit trail, replaces "nothing" today)
```
{
  _id,
  agentId: ObjectId (indexed),
  organizationId: ObjectId,
  type: enum[created, registered, online, degraded, offline, key_rotated, revoked, deleted],
  metadata: object,               // e.g. previous/new version on upgrade
  actorType: enum[agent, user, system],
  actorId: ObjectId | null,
  createdAt: Date,
}
// capped collection or TTL (e.g. 180d retention) depending on compliance needs
```

### `Metric` (existing, minor change)
Add `agentId` reference if not already keyed that way (verify against current `Metric.ts`); no other structural change needed for this document's scope.

Migration approach: Mongoose has no formal migration tool in place today — introduce a lightweight migration runner (e.g. `migrate-mongo`) as part of milestone 1 so schema changes are versioned and repeatable, rather than ad hoc schema edits.

---

## 9. One-command installation (Linux/macOS/Windows)

### 9.1 Linux/macOS
```bash
curl -fsSL https://install.gridflow.io/agent.sh | bash -s -- --token=<provisioning_token> --backend=https://api.gridflow.io
```
`install.sh` responsibilities: detect OS/arch, pull the correct published image tag (`ghcr.io/gridflow/agent:<version>-<arch>`) or, if Docker isn't available, fall back to a static binary download (future milestone) or a systemd unit + npm-based install; write config to `/etc/gridflow/agent.env`; start the container/service; run the register handshake; print success/failure clearly. Script is idempotent — safe to re-run for upgrade or repair.

### 9.2 Windows
```powershell
irm https://install.gridflow.io/agent.ps1 | iex -ArgumentList '-Token','<provisioning_token>','-Backend','https://api.gridflow.io'
```
`install.ps1` mirrors the shell script: detects Docker Desktop or falls back to registering a Windows Service running the agent binary; writes config under `%ProgramData%\GridFlow\agent.env`.

### 9.3 Non-negotiables for both scripts
- Never embed a long-lived secret in the command itself — only the short-lived provisioning token (§4.1), so shell-history/CI-log exposure is bounded to 1 hour and single-use.
- Scripts are themselves versioned and served from a CDN-backed, code-reviewed location (not hand-typed each time) — treat `install.sh`/`install.ps1` as production code with their own tests (shellcheck/PSScriptAnalyzer in CI).
- `--uninstall` / `-Uninstall` flag that calls the revoke endpoint and tears down the local service/container cleanly.

### 9.4 Docker Hub / GHCR publishing pipeline

Currently absent entirely (no `.github/workflows`). Add:
- `.github/workflows/agent-release.yml`: on tag push (`agent-v*`), build multi-arch (`linux/amd64`, `linux/arm64`) image via `docker buildx`, push to **both** GHCR (`ghcr.io/gridflow/agent`) and Docker Hub (`gridflow/agent`) with tags `latest`, `<semver>`, `<semver-major>`. Sign images (cosign) and generate SBOM as a security baseline matching how Datadog/Grafana Agent publish.
- Separate workflows for `apps/api` and `apps/web` image builds (currently also absent) — out of this document's core scope but flagged as a gap since none of the three Dockerfiles are exercised by any CI today.

---

## 10. API design (summary)

| Method & path | Auth | Purpose |
|---|---|---|
| `POST /api/agents/provisioning-tokens` | User JWT | Mint scoped, short-lived, single-use install token |
| `GET /api/agents/provisioning-tokens/:id/status` | User JWT | Poll/subscribe for registration completion (drives onboarding UI) |
| `POST /api/agents/register` | Provisioning token | Exchange token for agent identity + secret (once) |
| `POST /api/agents/heartbeat` | Agent secret (header) | Lightweight liveness ping |
| `POST /api/agents/metrics` | Agent secret (header) | Metrics payload (also counts as heartbeat) |
| `GET /api/agents` | User JWT | List org's agents with status/last-seen |
| `GET /api/agents/:id` | User JWT | Agent detail + recent event history |
| `PATCH /api/agents/:id` | User JWT | Rename, retag |
| `POST /api/agents/:id/rotate-key` | User JWT | Rotate secret, grace-window overlap |
| `POST /api/agents/:id/revoke` | User JWT | Immediate revoke |
| `DELETE /api/agents/:id` | User JWT | Soft delete |
| `GET /api/agents/:id/events` | User JWT | Full audit trail (paginated) |

All agent-authenticated endpoints move the secret from JSON body → `Authorization` header, add request-timestamp validation once HMAC (§6.1) lands, and enforce state checks (reject `revoked`/`deleted`) at the middleware layer, not per-route.

---

## 11. Security considerations (consolidated)

1. Provisioning tokens: short-lived, single-use, scoped, TTL-indexed for auto-expiry.
2. Agent secrets: hashed at rest, header-based transport, rotation + revocation endpoints, redacted from all logs.
3. Replay protection: HMAC + timestamp window (v2), at minimum rate-limiting + IP/hostname sanity checks in v1.
4. Least privilege: agent credentials scoped to one org + one agent; never a shared/org-wide agent key.
5. Audit trail: every state transition and key operation (rotate/revoke/delete) recorded in `AgentEvent` with actor attribution — currently there is zero audit trail.
6. Transport: TLS enforced at ingress; document this as an explicit deployment requirement since nothing in-app enforces it.
7. Supply chain: signed, SBOM-attached images; pin base images by digest in the agent Dockerfile.
8. Rate limiting & abuse: heartbeat/metrics endpoints rate-limited per agent to prevent a compromised/misbehaving agent from hammering the API.
9. Install script integrity: serve over HTTPS from a domain with HSTS, checksum-verify downloaded binaries/images where feasible.

---

## 12. Future scalability

- **Liveness sweep as a shared worker**, not per-API-replica timers — required the moment the API scales beyond one instance (already a latent bug today: `agentRegistry.ts`'s `setInterval` would run once per replica and double-broadcast).
- **Move in-memory registry state → Redis** as an intermediate cache layer in front of MongoDB for very high heartbeat volume (100k+ agents), with MongoDB remaining the durable source of truth and Redis absorbing write-heavy heartbeat traffic before batched flush — avoids hammering Mongo on every 15s heartbeat at scale.
- **Sharding heartbeat ingestion** behind a lightweight ingest tier (separate from the main API) once volume justifies it, mirroring how Datadog separates its intake layer from its query/API layer.
- **WebSocket fan-out**: current Socket.IO room-per-org broadcast is fine at current scale; at higher scale, move to a pub/sub backplane (Redis adapter for Socket.IO, already a natural fit alongside the Redis cache layer above) so WebSocket delivery scales horizontally across API replicas.
- **Agent auto-update**: agent checks `agentVersion` against a `/api/agents/latest-version` endpoint on each heartbeat and can self-update (Docker: repull `latest`/pinned tag via a sidecar updater or Watchtower-style pattern; binary: in-place replace) — flagged as a later milestone, not core to this redesign.
- **Shared types package**: `packages/types` already exists but is under-used (web app defines local types); as agent/API/web all need to agree on the `Agent`/event schemas above, consolidate shared DTOs there to prevent drift — worth doing as part of milestone 1 rather than deferring.

---

## 13. UI flow (management page)

1. **Agents list** (replaces ad hoc `InfrastructurePanel`/`TopologyView` props wiring): table with status pill, name, hostname, tags, version, last seen, actions menu (rotate key, revoke, rename, delete).
2. **Add Agent** modal → provisioning token flow (§4.3) → live-updating "waiting for connection" state → success confirmation.
3. **Agent detail drawer**: metrics sparkline, lifecycle event timeline (from `AgentEvent`), current tags/environment, danger-zone actions (revoke/delete) behind a confirm dialog.
4. **Topology view**: continues to consume the same `status` field, now sourced from persisted+event-driven state rather than a volatile in-memory map, so it stays consistent across page reloads and multiple browser tabs/team members.
5. **Bulk actions**: filter by tag/environment, bulk revoke/delete — necessary once agent count grows past a handful (not needed at milestone 1 scale, planned for later).

---

## 14. Milestones

**M1 — Foundation & secret hygiene (no behavior change to lifecycle yet)**
- Move agent secret to header-based auth, hash at rest, add rotate/revoke endpoints + `revoked`/`deleted` schema fields.
- Add `migrate-mongo` (or equivalent) migration runner; write the `Agent` schema migration.
- Redact secrets from logs.

**M2 — Real lifecycle & persisted status**
- Add `status`, `lastHeartbeatAt` fields; build the shared liveness-sweep worker (single-instance-safe).
- Split heartbeat from metrics endpoint; implement DEGRADED state.
- Add `AgentEvent` audit log + emit events from all transitions.
- Update `InfrastructurePanel`/`TopologyView`/new Agent Detail drawer to consume persisted state.

**M3 — Two-phase provisioning**
- `ProvisioningToken` model + endpoints; rework `AgentOnboardingPanel` into the token-based flow with live status polling.
- Update agent binary to perform the register handshake instead of reading a pre-baked key from env.

**M4 — Distribution & install experience**
- CI pipeline: multi-arch build, GHCR + Docker Hub publish, image signing/SBOM.
- `install.sh` / `install.ps1` with idempotent install/uninstall, Docker-or-fallback detection.

**M5 — Scale-out readiness**
- Redis-backed heartbeat cache + Socket.IO Redis adapter.
- Agent auto-update check.
- Bulk agent management UI actions, tag/environment-based filtering.

Each milestone is independently shippable and backward compatible with the milestone before it (e.g. M2's persisted status can run alongside the old in-memory registry until cut over; M3's new provisioning flow doesn't break M1/M2's auth model).

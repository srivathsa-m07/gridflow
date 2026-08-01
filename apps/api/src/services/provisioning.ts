import mongoose from 'mongoose';
import { ProvisioningToken, IProvisioningToken } from '../models/ProvisioningToken';
import { generateAgentSecret, hashSecret, verifySecret, formatAgentToken, parseAgentToken, DUMMY_SECRET_HASH } from '../utils/secrets';

// Single-use, short-lived — see architecture doc §4.1. One hour balances
// "long enough for an operator to paste the install command" against
// "short enough that a leaked command in shell history/CI logs is low risk."
export const PROVISIONING_TOKEN_TTL_MS = 60 * 60 * 1000;

export interface IssuedProvisioningToken {
  token: string;
  expiresAt: Date;
}

export const issueProvisioningToken = async (
  agentId: mongoose.Types.ObjectId | string,
  organizationId: mongoose.Types.ObjectId | string
): Promise<IssuedProvisioningToken> => {
  const rawSecret = generateAgentSecret();
  const tokenHash = await hashSecret(rawSecret);
  const expiresAt = new Date(Date.now() + PROVISIONING_TOKEN_TTL_MS);

  const doc = await ProvisioningToken.create({
    agentId,
    organizationId,
    tokenHash,
    expiresAt
  });

  return { token: formatAgentToken(doc._id.toString(), rawSecret), expiresAt };
};

// Invalidate any outstanding, unused tokens for an agent — used when revoking
// an agent so a still-valid provisioning token can't complete registration
// for a credential that's meant to be dead.
export const invalidatePendingProvisioningTokens = async (agentId: mongoose.Types.ObjectId | string): Promise<void> => {
  await ProvisioningToken.updateMany(
    { agentId, usedAt: { $exists: false } },
    { $set: { usedAt: new Date() } }
  );
};

export type ProvisioningTokenConsumeResult =
  | { ok: true; agentId: string; organizationId: string }
  | { ok: false };

/**
 * Validates and atomically marks a provisioning token used in one step, so
 * two concurrent registration attempts with the same token can't both
 * succeed. Always performs a bcrypt compare (real hash or a dummy one) so
 * "no such token" / "expired" / "already used" / "wrong secret" all take
 * comparable time and don't leak which case applies via latency.
 */
export const consumeProvisioningToken = async (token: string): Promise<ProvisioningTokenConsumeResult> => {
  const parsed = parseAgentToken(token);
  if (!parsed) {
    await verifySecret('irrelevant', DUMMY_SECRET_HASH);
    return { ok: false };
  }

  let doc: IProvisioningToken | null = null;
  try {
    doc = await ProvisioningToken.findById(parsed.agentId).select('+tokenHash');
  } catch {
    doc = null;
  }

  const isUsable = !!doc && !doc.usedAt && doc.expiresAt.getTime() > Date.now();
  const hashToCompare = isUsable && doc ? doc.tokenHash : DUMMY_SECRET_HASH;
  const secretMatches = await verifySecret(parsed.rawSecret, hashToCompare);

  if (!doc || !isUsable || !secretMatches) {
    return { ok: false };
  }

  const claimed = await ProvisioningToken.findOneAndUpdate(
    { _id: doc._id, usedAt: { $exists: false } },
    { $set: { usedAt: new Date() } },
    { new: true }
  );

  // Lost the race to a concurrent registration attempt using the same token.
  if (!claimed) {
    return { ok: false };
  }

  return { ok: true, agentId: doc.agentId.toString(), organizationId: doc.organizationId.toString() };
};

import mongoose, { Schema, Document } from 'mongoose';

export type AgentStatus = 'created' | 'online' | 'offline' | 'revoked';

export const AGENT_STATUSES: AgentStatus[] = ['created', 'online', 'offline', 'revoked'];

export interface IAgent extends Document {
  name: string;
  secretHash: string;
  organizationId: mongoose.Types.ObjectId;
  hostname?: string;
  status: AgentStatus;
  lastHeartbeatAt?: Date;
  revokedAt?: Date;
  secretRotatedAt: Date;
  createdAt: Date;
}

const AgentSchema = new Schema<IAgent>({
  name: { type: String, required: true },
  secretHash: { type: String, required: true, select: false },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  hostname: { type: String },
  status: { type: String, enum: AGENT_STATUSES, required: true, default: 'created' },
  lastHeartbeatAt: { type: Date },
  revokedAt: { type: Date },
  secretRotatedAt: { type: Date, required: true, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

AgentSchema.index({ organizationId: 1 });
// Supports the lifecycle sweep's scan for online agents that have gone quiet.
AgentSchema.index({ status: 1, lastHeartbeatAt: 1 });

export const Agent = mongoose.model<IAgent>('Agent', AgentSchema);

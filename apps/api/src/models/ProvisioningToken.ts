import mongoose, { Schema, Document } from 'mongoose';

export interface IProvisioningToken extends Document {
  agentId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
}

const ProvisioningTokenSchema = new Schema<IProvisioningToken>({
  agentId: { type: Schema.Types.ObjectId, ref: 'Agent', required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  tokenHash: { type: String, required: true, select: false },
  expiresAt: { type: Date, required: true },
  usedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

ProvisioningTokenSchema.index({ agentId: 1 });
// Belt-and-suspenders expiry: the app also checks expiresAt on every verify,
// but this lets MongoDB physically reap expired/used tokens on its own.
ProvisioningTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const ProvisioningToken = mongoose.model<IProvisioningToken>('ProvisioningToken', ProvisioningTokenSchema);

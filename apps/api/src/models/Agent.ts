import mongoose, { Schema, Document } from 'mongoose';

export interface IAgent extends Document {
  name: string;
  agentKey: string;
  organizationId: mongoose.Types.ObjectId;
  hostname?: string;
  createdAt: Date;
}

const AgentSchema = new Schema<IAgent>({
  name: { type: String, required: true },
  agentKey: { type: String, required: true, unique: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  hostname: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const Agent = mongoose.model<IAgent>('Agent', AgentSchema);

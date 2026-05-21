import mongoose, { Schema, Document } from 'mongoose';

export interface IMetric extends Document {
  cpu: number;
  memory: number;
  uptime: number;
  status: 'healthy' | 'warning' | 'critical';
  agentId?: string;
  hostname?: string;
  timestamp: Date;
  organizationId?: string;
}

const MetricSchema = new Schema<IMetric>({
  cpu: { type: Number, required: true },
  memory: { type: Number, required: true },
  uptime: { type: Number, required: true },
  status: { type: String, required: true, enum: ['healthy', 'warning', 'critical'] },
  agentId: { type: String },
  hostname: { type: String },
  timestamp: { type: Date, default: Date.now },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' }
});

export const Metric = mongoose.model<IMetric>('Metric', MetricSchema);

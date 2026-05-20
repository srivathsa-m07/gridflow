import mongoose, { Schema, Document } from 'mongoose';

export interface IIncident extends Document {
  incidentId: string;
  type: 'HIGH_CPU' | 'HIGH_MEMORY';
  severity: 'critical' | 'warning';
  message: string;
  agentId: string;
  hostname: string;
  aiSummary?: string;
  timestamp: Date;
}

const IncidentSchema = new Schema<IIncident>({
  incidentId: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  severity: { type: String, required: true },
  message: { type: String, required: true },
  agentId: { type: String, required: true },
  hostname: { type: String, required: true },
  aiSummary: { type: String },
  timestamp: { type: Date, default: Date.now }
});

export const Incident = mongoose.model<IIncident>('Incident', IncidentSchema);

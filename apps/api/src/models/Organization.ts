import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  discordWebhookUrl?: string;
  slackWebhookUrl?: string;
  createdAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>({
  name: { type: String, required: true, unique: true },
  discordWebhookUrl: { type: String, default: null },
  slackWebhookUrl: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

export const Organization = mongoose.model<IOrganization>('Organization', OrganizationSchema);

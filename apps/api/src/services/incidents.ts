import http from 'http';
import https from 'https';
import { Incident } from '../models/Incident';
import { Agent } from '../models/Agent';
import { Organization } from '../models/Organization';
import { generateIncidentSummary } from './ai';
import { getIO } from '../sockets/socket';
import { logger } from '../utils/logger';

const cooldowns = new Map<string, number>();
const COOLDOWN_MS = 60 * 1000;

export const processIncidentDetection = async (metrics: {
  agentId: string;
  hostname: string;
  cpu: number;
  memory: number;
  organizationId?: string;
}) => {
  const { agentId, hostname, cpu, memory, organizationId } = metrics;
  
  if (cpu > 80) {
    await triggerIncident('HIGH_CPU', cpu, agentId, hostname, organizationId);
  }
  if (memory > 80) {
    await triggerIncident('HIGH_MEMORY', memory, agentId, hostname, organizationId);
  }
};

const triggerIncident = async (
  type: 'HIGH_CPU' | 'HIGH_MEMORY',
  value: number,
  agentId: string,
  hostname: string,
  organizationId?: string
) => {
  const key = `${agentId}:${type}`;
  const now = Date.now();
  const lastTriggered = cooldowns.get(key);

  if (lastTriggered && now - lastTriggered < COOLDOWN_MS) {
    return;
  }

  cooldowns.set(key, now);
  logger.warn(`Incident detected: ${type} on ${agentId} (${value}%)`);

  const aiSummary = await generateIncidentSummary(type, agentId, hostname, value);

  const incidentData = {
    incidentId: `inc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type,
    severity: 'critical' as const,
    message: `${type === 'HIGH_CPU' ? 'High CPU' : 'High Memory'} usage detected: ${value}%`,
    agentId,
    hostname,
    aiSummary,
    timestamp: new Date(),
    organizationId
  };

  try {
    await Incident.create(incidentData);
    logger.info(`Incident successfully logged: ${incidentData.incidentId}`);
  } catch (error) {
    logger.error(`Failed to save incident: ${error}`);
  }

  try {
    await sendIncidentNotifications(organizationId, incidentData);
  } catch (error) {
    logger.error(`Incident notification failed: ${error}`);
  }

  const io = getIO();
  if (io) {
    if (organizationId) {
      io.to(organizationId).emit('incident', incidentData);
    } else {
      io.emit('incident', incidentData);
    }
  }
};

const sendIncidentNotifications = async (
  organizationId: string | undefined,
  incidentData: {
    incidentId: string;
    type: 'HIGH_CPU' | 'HIGH_MEMORY';
    severity: 'critical';
    message: string;
    agentId: string;
    hostname: string;
    aiSummary?: string;
    timestamp: Date;
    organizationId?: string;
  }
) => {
  if (!organizationId) {
    return;
  }

  const organization = await Organization.findById(organizationId).lean();
  if (!organization) {
    return;
  }

  const agent = await Agent.findById(incidentData.agentId).lean();
  const agentName = agent?.name || incidentData.agentId;
  const formattedTime = incidentData.timestamp.toISOString();
  const incidentLabel = incidentData.type === 'HIGH_CPU' ? 'High CPU' : 'High Memory';
  const summary = incidentData.aiSummary ? `${incidentData.aiSummary}` : 'No AI summary available.';

  const discordPayload = {
    username: 'GRIDFLOW Alert',
    embeds: [
      {
        title: `${incidentLabel} alert detected`,
        description: `*${incidentData.message}*`,
        color: 15158332,
        fields: [
          { name: 'Severity', value: incidentData.severity, inline: true },
          { name: 'Agent', value: agentName, inline: true },
          { name: 'Hostname', value: incidentData.hostname, inline: true },
          { name: 'Time', value: formattedTime, inline: true },
          { name: 'AI summary', value: summary }
        ],
        footer: {
          text: 'GRIDFLOW Incident Notification'
        }
      }
    ]
  };

  const slackPayload = {
    text: `GRIDFLOW incident: ${incidentLabel}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*GRIDFLOW Incident*\n${incidentData.message}`
        }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Severity:*
${incidentData.severity}` },
          { type: 'mrkdwn', text: `*Agent:*
${agentName}` },
          { type: 'mrkdwn', text: `*Hostname:*
${incidentData.hostname}` },
          { type: 'mrkdwn', text: `*Time:*
${formattedTime}` }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*AI summary:*
${summary}`
        }
      }
    ]
  };

  const requests = [] as Promise<unknown>[];

  if (organization.discordWebhookUrl) {
    requests.push(sendWebhook(organization.discordWebhookUrl, discordPayload));
  }
  if (organization.slackWebhookUrl) {
    requests.push(sendWebhook(organization.slackWebhookUrl, slackPayload));
  }

  if (requests.length === 0) {
    return;
  }

  await Promise.allSettled(requests);
};

const sendWebhook = async (url: string, body: unknown) => {
  const payload = JSON.stringify(body);
  const endpoint = new URL(url);
  const transport = endpoint.protocol === 'https:' ? https : http;

  return new Promise<void>((resolve, reject) => {
    const request = transport.request(
      {
        hostname: endpoint.hostname,
        path: `${endpoint.pathname}${endpoint.search}`,
        port: endpoint.port || (endpoint.protocol === 'https:' ? 443 : 80),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      },
      (response) => {
        if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
          resolve();
        } else {
          reject(new Error(`Webhook returned status ${response.statusCode}`));
        }
      }
    );

    request.on('error', (error) => reject(error));
    request.write(payload);
    request.end();
  }).catch((error) => {
    logger.error(`Webhook delivery failed for ${url}: ${error}`);
  });
};

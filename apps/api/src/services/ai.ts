import { env } from '../config/env';
import { logger } from '../utils/logger';

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

export const generateIncidentSummary = async (
  type: string,
  agentId: string,
  hostname: string,
  value: number
): Promise<string> => {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
    logger.warn('GEMINI_API_KEY is not defined or is placeholder. Skipping AI summary.');
    return 'AI summary unavailable (API key not configured).';
  }

  const prompt = `You are an operations intelligence assistant. Write a short, highly professional, operational 1-sentence summary of the following system incident.
Incident Details:
- Type: ${type}
- Agent: ${agentId}
- Hostname: ${hostname}
- Current Value: ${value}%

Return ONLY the 1-sentence summary, keeping it concise and technical. Example: "High CPU detected on gridflow-agent-01. System may be under heavy processing load."`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API responded with status ${response.status}`);
    }

    const data = (await response.json()) as GeminiResponse;
    const summaryText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return summaryText ? summaryText.trim() : 'Could not generate operational summary.';
  } catch (error) {
    logger.error(`Error generating AI incident summary: ${error}`);
    return 'Failed to generate operational summary due to system error.';
  }
};

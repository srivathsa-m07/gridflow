import { Request, Response, NextFunction } from 'express';
import { Agent, IAgent } from '../models/Agent';
import { parseAgentToken, verifySecret, DUMMY_SECRET_HASH } from '../utils/secrets';

const INVALID_CREDENTIAL_RESPONSE = { error: { message: 'Invalid or revoked agent credential' } };

export const agentAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : undefined;

    if (!token) {
      return res.status(401).json({ error: { message: 'Agent authentication required' } });
    }

    const parsed = parseAgentToken(token);
    if (!parsed) {
      return res.status(401).json(INVALID_CREDENTIAL_RESPONSE);
    }

    let agent: IAgent | null = null;
    try {
      agent = await Agent.findById(parsed.agentId).select('+secretHash');
    } catch {
      // Invalid ObjectId format falls through to the generic invalid-credential response
      agent = null;
    }

    // Always run a bcrypt compare, even when the agent doesn't exist or is
    // revoked, so response latency doesn't reveal whether an agentId is real
    // or its revocation state to a caller who doesn't hold the real secret.
    const hashToCompare = agent?.secretHash || DUMMY_SECRET_HASH;
    const secretMatches = await verifySecret(parsed.rawSecret, hashToCompare);

    if (!agent || agent.status === 'revoked' || !secretMatches) {
      return res.status(401).json(INVALID_CREDENTIAL_RESPONSE);
    }

    req.agent = agent;
    next();
  } catch (err) {
    next(err);
  }
};

declare global {
  namespace Express {
    interface Request {
      agent?: IAgent;
    }
  }
}

import crypto from 'crypto';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

/**
 * Agent bearer tokens are formatted as `<agentId>.<rawSecret>` so the API can
 * look up the owning Agent document before verifying the secret against its
 * bcrypt hash (bcrypt hashes cannot be queried directly).
 */
export const generateAgentSecret = (): string => crypto.randomBytes(32).toString('hex');

export const hashSecret = async (rawSecret: string): Promise<string> => {
  return bcrypt.hash(rawSecret, SALT_ROUNDS);
};

export const verifySecret = async (rawSecret: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(rawSecret, hash);
};

// A precomputed hash of a value nobody can ever supply as a real secret.
// Used to run a bcrypt compare against a constant cost even when no matching
// agent record exists, so "no such agent" and "wrong secret" take roughly the
// same amount of time and don't leak agent existence via response latency.
export const DUMMY_SECRET_HASH = '$2b$12$C6UzMDM.H6dfI/f/IKcEeOd8/rXk5.6qLZbF2m4S8jZY9tf2y1r0e';

export const formatAgentToken = (agentId: string, rawSecret: string): string => `${agentId}.${rawSecret}`;

export const parseAgentToken = (token: string): { agentId: string; rawSecret: string } | null => {
  const separatorIndex = token.indexOf('.');
  if (separatorIndex <= 0 || separatorIndex === token.length - 1) {
    return null;
  }
  return {
    agentId: token.slice(0, separatorIndex),
    rawSecret: token.slice(separatorIndex + 1)
  };
};

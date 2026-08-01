type LogLevel = 'info' | 'warn' | 'error';

const REDACTED = '[REDACTED]';
const SENSITIVE_KEY_PATTERN = /(secret|agentkey|password|token|authorization|apikey)/i;

const redactValue = (value: unknown, seen: WeakSet<object> = new WeakSet()): unknown => {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item, seen));
  }

  if (value && typeof value === 'object') {
    if (seen.has(value as object)) return '[Circular]';
    seen.add(value as object);

    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = SENSITIVE_KEY_PATTERN.test(key) ? REDACTED : redactValue(val, seen);
    }
    return result;
  }

  return value;
};

class Logger {
  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
  }

  private redactArgs(args: any[]): any[] {
    return args.map((arg) => redactValue(arg));
  }

  info(message: string, ...args: any[]) {
    console.log(this.formatMessage('info', message), ...this.redactArgs(args));
  }

  warn(message: string, ...args: any[]) {
    console.warn(this.formatMessage('warn', message), ...this.redactArgs(args));
  }

  error(message: string, ...args: any[]) {
    console.error(this.formatMessage('error', message), ...this.redactArgs(args));
  }
}

export const logger = new Logger();

type LogLevel = "info" | "warn" | "error" | "debug";

type LogPayload = Record<string, unknown> | undefined;

function formatTimestamp(): string {
  const now = new Date();
  return now.toLocaleTimeString("en-IN", { hour12: false });
}

function write(level: LogLevel, message: string, payload?: LogPayload) {
  const timestamp = formatTimestamp();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  if (payload) {
    console.log(`${prefix} ${message}`, payload);
  } else {
    console.log(`${prefix} ${message}`);
  }
}

export const logger = {
  info: (message: string, payload?: LogPayload) => write("info", message, payload),
  warn: (message: string, payload?: LogPayload) => write("warn", message, payload),
  error: (message: string, payload?: LogPayload) => write("error", message, payload),
  debug: (message: string, payload?: LogPayload) => write("debug", message, payload),
};

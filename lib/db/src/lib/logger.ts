// Simple logger wrapper — replace with pino or winston if preferred
export const logger = {
  info: (msg: string) => console.log(`[DB] ${msg}`),
  error: (msg: string, err?: unknown) =>
    console.error(`[DB] ${msg}`, err ?? ""),
};

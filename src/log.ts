type Level = "info" | "warn" | "error" | "payment";

/** Structured logger. Outputs JSON lines. */
export function log(
  level: Level,
  message: string,
  data?: Record<string, unknown>,
): void {
  const entry = {
    ts: new Date().toISOString(),
    level,
    msg: message,
    ...data,
  };
  if (level === "error") {
    console.error(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

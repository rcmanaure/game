import "dotenv/config";

// dotenv is already a dependency (^17.4.1). Use it instead of hand-rolling.
// loadEnv kept for backward compat with existing callers (run.ts, drift.ts).
export function loadEnv(path = ".env"): void {
  // No-op: dotenv/config imported above handles .env loading at module init
}

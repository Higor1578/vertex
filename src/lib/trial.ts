const TRIAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export type TrialStatus = {
  startedAt: Date;
  expiresAt: Date;
  remainingDays: number;
  expired: boolean;
};

export function getTrialStatus(email: string): TrialStatus {
  const normalizedEmail = email.trim().toLowerCase();
  const key = `vertex-trial-start:${normalizedEmail}`;
  const saved = localStorage.getItem(key);
  const parsed = saved ? Date.parse(saved) : Number.NaN;
  const startedAtMs = Number.isFinite(parsed) ? parsed : Date.now();

  if (!saved || !Number.isFinite(parsed)) localStorage.setItem(key, new Date(startedAtMs).toISOString());

  const expiresAtMs = startedAtMs + TRIAL_DURATION_MS;
  const remainingMs = expiresAtMs - Date.now();
  return {
    startedAt: new Date(startedAtMs),
    expiresAt: new Date(expiresAtMs),
    remainingDays: Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000))),
    expired: remainingMs <= 0
  };
}

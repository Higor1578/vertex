export function sanitizeText(value: string) {
  return value
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .trim();
}

export function assertRateLimit(key: string, maxHits = 12, windowMs = 60_000) {
  const now = Date.now();
  const storageKey = `hg-rate-${key}`;
  const hits = JSON.parse(localStorage.getItem(storageKey) ?? '[]') as number[];
  const freshHits = hits.filter((timestamp) => now - timestamp < windowMs);

  if (freshHits.length >= maxHits) {
    throw new Error('Muitas tentativas em pouco tempo. Aguarde um instante.');
  }

  localStorage.setItem(storageKey, JSON.stringify([...freshHits, now]));
}

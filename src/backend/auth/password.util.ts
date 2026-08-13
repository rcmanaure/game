import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

// node:crypto scrypt — no new dependency (bcrypt/argon2 not installed).
// Format: "<salt-hex>:<derived-hex>".
const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, KEY_LENGTH).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const derived = scryptSync(password, salt, KEY_LENGTH);
  const hashBuf = Buffer.from(hash, 'hex');
  // Lengths must match before timingSafeEqual — it throws on mismatched buffers.
  if (hashBuf.length !== derived.length) return false;
  return timingSafeEqual(derived, hashBuf);
}

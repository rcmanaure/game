import { hashPassword, verifyPassword } from '../password.util';

describe('password.util', () => {
  it('hashes a password to the "<salt-hex>:<derived-hex>" format', () => {
    const hash = hashPassword('correct horse battery staple');
    const parts = hash.split(':');
    expect(parts).toHaveLength(2);
    expect(parts[0]).toMatch(/^[0-9a-f]{32}$/); // 16-byte salt, hex
    expect(parts[1]).toMatch(/^[0-9a-f]{128}$/); // 64-byte derived key, hex
  });

  it('produces a different hash each time (random salt)', () => {
    const a = hashPassword('same password');
    const b = hashPassword('same password');
    expect(a).not.toEqual(b);
  });

  it('verifies the correct password against its own hash', () => {
    const hash = hashPassword('correct horse battery staple');
    expect(verifyPassword('correct horse battery staple', hash)).toBe(true);
  });

  it('rejects the wrong password', () => {
    const hash = hashPassword('correct horse battery staple');
    expect(verifyPassword('wrong password', hash)).toBe(false);
  });

  it('rejects a malformed stored hash instead of throwing', () => {
    expect(verifyPassword('anything', 'not-a-valid-hash')).toBe(false);
    expect(verifyPassword('anything', '')).toBe(false);
    expect(verifyPassword('anything', 'onlyonepart')).toBe(false);
  });

  it('is case- and whitespace-sensitive', () => {
    const hash = hashPassword('Password123');
    expect(verifyPassword('password123', hash)).toBe(false);
    expect(verifyPassword('Password123 ', hash)).toBe(false);
  });
});

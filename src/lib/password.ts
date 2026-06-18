import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

export function hashPassword(password: string) {
  const passwordSalt = randomBytes(16).toString("hex");
  const passwordHash = scryptSync(password, passwordSalt, KEY_LENGTH).toString("hex");

  return {
    passwordHash,
    passwordSalt
  };
}

export function verifyPassword(password: string, passwordHash?: string | null, passwordSalt?: string | null) {
  if (!passwordHash || !passwordSalt) return false;

  const expected = Buffer.from(passwordHash, "hex");
  const actual = scryptSync(password, passwordSalt, KEY_LENGTH);

  if (expected.length !== actual.length) return false;

  return timingSafeEqual(expected, actual);
}

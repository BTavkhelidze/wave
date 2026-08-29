import { randomBytes } from 'node:crypto';

export function generateTemporaryPassword(): string {
  const randomPart = randomBytes(6).toString('base64url');

  return `Tmp#${randomPart}9a`;
}

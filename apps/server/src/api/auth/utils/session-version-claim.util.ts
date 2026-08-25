export function isValidSessionVersionClaim(
  sessionVersion: unknown,
): sessionVersion is number {
  return (
    typeof sessionVersion === 'number' &&
    Number.isInteger(sessionVersion) &&
    sessionVersion >= 0
  );
}

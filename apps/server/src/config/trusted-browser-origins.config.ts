export function parseTrustedBrowserOrigins({
  environment,
  configuredOrigins,
  fallbackOrigins,
}: {
  environment: string;
  configuredOrigins?: string;
  fallbackOrigins: Array<string | undefined>;
}): string[] {
  const originValues = configuredOrigins?.trim()
    ? [...configuredOrigins.split(','), ...fallbackOrigins]
    : fallbackOrigins;
  const normalizedOrigins = originValues
    .map((origin) => origin?.trim())
    .filter((origin): origin is string => Boolean(origin))
    .map((origin) => normalizeTrustedBrowserOrigin(origin, environment));

  return Array.from(new Set(normalizedOrigins));
}

export function normalizeRequestOrigin(value: string): string {
  if (value === 'null' || value.includes(',')) {
    throw new Error('Invalid request origin');
  }

  return normalizeOriginUrl(value);
}

export function normalizeTrustedBrowserOrigin(
  value: string,
  environment: string,
): string {
  if (value === 'null' || value.includes('*')) {
    throw new Error(
      'Trusted browser origins must not contain null or wildcard values',
    );
  }

  const origin = normalizeOriginUrl(value);

  if (environment === 'production' && !origin.startsWith('https://')) {
    throw new Error('Trusted browser origins must use HTTPS in production');
  }

  return origin;
}

function normalizeOriginUrl(value: string): string {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error('Origin must be an absolute HTTP or HTTPS URL');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Origin must use HTTP or HTTPS');
  }

  if (url.username || url.password) {
    throw new Error('Origin must not include credentials');
  }

  if (url.pathname !== '/' || url.search || url.hash) {
    throw new Error(
      'Origin must not include a path, query string, or fragment',
    );
  }

  return url.origin;
}

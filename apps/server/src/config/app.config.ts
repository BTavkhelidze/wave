import { registerAs } from '@nestjs/config';

const DEFAULT_API_PREFIX = 'api';
const DEFAULT_HTTP_PORT = 3000;

function parseHttpPort(value: string | undefined): number {
  const port = Number(value?.trim() || DEFAULT_HTTP_PORT);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('HTTP_PORT must be an integer between 1 and 65535');
  }

  return port;
}

export default registerAs('appConfig', () => {
  const port = parseHttpPort(process.env.HTTP_PORT);
  const apiPrefix = process.env.HTTP_API_PREFIX?.trim() || DEFAULT_API_PREFIX;

  return {
    environment: process.env.NODE_ENV?.trim() || 'development',
    apiPrefix,
    http: {
      port,
      host: process.env.HTTP_HOST?.trim() || `http://localhost:${port}/${apiPrefix}`,
    },
  };
});

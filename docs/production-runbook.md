# Production Runbook

This repository is prepared for a Hetzner deployment, but the exact topology is not encoded in the repo. Confirm one deployment option before final launch:

- Hetzner VM with systemd services for `apps/server`, `apps/admin`, and `apps/client`.
- Hetzner VM with containerized app services behind a reverse proxy.
- Hetzner-hosted server plus separate static/Node hosts for the admin and public frontend.

Do not deploy until the chosen topology has a documented owner, hostnames, backup target, and rollback path.

## Runtime

- Node.js: `22.12.0` from `.nvmrc`.
- pnpm: `10.33.3` from `packageManager`.
- PostgreSQL: compatible with the Prisma schema.
- HTTPS reverse proxy in front of every public hostname.

## Required Environment

Use real values from a secret manager. Do not commit environment files.

```dotenv
NODE_ENV=production
HTTP_PORT=5000
HTTP_API_PREFIX=api
HTTP_HOST=https://api.example.com/api
HTTP_TRUST_PROXY_HOPS=1
FRONTEND_URL=https://admin.example.com
ADMIN_APP_URL=https://admin.example.com
PUBLIC_WEBSITE_URL=https://example.com
TRUSTED_BROWSER_ORIGINS=https://admin.example.com,https://example.com
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME
JWT_SECRET=GENERATED_HIGH_ENTROPY_VALUE
JWT_AUDIENCE=wave-admin
JWT_ISSUER=wave-api
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_IN=7d
HETZNER_S3_ENDPOINT=https://OBJECT_STORAGE_ENDPOINT
HETZNER_S3_REGION=REGION
HETZNER_S3_BUCKET=BUCKET
HETZNER_S3_ACCESS_KEY=ACCESS_KEY
HETZNER_S3_SECRET_KEY=SECRET_KEY
MAIL_PROVIDER=smtp
MAIL_HOST=smtp.example.com
MAIL_PORT=465
MAIL_SECURE=true
MAIL_USER=sender@example.com
MAIL_PASSWORD=APP_PASSWORD
MAIL_FROM=Wave Engineering <sender@example.com>
MAIL_TO=admin@example.com
CONTACT_NOTIFICATION_EMAIL=admin@example.com
NEXT_PUBLIC_API_BASE_URL=https://api.example.com/api
VITE_API_BASE_URL=https://api.example.com/api
```

## Build And Deploy Order

1. Confirm the target commit and a clean working tree.
2. Install dependencies: `pnpm install --frozen-lockfile`.
3. Run verification: `pnpm lint`, app typechecks, server tests, Prisma validate, and `pnpm audit --prod --audit-level high`.
4. Take and verify a database backup.
5. Check migration status: `pnpm --filter server exec prisma migrate status --config prisma.config.ts`.
6. Apply migrations: `pnpm --filter server exec prisma migrate deploy --config prisma.config.ts`.
7. Build all apps: `pnpm build`.
8. Start the server: `pnpm --filter server start:prod`.
9. Start or serve the admin and public frontend according to the chosen topology.
10. Verify health and smoke tests before shifting traffic.

## Reverse Proxy

- Terminate HTTPS at the proxy or load balancer.
- Forward `X-Forwarded-For`, `X-Forwarded-Proto`, and `Host`.
- Set `HTTP_TRUST_PROXY_HOPS` to the exact number of trusted proxy hops.
- Route the API prefix to the server and preserve secure cookies.

## Health Checks

- Liveness: `GET https://api.example.com/api/health/live`
- Readiness: `GET https://api.example.com/api/health/ready`

Readiness returns `503` if the database is unavailable and does not expose internal error details.

## Smoke Tests

- Public frontend loads localized home, services, blogs, and contact form.
- Contact form writes a message once and triggers no duplicate route.
- Admin sign-in, refresh, logout, and role-denied flows behave correctly.
- Admin service/blog/message CRUD paths work for the intended roles.
- Upload and delete image flows use the intended bucket.
- API health endpoints return expected status through the reverse proxy.

## Rollback

1. Stop traffic or route traffic back to the previous healthy release.
2. Restart the previous application artifact with the previous environment.
3. Verify `/api/health/live` and `/api/health/ready`.
4. Run smoke tests against the previous release.

Database migrations are forward-only by default. If a migration must be reverted, restore from the verified backup or run a separately reviewed compensating migration. Never run `prisma migrate reset` in production.

## Credential Rotation

Rotate any credential that existed in removed local backup files before production launch:

- Database credentials.
- JWT secrets.
- SMTP credentials.
- Hetzner S3/object-storage access keys.

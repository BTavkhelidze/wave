# AI Architect & Developer Guidelines

## 1. Project Context
- **Monorepo:** Turborepo/Nx workspace.
- **Apps:** `apps/client`, `apps/admin`, `apps/server`.
- **Shared:** `packages/shared`, `packages/types`.

## 2. Core Architecture Rules
- **Feature-First:** All business logic is encapsulated within features (`features/[feature_name]/`).
- **Separation of Concerns:** - `components/`: Purely presentational (Shadcn/Tailwind).
  - `hooks/` & `services/`: Complex business logic, orchestration.
  - `api/`: Tanstack Query hooks (React Query).
- **Communication:** Client apps (client/admin) communicate with `server` exclusively via REST/GraphQL. No direct database access from the client.

## 3. Monorepo Workflow (CRITICAL)
- **Identify App:** Before starting, confirm which app you are editing: `apps/client` or `apps/admin`.
- **DRY (Don't Repeat Yourself):** - If logic is shared between `client` and `admin`, move it to `packages/shared`.
  - Shared TypeScript interfaces must reside in `packages/types`.
- **Prisma Rules:** Only `apps/server` has access to Prisma. Never suggest `import { prisma } ...` in `apps/client` or `apps/admin`.

## 4. Coding Standards
- **Tanstack Query:** Use for all server-state management.
- **Components:** Components must be small and modular. Prefer composition over large, monolithic files.
- **Typing:** Strict TypeScript. No `any`. Use interfaces from `packages/types`.
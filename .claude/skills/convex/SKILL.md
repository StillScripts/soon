---
name: convex
description: Comprehensive Convex development patterns with Better Auth
metadata:
  author: Convex
  version: "2026.4.5"
---

Convex is a fullstack TypeScript development platform with real-time database, file storage, and serverless functions. This project uses standard Convex `query`/`mutation` functions with `@convex-dev/better-auth` for authentication.

**Key Features:**

- Real-time database with automatic subscriptions
- Type-safe queries, mutations, and actions
- Built-in file storage
- Authentication via Better Auth (`@convex-dev/better-auth` component)
- Standard `useQuery`/`useMutation` hooks from `convex/react`

## Core

| Topic     | Description                          | Reference                                      |
| --------- | ------------------------------------ | ---------------------------------------------- |
| Functions | Queries, mutations, actions          | [core-functions](references/core-functions.md) |
| Schema    | Database schema and validators       | [core-schema](references/core-schema.md)       |
| Realtime  | Subscriptions and optimistic updates | [core-realtime](references/core-realtime.md)   |

## Patterns

| Topic          | Description                            | Reference                                                        |
| -------------- | -------------------------------------- | ---------------------------------------------------------------- |
| Best Practices | General Convex patterns and guidelines | [patterns-best-practices](references/patterns-best-practices.md) |

## Advanced

| Topic        | Description                      | Reference                                                    |
| ------------ | -------------------------------- | ------------------------------------------------------------ |
| Agents       | AI agents with tools and RAG     | [advanced-agents](references/advanced-agents.md)             |
| HTTP Actions | Webhooks and HTTP endpoints      | [advanced-http-actions](references/advanced-http-actions.md) |
| File Storage | File uploads, serving, storage   | [advanced-file-storage](references/advanced-file-storage.md) |
| Cron Jobs    | Scheduled background tasks       | [advanced-cron-jobs](references/advanced-cron-jobs.md)       |
| Migrations   | Schema evolution, data backfills | [advanced-migrations](references/advanced-migrations.md)     |
| Components   | Reusable Convex packages         | [advanced-components](references/advanced-components.md)     |

## Security

| Topic          | Description                    | Reference                                      |
| -------------- | ------------------------------ | ---------------------------------------------- |
| Security Check | Quick security audit checklist | [security-check](references/security-check.md) |
| Security Audit | Deep security review patterns  | [security-audit](references/security-audit.md) |

## Quick Start

For most tasks in this project:

1. **Use standard Convex functions** - `query`, `mutation` from `_generated/server`
2. **Authenticate with `authComponent.getAuthUser(ctx)`** - From `@convex-dev/better-auth`
3. **Add validators** - In `packages/validators/` using Zod
4. **Use `useQuery`/`useMutation`** from `convex/react` on the client

## Documentation

- Primary: https://docs.convex.dev
- LLM-optimized: https://docs.convex.dev/llms.txt

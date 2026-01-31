---
name: convex
description: Comprehensive Convex development patterns including Better Convex (cRPC)
metadata:
  author: Convex
  version: "2026.1.31"
---

Convex is a fullstack TypeScript development platform with real-time database, file storage, and serverless functions. This project uses [Better Convex](https://github.com/udecode/better-convex) for type-safe cRPC procedures with TanStack Query integration.

**This project uses Better Convex** for type-safe cRPC procedures with TanStack Query.
See [patterns-better-convex](references/patterns-better-convex.md) for the key patterns used in this codebase.

**Key Features:**

- Real-time database with automatic subscriptions
- Type-safe queries, mutations, and actions
- Built-in file storage and authentication
- cRPC procedures with middleware (via Better Convex)
- TanStack Query integration for React

## Core

| Topic     | Description                           | Reference                                      |
| --------- | ------------------------------------- | ---------------------------------------------- |
| Functions | Queries, mutations, actions with cRPC | [core-functions](references/core-functions.md) |
| Schema    | Database schema and validators        | [core-schema](references/core-schema.md)       |
| Realtime  | Subscriptions and optimistic updates  | [core-realtime](references/core-realtime.md)   |

## Patterns

| Topic          | Description                                       | Reference                                                        |
| -------------- | ------------------------------------------------- | ---------------------------------------------------------------- |
| Better Convex  | **cRPC, folder structure, zid(), type inference** | [patterns-better-convex](references/patterns-better-convex.md)   |
| Best Practices | General Convex patterns and guidelines            | [patterns-best-practices](references/patterns-best-practices.md) |

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

1. **Start with Better Convex patterns** - See [patterns-better-convex](references/patterns-better-convex.md)
2. **Use cRPC procedures** - Not standard Convex functions
3. **Add validators** - In `packages/validators/` using Zod
4. **Use `.output()` with `zid()`** - For proper type inference

## Documentation

- Primary: https://docs.convex.dev
- LLM-optimized: https://docs.convex.dev/llms.txt
- Better Convex: https://www.better-convex.com

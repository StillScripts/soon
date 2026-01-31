# Convex Functions

This directory contains all Convex backend functions.

## Structure

```
convex/
├── functions/          # API endpoints
│   ├── auth.ts         # Better Auth integration
│   └── things.ts       # Things CRUD (example model)
├── lib/
│   └── crpc.ts         # cRPC builder with auth middleware
├── schema.ts           # Database schema definition
├── auth.config.ts      # Better Auth configuration
└── _generated/         # Auto-generated types (don't edit)
```

## Patterns

### cRPC Builder

All authenticated functions use the cRPC pattern from `lib/crpc.ts`:

```ts
import { authMutation, authQuery } from "../lib/crpc"

export const get = authQuery
	.input(getSchema)
	.output(outputSchema)
	.query(async ({ ctx, input }) => {
		// ctx.userId is guaranteed to exist
	})
```

### Schema + Validators

- **Schema** (`schema.ts`): Convex table definitions
- **Validators** (`@repo/validators`): Shared Zod schemas for input validation
- **Output schemas**: Use `zid()` for type-safe document IDs

### Adding a New Model

1. Add table to `schema.ts`
2. Create validators in `@repo/validators`
3. Create functions in `functions/your-model.ts`
4. Use `authQuery`/`authMutation` for protected routes

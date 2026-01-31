# Backend

Convex backend with Better Auth integration.

## Development

```bash
bunx convex dev
```

This starts the Convex development server and syncs functions to your deployment.

## Structure

```
convex/
├── functions/          # API functions (queries, mutations)
│   ├── auth.ts         # Auth functions and Better Auth setup
│   └── things.ts       # Things CRUD operations
├── lib/
│   └── crpc.ts         # cRPC builder with auth middleware
├── schema.ts           # Database schema
└── auth.config.ts      # Better Auth configuration
```

## Patterns

This backend uses **Better Convex** patterns:

- **cRPC**: Type-safe procedures with `authQuery` and `authMutation` builders
- **Zod Validation**: Input/output schemas with `zid()` for document IDs
- **Auth Middleware**: Automatic user context injection

Example function:

```ts
export const list = authQuery
  .input(listThingsSchema)
  .output(z.array(thingOutputSchema))
  .query(async ({ ctx, input }) => {
    return ctx.db
      .query("things")
      .withIndex("by_user", (q) => q.eq("userId", ctx.userId))
      .collect()
  })
```

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Required:

- `CONVEX_DEPLOYMENT` - Your Convex deployment name

## Deployment

```bash
bunx convex deploy
```

---
title: Convex Backend
description: Adding Convex as the real-time, serverless backend for the application.
---

## What We Did

Added Convex to `packages/backend` as the application's backend-as-a-service solution, providing real-time database, serverless functions, and TypeScript-first development.

## Why Convex

**Convex provides a complete backend solution** that aligns perfectly with our Bun-first, TypeScript-native, and modern development approach.

**Key reasons:**
- **Real-time by default**: Live queries automatically update when data changes
- **TypeScript-first**: End-to-end type safety from database to client
- **Serverless**: No infrastructure to manage, scales automatically
- **Developer experience**: Hot reload, local dev server, built-in debugging
- **React integration**: First-class React hooks (`useQuery`, `useMutation`)
- **No ORM needed**: Direct database access with full TypeScript inference

**Alternatives considered:**
- **Supabase**: Excellent choice, but Convex's real-time model is simpler and more integrated
- **Firebase**: Good real-time capabilities, but TypeScript support is not as strong
- **Traditional backend (Express + DB)**: Full control, but requires managing infrastructure and scaling
- **tRPC + Prisma**: Type-safe, but more complex setup and no built-in real-time

Convex was chosen because it provides the best developer experience for real-time TypeScript applications with minimal setup.

## Commands Used

```bash
# Initialize Convex in the backend package
cd packages/backend
bunx convex dev

# This command:
# 1. Creates a new Convex project
# 2. Generates convex/ directory
# 3. Sets up TypeScript configuration
# 4. Creates .env.local with deployment URL
# 5. Starts local dev server
```

## Implementation Details

### Package Structure

```
packages/backend/
├── convex/                    # Convex functions directory
│   ├── _generated/           # Auto-generated types and server code
│   │   ├── api.d.ts         # API types for client
│   │   ├── dataModel.d.ts   # Database schema types
│   │   └── server.ts        # Server imports (query, mutation, etc.)
│   ├── README.md            # Convex functions documentation
│   └── tsconfig.json        # Convex-specific TypeScript config
├── .env.local               # Convex deployment URL (gitignored)
├── .gitignore              # Ignores .env.local and generated files
├── package.json            # Contains convex dependency
├── tsconfig.json           # Backend TypeScript configuration
└── README.md               # Package documentation
```

### Configuration

**package.json:**
```json
{
  "name": "backend",
  "module": "index.ts",
  "type": "module",
  "private": true,
  "dependencies": {
    "convex": "^1.31.6"
  },
  "devDependencies": {
    "@types/bun": "latest"
  }
}
```

**Convex TypeScript config (convex/tsconfig.json):**
- Targets ESNext with modern features
- Uses Bundler module resolution (compatible with Bun)
- Enables JSX for React components
- Strict mode enabled for maximum type safety

## Key Dependencies

- `convex`: ^1.31.6 - Complete backend platform with database, functions, and real-time subscriptions

## How Convex Works

### Query Functions

Convex queries are reactive database reads that automatically update when data changes:

```ts
// convex/myFunctions.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const myQueryFunction = query({
  args: {
    first: v.number(),
    second: v.string(),
  },
  handler: async (ctx, args) => {
    // Read from database with full type safety
    const documents = await ctx.db.query("tablename").collect();
    return documents;
  },
});
```

**Usage in React:**
```ts
const data = useQuery(api.myFunctions.myQueryFunction, {
  first: 10,
  second: "hello",
});
// Data automatically updates when database changes
```

### Mutation Functions

Mutations modify database state with optimistic updates and automatic revalidation:

```ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const myMutationFunction = mutation({
  args: {
    first: v.string(),
    second: v.string(),
  },
  handler: async (ctx, args) => {
    const message = { body: args.first, author: args.second };
    const id = await ctx.db.insert("messages", message);
    return await ctx.db.get(id);
  },
});
```

**Usage in React:**
```ts
const mutation = useMutation(api.myFunctions.myMutationFunction);

function handleButtonPress() {
  mutation({ first: "Hello!", second: "me" });
}
```

## Integration with Existing Code

### With the Web App

The backend package is designed to be imported into the Next.js `web` app:

1. **Convex Provider**: Wrap the app in `ConvexProvider` (to be added)
2. **Auto-generated API**: Import types from `convex/_generated/api`
3. **React Hooks**: Use `useQuery` and `useMutation` in components
4. **Type Safety**: Full TypeScript inference from backend to frontend

### With Bun

Convex works seamlessly with Bun:
- Uses `bunx convex` instead of `npx convex`
- Compatible with Bun's module resolution
- Leverages Bun's fast TypeScript transpilation
- No additional configuration needed

## Context for AI

When working with Convex:
- **Functions go in `convex/` directory**: All backend logic lives here
- **Types are auto-generated**: Never manually edit `_generated/` files
- **Use validators**: Always validate arguments with `v` from `convex/values`
- **Database queries are reactive**: No need for manual cache invalidation
- **Use Bun commands**: Always use `bunx convex` instead of `npx convex`
- **Development workflow**: Run `bunx convex dev` for local development with hot reload

**Common patterns:**
- Query for reads: `query({ args: {...}, handler: async (ctx, args) => {...} })`
- Mutation for writes: `mutation({ args: {...}, handler: async (ctx, args) => {...} })`
- Actions for external API calls: `action({ args: {...}, handler: async (ctx, args) => {...} })`

## Outcomes

### Before
- No backend infrastructure
- No database
- No real-time capabilities
- Manual state management needed

### After
- Complete serverless backend
- Real-time reactive database
- TypeScript-first development
- Automatic type generation and inference
- Built-in React integration

## Testing/Verification

```bash
# Start Convex development server
cd packages/backend
bunx convex dev

# Expected output:
# ✓ Convex dev server running
# ✓ Watching for file changes in convex/
# ✓ Dashboard available at https://dashboard.convex.dev
```

Expected results:
- Convex dev server starts successfully
- TypeScript types are generated in `convex/_generated/`
- Dashboard URL is provided for viewing data and logs
- Hot reload works when editing functions

## Next Steps

1. **Create database schema**: Define tables in a Convex schema file
2. **Write first functions**: Add queries and mutations for core features
3. **Integrate with web app**: Add ConvexProvider to Next.js app
4. **Implement authentication**: Add Convex auth for user management
5. **Deploy**: Push functions to production with `bunx convex deploy`

## Related Documentation

- [Convex Documentation](https://docs.convex.dev)
- [Convex Quickstart](https://docs.convex.dev/quickstart)
- [Database Reading](https://docs.convex.dev/database/reading-data)
- [Database Writing](https://docs.convex.dev/database/writing-data)
- [React Integration](https://docs.convex.dev/client/react)
- [TypeScript Guide](https://docs.convex.dev/typescript)

---
title: Better Auth Integration
description: Adding authentication to Convex using Better Auth with email/password support.
---

## What We Did

Added Better Auth to the Convex backend for user authentication. This provides a foundation for email/password authentication with the ability to expand to OAuth providers later.

## Why Better Auth

**Key reasons:**

- **Convex-native integration**: `@convex-dev/better-auth` provides seamless adapter for Convex's database
- **TypeScript-first**: Full type safety from auth config to user sessions
- **Minimal setup**: Works with Convex's serverless model without external auth services
- **Extensible**: Supports OAuth, magic links, 2FA via plugins

**Alternatives considered:**

- **Clerk**: Excellent UX but adds external dependency and cost
- **Auth.js (NextAuth)**: More complex setup with Convex, designed for traditional databases
- **Convex Auth (built-in)**: Less feature-rich than Better Auth

## Implementation Details

### Package Dependencies

```json
{
	"dependencies": {
		"@convex-dev/better-auth": "^0.10.10",
		"better-auth": "1.4.9",
		"convex": "^1.31.6"
	}
}
```

**Critical**: Pin `better-auth` to exactly `1.4.9`. The `@convex-dev/better-auth` adapter has strict version requirements. Using `^1.4.17` or later causes type incompatibility errors:

```
Type 'AdapterFactory' is not assignable to type 'DBAdapterInstance<BetterAuthOptions>'
```

### File Structure

```
packages/backend/convex/
├── auth.ts            # Auth instance and helpers
├── auth.config.ts     # Convex auth configuration
├── convex.config.ts   # Better Auth component registration
└── _generated/        # Auto-generated types
```

### Component Registration (`convex.config.ts`)

```typescript
import betterAuth from "@convex-dev/better-auth/convex.config"
import { defineApp } from "convex/server"

const app = defineApp()
app.use(betterAuth)

export default app
```

### Auth Configuration (`auth.config.ts`)

```typescript
import { getAuthConfigProvider } from "@convex-dev/better-auth/auth-config"
import type { AuthConfig } from "convex/server"

export default {
	providers: [getAuthConfigProvider()],
} satisfies AuthConfig
```

### Auth Instance (`auth.ts`)

```typescript
import { type GenericCtx, createClient } from "@convex-dev/better-auth"
import { convex } from "@convex-dev/better-auth/plugins"
import { betterAuth } from "better-auth/minimal"

import { components } from "./_generated/api"
import type { DataModel } from "./_generated/dataModel"
import { query } from "./_generated/server"
import authConfig from "./auth.config"

const siteUrl = process.env.SITE_URL!

// Component client for Convex integration
export const authComponent = createClient<DataModel>(components.betterAuth)

export const createAuth = (ctx: GenericCtx<DataModel>) => {
	return betterAuth({
		baseURL: siteUrl,
		database: authComponent.adapter(ctx),
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: false,
		},
		plugins: [convex({ authConfig })],
	})
}

// Helper to get current authenticated user
export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		return authComponent.getAuthUser(ctx)
	},
})
```

**Important TypeScript note**: Use `import type` for `DataModel` when `verbatimModuleSyntax` is enabled:

```typescript
// Correct
import type { DataModel } from "./_generated/dataModel"
// Wrong - causes TS1484 error
import { DataModel } from "./_generated/dataModel"
```

## Environment Variables

Set these in Convex:

```bash
# Generate auth secret
bunx convex env set BETTER_AUTH_SECRET=$(openssl rand -base64 32)

# Set site URL for auth callbacks
bunx convex env set SITE_URL http://localhost:3000
```

## Context for AI

When working with Better Auth in this codebase:

- **Version pinning is critical**: Always use `better-auth: "1.4.9"` exactly, not a caret range
- **Import types correctly**: Use `import type` for DataModel due to verbatimModuleSyntax
- **Auth component**: Access via `authComponent` exported from `auth.ts`
- **Creating auth instance**: Use `createAuth(ctx)` within Convex functions
- **Getting current user**: Use `authComponent.getAuthUser(ctx)` or the `getCurrentUser` query

### Common Errors

| Error                                        | Cause                          | Fix                                |
| -------------------------------------------- | ------------------------------ | ---------------------------------- |
| `Type 'AdapterFactory' is not assignable...` | `better-auth` version mismatch | Pin to `1.4.9` exactly             |
| `TS1484: 'DataModel' is a type...`           | Missing type-only import       | Use `import type { DataModel }`    |
| `SITE_URL` undefined                         | Missing env var                | Run `bunx convex env set SITE_URL` |

## Outcomes

### Before

- No authentication system
- All Convex functions publicly accessible

### After

- Better Auth integrated with Convex
- Email/password authentication ready
- `getCurrentUser` query available for auth checks
- Foundation for protected routes and user-specific data

## Next Steps

To complete the authentication flow, the following still needs to be added:

1. **HTTP Routes** (`convex/http.ts`): Register Better Auth route handlers
2. **Client Auth** (`apps/web/lib/auth-client.ts`): Browser-side auth instance
3. **Server Auth** (`apps/web/lib/auth-server.ts`): Next.js server helpers
4. **API Route** (`apps/web/app/api/auth/[...all]/route.ts`): Proxy auth requests
5. **Provider Update**: Replace `ConvexProvider` with `ConvexBetterAuthProvider`
6. **Login/Signup UI**: Forms for user authentication

See the [Better Auth + Convex + Next.js guide](https://labs.convex.dev/better-auth/framework-guides/next) for full implementation details.

## Related Documentation

- [Better Auth Documentation](https://www.better-auth.com)
- [Convex Better Auth Guide](https://labs.convex.dev/better-auth)
- [Convex Backend Guide](./05-convex-backend)

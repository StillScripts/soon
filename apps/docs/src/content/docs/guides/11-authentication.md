---
title: Authentication
description: Adding login/signup forms with TanStack Form and protected routes with user-owned data.
---

## What We Did

Built the authentication UI layer on top of Better Auth, including:
- Login/signup forms using TanStack Form and shadcn Field components
- Protected page that requires authentication
- User-owned "things" with CRUD operations
- Session-aware UI with sign out functionality

## Why This Approach

**Key reasons:**
- **TanStack Form**: Headless form library with excellent TypeScript support and validation
- **Field components**: Consistent form styling using existing shadcn/ui Field primitives
- **Client-side auth check**: Better Auth's `useSession` hook for reactive auth state
- **User ownership pattern**: Simple `userId` field on data for multi-tenant isolation

**Alternatives considered:**
- **React Hook Form**: More popular but TanStack Form has better TypeScript inference
- **Server-side protection**: Could use middleware, but client-side is simpler for this demo
- **Separate login/signup pages**: Combined form is more compact for simple auth flows

## Commands Used

```bash
# Install TanStack Form
bun add @tanstack/react-form --filter=web

# Clear old data without userId field
bunx convex run things:deleteAllThings

# Push schema changes
bunx convex dev --once
```

## Implementation Details

### Schema Changes

Updated `packages/backend/convex/schema.ts` to add user ownership:

```typescript
export default defineSchema({
  things: defineTable({
    title: v.string(),
    userId: v.string(),
  }).index("by_user", ["userId"]),
})
```

The `by_user` index enables efficient queries for a user's things.

### Protected Mutations

All CRUD operations in `packages/backend/convex/things.ts` now require authentication:

```typescript
import { authComponent } from "./auth"

export const createThing = mutation({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx)
    if (!user) {
      throw new Error("Not authenticated")
    }
    const userId = user._id as string
    return await ctx.db.insert("things", {
      title: args.title,
      userId,
    })
  },
})

export const getThings = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx)
    if (!user) {
      return []
    }
    const userId = user._id as string
    return await ctx.db
      .query("things")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect()
  },
})
```

### Auth Form Component

Created `apps/web/components/auth-form.tsx` using TanStack Form:

```typescript
"use client"

import { useForm } from "@tanstack/react-form"
import { authClient } from "@/lib/auth-client"
import { Field, FieldError, FieldGroup, FieldLabel } from "@repo/ui/components/ui/field"
import { Input } from "@repo/ui/components/ui/input"
import { Button } from "@repo/ui/components/ui/button"

export function AuthForm() {
  const [mode, setMode] = useState<"login" | "signup">("login")

  const form = useForm({
    defaultValues: { email: "", password: "", name: "" },
    onSubmit: async ({ value }) => {
      if (mode === "signup") {
        await authClient.signUp.email({
          email: value.email,
          password: value.password,
          name: value.name,
        })
      } else {
        await authClient.signIn.email({
          email: value.email,
          password: value.password,
        })
      }
    },
  })

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
      <FieldGroup>
        <form.Field name="email" validators={{
          onChange: ({ value }) => {
            if (!value) return "Email is required"
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email"
          }
        }}>
          {(field) => (
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input
                type="email"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.errors.length > 0 && (
                <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
              )}
            </Field>
          )}
        </form.Field>
        {/* Password field similar pattern */}
        <Button type="submit">
          {mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </FieldGroup>
    </form>
  )
}
```

### Protected Page

Updated `apps/web/app/page.tsx` to check auth state:

```typescript
"use client"

import { authClient } from "@/lib/auth-client"
import { AuthForm } from "@/components/auth-form"

export default function Home() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return <div>Loading...</div>
  }

  if (!session) {
    return <AuthForm />
  }

  return (
    <div>
      <header>
        <span>{session.user?.email}</span>
        <Button onClick={() => authClient.signOut()}>Sign out</Button>
      </header>
      <ThingsManager />
    </div>
  )
}
```

### TypeScript Path Alias

Added `@/*` path alias in `apps/web/tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## Key Dependencies

**apps/web:**
- `@tanstack/react-form`: ^1.27.7 - Headless form state management

## Integration with Existing Code

- **Better Auth**: Uses `authClient` from `@/lib/auth-client` for sign in/up/out
- **Convex**: Uses `authComponent.getAuthUser(ctx)` to get current user in backend
- **shadcn/ui**: Uses Field, Input, Button, Card components for consistent styling

## Context for AI

When working with authentication in this codebase:

- **Get current user in Convex**: `const user = await authComponent.getAuthUser(ctx)`
- **User ID is `user._id`**: Cast to string with `user._id as string`
- **Check session on client**: `const { data: session } = authClient.useSession()`
- **Sign out**: `await authClient.signOut()`
- **Form validation**: Use TanStack Form's `validators.onChange` for field-level validation

### Adding Auth to New Tables

1. Add `userId: v.string()` to schema
2. Add `.index("by_user", ["userId"])` for efficient queries
3. In mutations: check `authComponent.getAuthUser(ctx)` and throw if null
4. In queries: filter by `userId` using the index

### Data Migration Pattern

When adding required fields to existing data:

```typescript
// 1. Make field optional temporarily
userId: v.optional(v.string())

// 2. Deploy and run migration
bunx convex dev --once
bunx convex run tableName:migrateOrDelete

// 3. Make field required
userId: v.string()

// 4. Deploy final schema
bunx convex dev --once
```

## Outcomes

### Before
- Things table had no user association
- Anyone could see all things
- No authentication UI

### After
- Things belong to users via `userId` field
- Users only see their own things
- Login/signup forms with validation
- Sign out functionality
- Protected page redirects to auth form

## Testing/Verification

```bash
# Start dev server
turbo dev --filter=web
```

1. Visit http://localhost:3000
2. See login form (not authenticated)
3. Click "Sign up" and create account
4. After signup, see Things Manager
5. Create a thing - it's associated with your user
6. Sign out and sign in with different account
7. New account sees empty things list (isolation works)

## Next Steps

- Add password reset flow
- Add OAuth providers (Google, GitHub)
- Add email verification
- Add user profile page
- Add sharing/collaboration features

## Related Documentation

- [Better Auth Integration](./08-better-auth) - Backend auth setup
- [shadcn/ui Components](./07-shadcn-ui-components) - UI component library
- [TanStack Form Documentation](https://tanstack.com/form/latest)
- [Better Auth React Reference](https://www.better-auth.com/docs/reference/react)

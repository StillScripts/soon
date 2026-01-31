---
title: Testing Better Convex with convex-test
description: How to test Better Convex (cRPC) functions directly using convex-test's withIdentity() mocking.
---

## What We Did

Enabled `convex-test` to work directly with Better Convex functions by modifying the auth middleware to check both `ctx.auth.getUserIdentity()` (convex-test's mock) and better-auth's database lookup. This eliminates the need for duplicate "internal" functions and allows tests to exercise the actual production code.

## The Problem

The initial approach to testing Better Convex functions was to create duplicate "internal" functions (`thingsInternal.ts`) that bypassed the auth middleware and accepted `userId` as a direct parameter. This had significant drawbacks:

1. **Code duplication** - 154 lines of duplicated business logic
2. **Testing the wrong code** - Tests exercised internal functions, not the production code
3. **Maintenance burden** - Any changes to `things.ts` required mirroring in `thingsInternal.ts`
4. **False confidence** - Tests could pass while production code had bugs

The claim was that "convex-test can't work with Better Convex" — this turned out to be incorrect.

## Why This Approach Works

The key insight is understanding how both systems handle authentication:

| System      | Auth Mechanism                   | In Tests                    |
| ----------- | -------------------------------- | --------------------------- |
| convex-test | `ctx.auth.getUserIdentity()`     | Mocked via `withIdentity()` |
| better-auth | `authComponent.getAuthUser(ctx)` | Queries database (no users) |

The original Better Convex middleware only checked `authComponent.getAuthUser()`. By adding a check for `ctx.auth.getUserIdentity()` first, the middleware now works with convex-test's built-in mocking.

## Implementation Details

### Modified Auth Middleware (`convex/lib/crpc.ts`)

```typescript
/**
 * Get authenticated user from context.
 * Supports both convex-test (via ctx.auth.getUserIdentity) and production (via better-auth).
 * This allows testing Better Convex functions directly with convex-test's withIdentity().
 */
async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
	// Check for convex-test mock identity first (enables testing with t.withIdentity())
	const testIdentity = await ctx.auth.getUserIdentity()
	if (testIdentity) {
		// In tests, use the identity's subject as userId
		return { _id: testIdentity.subject, isTestUser: true as const }
	}

	// Production: use better-auth
	const user = await authComponent.getAuthUser(ctx)
	if (user) {
		return { ...user, isTestUser: false as const }
	}

	return null
}

// Auth query - supports both convex-test and better-auth
export const authQuery = c.query.meta({ auth: "required" }).use(async ({ ctx, next }) => {
	const user = await getAuthenticatedUser(ctx)
	if (!user) {
		throw new CRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" })
	}
	return next({ ctx: { ...ctx, user, userId: user._id } })
})
```

The `isTestUser` discriminated union allows code to distinguish between test and production contexts if needed, though most code only uses `userId`.

### Test Pattern

```typescript
import { convexTest } from "convex-test"

import { api } from "./_generated/api"
import schema from "./schema"

// Module loading for convex-test
const modules = import.meta.glob("./**/*.ts")

/** Create a test instance with a mocked user identity */
function asUser(userId: string) {
	return convexTest(schema, modules).withIdentity({ subject: userId })
}

describe("things.create", () => {
	it("should create a thing", async () => {
		const t = asUser("user_123")

		const id = await t.mutation(api.things.create, {
			title: "My Thing",
		})

		expect(id).toBeDefined()
	})
})
```

### Multi-User Tests

For tests that need to verify user isolation:

```typescript
it("should maintain isolation between users", async () => {
	const t = convexTest(schema, modules)
	const user1 = t.withIdentity({ subject: "user_1" })
	const user2 = t.withIdentity({ subject: "user_2" })

	// User 1 creates a thing
	const id = await user1.mutation(api.things.create, { title: "User 1's Thing" })

	// User 2 cannot access it
	const thing = await user2.query(api.things.get, { id })
	expect(thing).toBeNull()
})
```

### File Storage in Tests

convex-test provides storage mocking via `t.run()`:

```typescript
it("should create thing with image", async () => {
	const t = asUser("user_123")

	// Create a storage entry
	const storageId = await t.run(async (ctx) => {
		return ctx.storage.store(new Blob(["test image content"]))
	})

	const id = await t.mutation(api.things.create, {
		title: "Thing with Image",
		imageId: storageId as string,
	})

	const thing = await t.query(api.things.get, { id })
	expect(thing?.imageUrl).not.toBeNull()
})
```

## Files Changed

### Deleted

- `packages/backend/convex/functions/thingsInternal.ts` - 154 lines of duplicated code removed

### Modified

- `packages/backend/convex/lib/crpc.ts` - Added `getAuthenticatedUser()` helper
- `packages/backend/convex/functions/things.test.ts` - Rewritten to use public API

## Key Dependencies

Already installed from [Guide 10: Vitest Testing Setup](/guides/10-vitest-testing):

- `convex-test`: ^0.0.41 - Convex testing utilities
- `vitest`: ^4.0.18 - Test runner
- `vite`: ^7.3.1 - Required for `import.meta.glob`

## Commands

```bash
# Run all backend tests
cd packages/backend && bun run test

# Run in watch mode
bun run test:watch

# Run with coverage
bun run test:coverage
```

## Context for AI

When working with Convex tests in this codebase:

1. **Always use `asUser()`** - Creates a test instance with mocked auth
2. **Test the public API** - Use `api.things.create`, not internal functions
3. **Use `withIdentity({ subject: userId })`** - The `subject` becomes `ctx.userId`
4. **Fresh test instance per test** - Call `asUser()` or `convexTest()` in each test
5. **Storage via `t.run()`** - Use for file upload testing

### Adding Tests for New Functions

1. Import the function from `api`:

   ```typescript
   import { api } from "./_generated/api"
   ```

2. Create authenticated test instance:

   ```typescript
   const t = asUser("test_user")
   ```

3. Call the function:

   ```typescript
   const result = await t.mutation(api.newModule.newFunction, { arg: "value" })
   ```

4. Assert results:
   ```typescript
   expect(result).toBeDefined()
   ```

## Outcomes

### Before

- Duplicate internal functions for testing (154 lines)
- Tests didn't exercise production code
- False confidence in test coverage

### After

- Single source of truth for business logic
- Tests use actual production functions (`api.things.*`)
- 40 tests covering CRUD, user isolation, storage, and edge cases
- No code duplication

## Testing/Verification

```bash
cd packages/backend && bun run test
```

Expected output:

```
✓ convex/functions/things.test.ts (40 tests) 578ms

 Test Files  1 passed (1)
      Tests  40 passed (40)
```

## Related Documentation

- [convex-test Documentation](https://docs.convex.dev/testing/unit-testing)
- [Guide 10: Vitest Testing Setup](/guides/10-vitest-testing)
- [Guide 12: Better Convex Migration](/guides/12-better-convex-migration)
- [Guide 16: Better Convex Folder Structure](/guides/16-better-convex-folder-structure)

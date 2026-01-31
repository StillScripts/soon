# Convex Security Check

A quick security audit checklist for Convex applications covering authentication, function exposure, argument validation, row-level access control, and environment variable handling.

## Documentation Sources

- Primary: https://docs.convex.dev/auth
- Production Security: https://docs.convex.dev/production
- Functions Auth: https://docs.convex.dev/auth/functions-auth
- LLM-optimized: https://docs.convex.dev/llms.txt

## Security Checklist

### 1. Authentication

- [ ] Authentication provider configured (Clerk, Auth0, etc.)
- [ ] All sensitive queries check `ctx.auth.getUserIdentity()`
- [ ] Unauthenticated access explicitly allowed where intended
- [ ] Session tokens properly validated

### 2. Function Exposure

- [ ] Public functions (`query`, `mutation`, `action`) reviewed
- [ ] Internal functions use `internalQuery`, `internalMutation`, `internalAction`
- [ ] No sensitive operations exposed as public functions
- [ ] HTTP actions validate origin/authentication

### 3. Argument Validation

- [ ] All functions have explicit `args` validators
- [ ] All functions have explicit `returns` validators
- [ ] No `v.any()` used for sensitive data
- [ ] ID validators use correct table names

### 4. Row-Level Access Control

- [ ] Users can only access their own data
- [ ] Admin functions check user roles
- [ ] Shared resources have proper access checks
- [ ] Deletion functions verify ownership

### 5. Environment Variables

- [ ] API keys stored in environment variables
- [ ] No secrets in code or schema
- [ ] Different keys for dev/prod environments
- [ ] Environment variables accessed only in actions

## Authentication Check Pattern

```typescript
async function requireAuth(ctx: QueryCtx | MutationCtx) {
	const identity = await ctx.auth.getUserIdentity()
	if (!identity) {
		throw new ConvexError("Authentication required")
	}
	return identity
}

export const getMyProfile = query({
	args: {},
	handler: async (ctx) => {
		const identity = await requireAuth(ctx)

		return await ctx.db
			.query("users")
			.withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
			.unique()
	},
})
```

## Function Exposure Check

```typescript
// PUBLIC - Exposed to clients (review carefully!)
export const listPublicPosts = query({
	args: {},
	handler: async (ctx) => {
		// Anyone can call this - intentionally public
		return await ctx.db
			.query("posts")
			.withIndex("by_public", (q) => q.eq("isPublic", true))
			.collect()
	},
})

// INTERNAL - Only callable from other Convex functions
export const _updateUserCredits = internalMutation({
	args: { userId: v.id("users"), amount: v.number() },
	handler: async (ctx, args) => {
		await ctx.db.patch(args.userId, { credits: args.amount })
		return null
	},
})
```

## Row-Level Access Control Check

```typescript
// Verify ownership before update
export const updateTask = mutation({
	args: { taskId: v.id("tasks"), title: v.string() },
	handler: async (ctx, args) => {
		const identity = await requireAuth(ctx)
		const task = await ctx.db.get(args.taskId)

		if (!task || task.userId !== identity.tokenIdentifier) {
			throw new ConvexError("Not authorized to update this task")
		}

		await ctx.db.patch(args.taskId, { title: args.title })
		return null
	},
})
```

## Best Practices

- Always verify user identity before returning sensitive data
- Use internal functions for sensitive operations
- Validate all arguments with strict validators
- Check ownership before update/delete operations
- Store API keys in environment variables
- Review all public functions for security implications

## Common Pitfalls

1. **Missing authentication checks** - Always verify identity
2. **Exposing internal operations** - Use internalMutation/Query
3. **Trusting client-provided IDs** - Verify ownership
4. **Using v.any() for arguments** - Use specific validators
5. **Hardcoding secrets** - Use environment variables

# Convex Security Audit

Comprehensive security review patterns for Convex applications including authorization logic, data access boundaries, action isolation, rate limiting, and protecting sensitive operations.

## Documentation Sources

- Primary: https://docs.convex.dev/auth/functions-auth
- Production Security: https://docs.convex.dev/production
- LLM-optimized: https://docs.convex.dev/llms.txt

## Security Audit Areas

1. **Authorization Logic** - Who can do what
2. **Data Access Boundaries** - What data users can see
3. **Action Isolation** - Protecting external API calls
4. **Rate Limiting** - Preventing abuse
5. **Sensitive Operations** - Protecting critical functions

## Authorization Logic - RBAC

```typescript
type UserRole = "user" | "moderator" | "admin" | "superadmin"

const roleHierarchy: Record<UserRole, number> = {
	user: 0,
	moderator: 1,
	admin: 2,
	superadmin: 3,
}

export async function requireRole(
	ctx: QueryCtx | MutationCtx,
	minRole: UserRole
): Promise<Doc<"users">> {
	const user = await getUser(ctx)

	if (!user) {
		throw new ConvexError({ code: "UNAUTHENTICATED", message: "Authentication required" })
	}

	const userRoleLevel = roleHierarchy[user.role as UserRole] ?? 0
	const requiredLevel = roleHierarchy[minRole]

	if (userRoleLevel < requiredLevel) {
		throw new ConvexError({ code: "FORBIDDEN", message: `Role '${minRole}' or higher required` })
	}

	return user
}
```

## Data Access Boundaries

```typescript
// Users can only see their own data
export const getMyData = query({
	args: {},
	handler: async (ctx) => {
		const user = await getUser(ctx)
		if (!user) return []

		return await ctx.db
			.query("userData")
			.withIndex("by_user", (q) => q.eq("userId", user._id))
			.collect()
	},
})

// Verify ownership before returning sensitive data
export const getSensitiveItem = query({
	args: { itemId: v.id("sensitiveItems") },
	handler: async (ctx, args) => {
		const user = await getUser(ctx)
		if (!user) return null

		const item = await ctx.db.get(args.itemId)

		// Don't reveal if item exists
		if (!item || item.ownerId !== user._id) {
			return null
		}

		return item
	},
})
```

## Action Isolation

```typescript
"use node"

export const callExternalAPI = action({
	args: { query: v.string() },
	returns: v.object({ result: v.string() }),
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) {
			throw new ConvexError("Authentication required")
		}

		// Get API key from environment (not hardcoded)
		const apiKey = process.env.EXTERNAL_API_KEY
		if (!apiKey) {
			throw new Error("API key not configured")
		}

		// Log usage for audit trail
		await ctx.runMutation(internal.audit.logAPICall, {
			userId: identity.tokenIdentifier,
			endpoint: "external-api",
			timestamp: Date.now(),
		})

		const response = await fetch("https://api.example.com/query", {
			method: "POST",
			headers: { Authorization: `Bearer ${apiKey}` },
			body: JSON.stringify({ query: args.query }),
		})

		if (!response.ok) {
			// Don't expose external API error details
			throw new ConvexError("External service unavailable")
		}

		return { result: sanitizeResponse(await response.json()) }
	},
})
```

## Rate Limiting

```typescript
const RATE_LIMITS = {
	message: { requests: 10, windowMs: 60000 }, // 10 per minute
	upload: { requests: 5, windowMs: 300000 }, // 5 per 5 minutes
	api: { requests: 100, windowMs: 3600000 }, // 100 per hour
}

export const checkRateLimit = mutation({
	args: {
		userId: v.string(),
		action: v.union(v.literal("message"), v.literal("upload"), v.literal("api")),
	},
	returns: v.object({ allowed: v.boolean(), retryAfter: v.optional(v.number()) }),
	handler: async (ctx, args) => {
		const limit = RATE_LIMITS[args.action]
		const now = Date.now()
		const windowStart = now - limit.windowMs

		const requests = await ctx.db
			.query("rateLimits")
			.withIndex("by_user_and_action", (q) => q.eq("userId", args.userId).eq("action", args.action))
			.filter((q) => q.gt(q.field("timestamp"), windowStart))
			.collect()

		if (requests.length >= limit.requests) {
			const retryAfter = requests[0].timestamp + limit.windowMs - now
			return { allowed: false, retryAfter }
		}

		await ctx.db.insert("rateLimits", {
			userId: args.userId,
			action: args.action,
			timestamp: now,
		})

		return { allowed: true }
	},
})
```

## Sensitive Operations Protection

```typescript
// Two-factor confirmation for dangerous operations
export const deleteAllUserData = mutation({
	args: {
		userId: v.id("users"),
		confirmationCode: v.string(),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const admin = await requireRole(ctx, "superadmin")

		// Verify confirmation code
		const confirmation = await ctx.db
			.query("confirmations")
			.withIndex("by_admin_and_code", (q) =>
				q.eq("adminId", admin._id).eq("code", args.confirmationCode)
			)
			.filter((q) => q.gt(q.field("expiresAt"), Date.now()))
			.unique()

		if (!confirmation || confirmation.action !== "delete_user_data") {
			throw new ConvexError("Invalid or expired confirmation code")
		}

		// Delete confirmation to prevent reuse
		await ctx.db.delete(confirmation._id)

		// Schedule deletion (don't do it inline)
		await ctx.scheduler.runAfter(0, internal.admin._performDeletion, {
			userId: args.userId,
			requestedBy: admin._id,
		})

		// Audit log
		await ctx.db.insert("auditLogs", {
			action: "delete_user_data",
			targetUserId: args.userId,
			performedBy: admin._id,
			timestamp: Date.now(),
		})

		return null
	},
})
```

## Best Practices

- Implement defense in depth (multiple security layers)
- Log all sensitive operations for audit trails
- Use confirmation codes for destructive actions
- Rate limit all user-facing endpoints
- Never expose internal API keys or errors
- Review access patterns regularly

## Common Pitfalls

1. **Single point of failure** - Implement multiple auth checks
2. **Missing audit logs** - Log all sensitive operations
3. **Trusting client data** - Always validate server-side
4. **Exposing error details** - Sanitize error messages
5. **No rate limiting** - Always implement rate limits

# Convex HTTP Actions

Build HTTP endpoints for webhooks, external API integrations, and custom routes in Convex applications.

## Documentation Sources

- Primary: https://docs.convex.dev/functions/http-actions
- Actions Overview: https://docs.convex.dev/functions/actions
- Authentication: https://docs.convex.dev/auth
- LLM-optimized: https://docs.convex.dev/llms.txt

## Basic HTTP Router Setup

```typescript
// convex/http.ts
import { httpRouter } from "convex/server"

import { httpAction } from "./_generated/server"

const http = httpRouter()

http.route({
	path: "/health",
	method: "GET",
	handler: httpAction(async (ctx, request) => {
		return new Response(JSON.stringify({ status: "ok" }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		})
	}),
})

export default http
```

## Request Handling

```typescript
// Handle JSON body
http.route({
	path: "/api/data",
	method: "POST",
	handler: httpAction(async (ctx, request) => {
		const body = await request.json()
		const authHeader = request.headers.get("Authorization")
		const url = new URL(request.url)
		const queryParam = url.searchParams.get("filter")

		return new Response(JSON.stringify({ received: body, filter: queryParam }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		})
	}),
})

// Handle file uploads
http.route({
	path: "/api/upload",
	method: "POST",
	handler: httpAction(async (ctx, request) => {
		const bytes = await request.bytes()
		const contentType = request.headers.get("Content-Type") ?? "application/octet-stream"

		const blob = new Blob([bytes], { type: contentType })
		const storageId = await ctx.storage.store(blob)

		return new Response(JSON.stringify({ storageId }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		})
	}),
})
```

## Webhook Handling

```typescript
http.route({
	path: "/webhooks/stripe",
	method: "POST",
	handler: httpAction(async (ctx, request) => {
		const signature = request.headers.get("stripe-signature")
		if (!signature) {
			return new Response("Missing signature", { status: 400 })
		}

		const body = await request.text()

		try {
			await ctx.runAction(internal.stripe.verifyAndProcessWebhook, {
				body,
				signature,
			})
			return new Response("OK", { status: 200 })
		} catch (error) {
			console.error("Webhook error:", error)
			return new Response("Webhook error", { status: 400 })
		}
	}),
})
```

## CORS Configuration

```typescript
const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, Authorization",
}

// Handle preflight
http.route({
	path: "/api/data",
	method: "OPTIONS",
	handler: httpAction(async () => {
		return new Response(null, { status: 204, headers: corsHeaders })
	}),
})

// Actual endpoint with CORS
http.route({
	path: "/api/data",
	method: "POST",
	handler: httpAction(async (ctx, request) => {
		const body = await request.json()
		return new Response(JSON.stringify({ success: true, data: body }), {
			status: 200,
			headers: { "Content-Type": "application/json", ...corsHeaders },
		})
	}),
})
```

## Best Practices

- Always validate and sanitize incoming request data
- Use internal functions for database operations
- Implement proper error handling with appropriate status codes
- Add CORS headers for browser-accessible endpoints
- Verify webhook signatures before processing
- Use environment variables for secrets

## Common Pitfalls

1. **Missing CORS preflight handler** - Browsers send OPTIONS requests first
2. **Not validating webhook signatures** - Security vulnerability
3. **Exposing internal functions** - Use internal functions from HTTP actions
4. **Forgetting Content-Type headers** - Clients may not parse responses correctly
5. **Not handling request body errors** - Invalid JSON will throw

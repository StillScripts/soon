# Convex Agents

Build persistent, stateful AI agents with Convex including thread management, tool integration, streaming responses, RAG patterns, and workflow orchestration.

## Documentation Sources

- Primary: https://docs.convex.dev/ai
- Convex Agent Component: https://www.npmjs.com/package/@convex-dev/agent
- LLM-optimized: https://docs.convex.dev/llms.txt

## Why Convex for AI Agents

- **Persistent State** - Conversation history survives restarts
- **Real-time Updates** - Stream responses to clients automatically
- **Tool Execution** - Run Convex functions as agent tools
- **Durable Workflows** - Long-running agent tasks with reliability
- **Built-in RAG** - Vector search for knowledge retrieval

## Setting Up Convex Agent

```bash
npm install @convex-dev/agent ai openai
```

```typescript
// convex/agent.ts
import { Agent } from "@convex-dev/agent"
import { OpenAI } from "openai"

import { components } from "./_generated/api"

const openai = new OpenAI()

export const agent = new Agent(components.agent, {
	chat: openai.chat,
	textEmbedding: openai.embeddings,
})
```

## Thread Management

```typescript
export const createThread = mutation({
	args: {
		userId: v.id("users"),
		title: v.optional(v.string()),
	},
	returns: v.id("threads"),
	handler: async (ctx, args) => {
		const threadId = await agent.createThread(ctx, {
			userId: args.userId,
			metadata: {
				title: args.title ?? "New Conversation",
				createdAt: Date.now(),
			},
		})
		return threadId
	},
})

export const getMessages = query({
	args: { threadId: v.id("threads") },
	returns: v.array(
		v.object({
			role: v.string(),
			content: v.string(),
			createdAt: v.number(),
		})
	),
	handler: async (ctx, args) => {
		return await agent.getMessages(ctx, { threadId: args.threadId })
	},
})
```

## Tool Integration

```typescript
import { tool } from "@convex-dev/agent"

export const searchKnowledge = tool({
	name: "search_knowledge",
	description: "Search the knowledge base for relevant information",
	parameters: v.object({
		query: v.string(),
		limit: v.optional(v.number()),
	}),
	handler: async (ctx, args) => {
		const results = await ctx.runQuery(api.knowledge.search, {
			query: args.query,
			limit: args.limit ?? 5,
		})
		return results
	},
})

export const createTask = tool({
	name: "create_task",
	description: "Create a new task for the user",
	parameters: v.object({
		title: v.string(),
		description: v.optional(v.string()),
	}),
	handler: async (ctx, args) => {
		const taskId = await ctx.runMutation(api.tasks.create, args)
		return { success: true, taskId }
	},
})
```

## RAG Pattern

```typescript
export const addDocument = mutation({
	args: {
		title: v.string(),
		content: v.string(),
	},
	returns: v.id("documents"),
	handler: async (ctx, args) => {
		const embedding = await agent.embed(ctx, args.content)

		return await ctx.db.insert("documents", {
			title: args.title,
			content: args.content,
			embedding,
			createdAt: Date.now(),
		})
	},
})

export const search = query({
	args: { query: v.string(), limit: v.optional(v.number()) },
	handler: async (ctx, args) => {
		const results = await agent.search(ctx, {
			query: args.query,
			table: "documents",
			limit: args.limit ?? 5,
		})
		return results
	},
})
```

## Best Practices

- Store conversation history in Convex for persistence
- Use streaming for better user experience with long responses
- Implement proper error handling for tool failures
- Use vector indexes for efficient RAG retrieval
- Rate limit agent interactions to control costs

## Common Pitfalls

1. **Not persisting threads** - Conversations lost on refresh
2. **Blocking on long responses** - Use streaming instead
3. **Tool errors crashing agents** - Add proper error handling
4. **Large context windows** - Summarize old messages
5. **Missing embeddings for RAG** - Generate embeddings on insert

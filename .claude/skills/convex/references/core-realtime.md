# Convex Realtime

Build reactive applications with Convex's real-time subscriptions, optimistic updates, intelligent caching, and cursor-based pagination.

## Documentation Sources

- Primary: https://docs.convex.dev/client/react
- Optimistic Updates: https://docs.convex.dev/client/react/optimistic-updates
- Pagination: https://docs.convex.dev/database/pagination
- LLM-optimized: https://docs.convex.dev/llms.txt

## How Convex Realtime Works

1. **Automatic Subscriptions** - useQuery creates a subscription that updates automatically
2. **Smart Caching** - Query results are cached and shared across components
3. **Consistency** - All subscriptions see a consistent view of the database
4. **Efficient Updates** - Only re-renders when relevant data changes

## Basic Subscriptions

```typescript
import { useQuery } from "convex/react"
import { api } from "../convex/_generated/api"

function TaskList({ userId }: { userId: Id<"users"> }) {
  const tasks = useQuery(api.tasks.list, { userId })

  if (tasks === undefined) {
    return <div>Loading...</div>
  }

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task._id}>{task.title}</li>
      ))}
    </ul>
  )
}
```

## Conditional Queries

```typescript
function UserProfile({ userId }: { userId: Id<"users"> | null }) {
  // Skip query when userId is null
  const user = useQuery(
    api.users.get,
    userId ? { userId } : "skip"
  )

  if (userId === null) {
    return <div>Select a user</div>
  }

  if (user === undefined) {
    return <div>Loading...</div>
  }

  return <div>{user.name}</div>
}
```

## Optimistic Updates

Show changes immediately before server confirmation:

```typescript
import { useMutation } from "convex/react"

function TaskItem({ task }: { task: Task }) {
  const toggleTask = useMutation(api.tasks.toggle).withOptimisticUpdate(
    (localStore, args) => {
      const { taskId } = args
      const currentValue = localStore.getQuery(api.tasks.get, { taskId })

      if (currentValue !== undefined) {
        localStore.setQuery(api.tasks.get, { taskId }, {
          ...currentValue,
          completed: !currentValue.completed,
        })
      }
    }
  )

  return (
    <div onClick={() => toggleTask({ taskId: task._id })}>
      {task.completed ? "✓" : "○"} {task.title}
    </div>
  )
}
```

## Cursor-Based Pagination

```typescript
// convex/messages.ts
import { paginationOptsValidator } from "convex/server"

import { query } from "./_generated/server"

export const listPaginated = query({
	args: {
		channelId: v.id("channels"),
		paginationOpts: paginationOptsValidator,
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("messages")
			.withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
			.order("desc")
			.paginate(args.paginationOpts)
	},
})
```

```typescript
// React component
import { usePaginatedQuery } from "convex/react"

function MessageList({ channelId }: { channelId: Id<"channels"> }) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.messages.listPaginated,
    { channelId },
    { initialNumItems: 20 }
  )

  return (
    <div>
      {results.map((message) => (
        <div key={message._id}>{message.content}</div>
      ))}

      {status === "CanLoadMore" && (
        <button onClick={() => loadMore(20)}>Load More</button>
      )}
    </div>
  )
}
```

## Best Practices

- Use "skip" for conditional queries instead of conditionally calling hooks
- Implement optimistic updates for better perceived performance
- Use usePaginatedQuery for large datasets
- Handle undefined state (loading) explicitly
- Avoid unnecessary re-renders by memoizing derived data

## Common Pitfalls

1. **Conditional hook calls** - Use "skip" instead of if statements
2. **Not handling loading state** - Always check for undefined
3. **Missing optimistic update rollback** - Optimistic updates auto-rollback on error
4. **Over-fetching with pagination** - Use appropriate page sizes

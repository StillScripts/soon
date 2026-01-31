# Convex Cron Jobs

Schedule recurring functions for background tasks, cleanup jobs, data syncing, and automated workflows.

## Documentation Sources

- Primary: https://docs.convex.dev/scheduling/cron-jobs
- Scheduling Overview: https://docs.convex.dev/scheduling
- Scheduled Functions: https://docs.convex.dev/scheduling/scheduled-functions
- LLM-optimized: https://docs.convex.dev/llms.txt

## Basic Cron Setup

```typescript
// convex/crons.ts
import { cronJobs } from "convex/server"

import { internal } from "./_generated/api"

const crons = cronJobs()

// Run every hour
crons.interval("cleanup expired sessions", { hours: 1 }, internal.tasks.cleanupExpiredSessions, {})

// Run every day at midnight UTC
crons.cron("daily report", "0 0 * * *", internal.reports.generateDailyReport, {})

export default crons
```

## Interval-Based Scheduling

```typescript
// Every 5 minutes
crons.interval("sync external data", { minutes: 5 }, internal.sync.fetchExternalData, {})

// Every 2 hours
crons.interval("cleanup temp files", { hours: 2 }, internal.files.cleanupTempFiles, {})

// Every 30 seconds (minimum interval)
crons.interval("health check", { seconds: 30 }, internal.monitoring.healthCheck, {})
```

## Cron Expression Reference

```
┌───────────── minute (0-59)
│ ┌───────────── hour (0-23)
│ │ ┌───────────── day of month (1-31)
│ │ │ ┌───────────── month (1-12)
│ │ │ │ ┌───────────── day of week (0-6, Sunday=0)
│ │ │ │ │
* * * * *
```

Common patterns:

- `* * * * *` - Every minute
- `0 * * * *` - Every hour
- `0 0 * * *` - Every day at midnight
- `0 0 * * 0` - Every Sunday at midnight
- `0 0 1 * *` - First day of every month
- `*/5 * * * *` - Every 5 minutes
- `0 9-17 * * 1-5` - Every hour 9 AM-5 PM, Mon-Fri

## Internal Functions for Crons

```typescript
export const cleanupExpiredSessions = internalMutation({
	args: {},
	returns: v.number(),
	handler: async (ctx) => {
		const oneHourAgo = Date.now() - 60 * 60 * 1000

		const expiredSessions = await ctx.db
			.query("sessions")
			.withIndex("by_lastActive")
			.filter((q) => q.lt(q.field("lastActive"), oneHourAgo))
			.collect()

		for (const session of expiredSessions) {
			await ctx.db.delete(session._id)
		}

		return expiredSessions.length
	},
})
```

## Batching for Large Datasets

```typescript
const BATCH_SIZE = 100

export const processBatch = internalMutation({
	args: { cursor: v.optional(v.string()) },
	returns: v.null(),
	handler: async (ctx, args) => {
		const result = await ctx.db
			.query("items")
			.withIndex("by_status", (q) => q.eq("status", "pending"))
			.paginate({ numItems: BATCH_SIZE, cursor: args.cursor ?? null })

		for (const item of result.page) {
			await ctx.db.patch(item._id, {
				status: "processed",
				processedAt: Date.now(),
			})
		}

		// Schedule next batch if there are more items
		if (!result.isDone) {
			await ctx.scheduler.runAfter(0, internal.tasks.processBatch, {
				cursor: result.continueCursor,
			})
		}

		return null
	},
})
```

## Best Practices

- Only use `crons.interval` or `crons.cron` methods
- Always call internal functions from cron jobs for security
- Import `internal` from `_generated/api` even for functions in the same file
- Add logging and monitoring for production cron jobs
- Use batching for operations that process large datasets
- Consider timezone when using cron expressions (Convex uses UTC)

## Common Pitfalls

1. **Using public functions** - Cron jobs should call internal functions only
2. **Long-running mutations** - Break large operations into batches
3. **Missing error handling** - Unhandled errors will fail the entire job
4. **Forgetting timezone** - All cron expressions use UTC
5. **Using deprecated helpers** - Avoid `crons.hourly`, `crons.daily`, etc.

import { z } from "zod"
import type { Id } from "./_generated/dataModel"
import { authMutation, authQuery } from "./crpc"

// List all things for the authenticated user
export const list = authQuery
  .input(
    z.object({
      limit: z.number().min(1).max(100).optional(),
    })
  )
  .query(async ({ ctx, input }) => {
    const query = ctx.db
      .query("things")
      .withIndex("by_user", (q) => q.eq("userId", ctx.userId))

    if (input.limit) {
      return query.take(input.limit)
    }
    return query.collect()
  })

// Get a single thing by ID (with ownership check)
export const get = authQuery
  .input(
    z.object({
      id: z.string(),
    })
  )
  .query(async ({ ctx, input }) => {
    const thing = await ctx.db.get(input.id as Id<"things">)
    if (!thing || thing.userId !== ctx.userId) {
      return null
    }
    return thing
  })

// Create a new thing
export const create = authMutation
  .input(
    z.object({
      title: z.string().min(1, "Title is required").max(200),
    })
  )
  .mutation(async ({ ctx, input }) => {
    return ctx.db.insert("things", {
      title: input.title,
      userId: ctx.userId,
    })
  })

// Delete a thing (with ownership check)
export const remove = authMutation
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const thing = await ctx.db.get(input.id as Id<"things">)
    if (!thing || thing.userId !== ctx.userId) {
      throw new Error("Not found or not authorized")
    }
    await ctx.db.delete(input.id as Id<"things">)
  })

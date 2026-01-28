import {
  createThingSchema,
  getThingSchema,
  listThingsSchema,
  removeThingSchema,
} from "@repo/validators/things.js"
import type { Id } from "./_generated/dataModel"
import { authMutation, authQuery } from "./crpc"

// List all things for the authenticated user
export const list = authQuery
  .input(listThingsSchema)
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
  .input(getThingSchema)
  .query(async ({ ctx, input }) => {
    const thing = await ctx.db.get(input.id as Id<"things">)
    if (!thing || thing.userId !== ctx.userId) {
      return null
    }
    return thing
  })

// Create a new thing
export const create = authMutation
  .input(createThingSchema)
  .mutation(async ({ ctx, input }) => {
    return ctx.db.insert("things", {
      title: input.title,
      userId: ctx.userId,
    })
  })

// Delete a thing (with ownership check)
export const remove = authMutation
  .input(removeThingSchema)
  .mutation(async ({ ctx, input }) => {
    const thing = await ctx.db.get(input.id as Id<"things">)
    if (!thing || thing.userId !== ctx.userId) {
      throw new Error("Not found or not authorized")
    }
    await ctx.db.delete(input.id as Id<"things">)
  })

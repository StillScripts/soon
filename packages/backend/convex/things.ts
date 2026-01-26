import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { authComponent } from "./auth"

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

export const getThing = query({
  args: {
    id: v.id("things"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx)
    if (!user) {
      return null
    }
    const userId = user._id as string
    const thing = await ctx.db.get(args.id)
    if (thing?.userId !== userId) {
      return null
    }
    return thing
  },
})

export const createThing = mutation({
  args: {
    title: v.string(),
  },
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

export const deleteThing = mutation({
  args: {
    id: v.id("things"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx)
    if (!user) {
      throw new Error("Not authenticated")
    }
    const userId = user._id as string
    const thing = await ctx.db.get(args.id)
    if (!thing || thing.userId !== userId) {
      throw new Error("Not found or not authorized")
    }
    await ctx.db.delete(args.id)
  },
})

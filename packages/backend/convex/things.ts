import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getThings = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("things").collect();
  },
});

export const getThing = query({
  args: {
    id: v.id("things"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createThing = mutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("things", { title: args.title });
  },
});

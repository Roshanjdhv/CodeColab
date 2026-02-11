import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const storeExecution = internalMutation({
  args: {
    roomId: v.id("rooms"),
    fileId: v.id("files"),
    userId: v.id("users"),
    language: v.string(),
    code: v.string(),
    output: v.string(),
    error: v.optional(v.string()),
    executionTime: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("executions", {
      roomId: args.roomId,
      fileId: args.fileId,
      userId: args.userId,
      language: args.language,
      code: args.code,
      output: args.output,
      error: args.error,
      executionTime: args.executionTime,
    });
  },
});

export const getExecutionHistory = internalMutation({
  args: {
    roomId: v.id("rooms"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("executions")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .order("desc")
      .take(args.limit || 10);
  },
});

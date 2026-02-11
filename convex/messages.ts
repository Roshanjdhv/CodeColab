import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getRoomMessages = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user is member of the room
    const room = await ctx.db.get(args.roomId);
    if (!room || !room.members.includes(userId)) {
      throw new Error("Not authorized to access this room");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .order("desc")
      .take(50);

    return await Promise.all(
      messages.reverse().map(async (message) => {
        const author = await ctx.db.get(message.authorId);
        const authorProfile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", message.authorId))
          .unique();

        return {
          ...message,
          authorName: authorProfile?.username || author?.email || "Unknown",
          authorColor: authorProfile?.userColor || "#666666",
          authorImage: authorProfile?.profileImage 
            ? await ctx.storage.getUrl(authorProfile.profileImage)
            : null,
          fileUrl: message.fileId ? await ctx.storage.getUrl(message.fileId) : null,
        };
      })
    );
  },
});

export const sendMessage = mutation({
  args: {
    roomId: v.id("rooms"),
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("file"), v.literal("code")),
    fileId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user is member of the room
    const room = await ctx.db.get(args.roomId);
    if (!room || !room.members.includes(userId)) {
      throw new Error("Not authorized to send messages to this room");
    }

    return await ctx.db.insert("messages", {
      roomId: args.roomId,
      authorId: userId,
      content: args.content,
      type: args.type,
      fileId: args.fileId,
    });
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    return await ctx.storage.generateUploadUrl();
  },
});

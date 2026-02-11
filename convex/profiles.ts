import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCurrentProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) return null;

    return {
      ...profile,
      profileImageUrl: profile.profileImage 
        ? await ctx.storage.getUrl(profile.profileImage)
        : null,
    };
  },
});

export const createProfile = mutation({
  args: {
    username: v.string(),
    bio: v.optional(v.string()),
    userColor: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existingProfile) {
      throw new Error("Profile already exists");
    }

    // Check if username is taken
    const existingUsername = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();

    if (existingUsername) {
      throw new Error("Username already taken");
    }

    const profileId = await ctx.db.insert("profiles", {
      userId,
      username: args.username,
      bio: args.bio,
      status: "online",
      userColor: args.userColor || "#6B7280",
      isPublic: args.isPublic !== false, // Default to true
    });

    return profileId;
  },
});

export const updateProfile = mutation({
  args: {
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
    userColor: v.optional(v.string()),
    profileImage: v.optional(v.id("_storage")),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) {
      throw new Error("Profile not found");
    }

    // Check if username is taken by another user
    if (args.username && args.username !== profile.username) {
      const existingUsername = await ctx.db
        .query("profiles")
        .withIndex("by_username", (q) => q.eq("username", args.username!))
        .unique();

      if (existingUsername && existingUsername.userId !== userId) {
        throw new Error("Username already taken");
      }
    }

    const updates: any = {};
    if (args.username !== undefined) updates.username = args.username;
    if (args.bio !== undefined) updates.bio = args.bio;
    if (args.userColor !== undefined) updates.userColor = args.userColor;
    if (args.profileImage !== undefined) updates.profileImage = args.profileImage;
    if (args.isPublic !== undefined) updates.isPublic = args.isPublic;

    await ctx.db.patch(profile._id, updates);
    return profile._id;
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

export const updateStatus = mutation({
  args: {
    status: v.union(v.literal("online"), v.literal("offline"), v.literal("coding")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) {
      throw new Error("Profile not found");
    }

    await ctx.db.patch(profile._id, { status: args.status });
    return profile._id;
  },
});

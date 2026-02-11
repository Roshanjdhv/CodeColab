import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all public users for discovery
export const getPublicUsers = query({
  args: {
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const limit = args.limit || 20;
    let profiles = await ctx.db.query("profiles").collect();

    // Filter out current user and apply search
    profiles = profiles.filter(profile => {
      if (profile.userId === userId) return false;
      if (profile.isPublic === false) return false;
      
      if (args.search) {
        const searchLower = args.search.toLowerCase();
        return (
          profile.username.toLowerCase().includes(searchLower) ||
          (profile.bio && profile.bio.toLowerCase().includes(searchLower))
        );
      }
      return true;
    });

    // Get user details and friendship status
    const usersWithDetails = await Promise.all(
      profiles.slice(0, limit).map(async (profile) => {
        const user = await ctx.db.get(profile.userId);
        
        // Check if already friends
        const friendship = await ctx.db
          .query("friendships")
          .filter((q) => 
            q.or(
              q.and(q.eq(q.field("user1Id"), userId), q.eq(q.field("user2Id"), profile.userId)),
              q.and(q.eq(q.field("user1Id"), profile.userId), q.eq(q.field("user2Id"), userId))
            )
          )
          .unique();

        // Check for pending friend request
        const pendingRequest = await ctx.db
          .query("friendRequests")
          .filter((q) => 
            q.and(
              q.or(
                q.and(q.eq(q.field("fromUserId"), userId), q.eq(q.field("toUserId"), profile.userId)),
                q.and(q.eq(q.field("fromUserId"), profile.userId), q.eq(q.field("toUserId"), userId))
              ),
              q.eq(q.field("status"), "pending")
            )
          )
          .unique();

        return {
          ...profile,
          email: user?.email,
          profileImageUrl: profile.profileImage 
            ? await ctx.storage.getUrl(profile.profileImage)
            : null,
          isFriend: !!friendship,
          hasPendingRequest: !!pendingRequest,
          requestSentByMe: pendingRequest?.fromUserId === userId,
        };
      })
    );

    return usersWithDetails;
  },
});

// Send friend request
export const sendFriendRequest = mutation({
  args: {
    toUserId: v.id("users"),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const fromUserId = await getAuthUserId(ctx);
    if (!fromUserId) throw new Error("Not authenticated");

    if (fromUserId === args.toUserId) {
      throw new Error("Cannot send friend request to yourself");
    }

    // Check if already friends
    const existingFriendship = await ctx.db
      .query("friendships")
      .filter((q) => 
        q.or(
          q.and(q.eq(q.field("user1Id"), fromUserId), q.eq(q.field("user2Id"), args.toUserId)),
          q.and(q.eq(q.field("user1Id"), args.toUserId), q.eq(q.field("user2Id"), fromUserId))
        )
      )
      .unique();

    if (existingFriendship) {
      throw new Error("Already friends with this user");
    }

    // Check for existing pending request
    const existingRequest = await ctx.db
      .query("friendRequests")
      .filter((q) => 
        q.and(
          q.or(
            q.and(q.eq(q.field("fromUserId"), fromUserId), q.eq(q.field("toUserId"), args.toUserId)),
            q.and(q.eq(q.field("fromUserId"), args.toUserId), q.eq(q.field("toUserId"), fromUserId))
          ),
          q.eq(q.field("status"), "pending")
        )
      )
      .unique();

    if (existingRequest) {
      throw new Error("Friend request already exists");
    }

    // Create friend request
    const requestId = await ctx.db.insert("friendRequests", {
      fromUserId,
      toUserId: args.toUserId,
      status: "pending",
      message: args.message,
    });

    return requestId;
  },
});

// Get friend requests received by current user
export const getFriendRequests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const requests = await ctx.db
      .query("friendRequests")
      .withIndex("by_to_user", (q) => q.eq("toUserId", userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    return await Promise.all(
      requests.map(async (request) => {
        const fromUser = await ctx.db.get(request.fromUserId);
        const fromProfile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", request.fromUserId))
          .unique();

        return {
          ...request,
          fromUsername: fromProfile?.username || fromUser?.email || "Unknown",
          fromProfileImageUrl: fromProfile?.profileImage 
            ? await ctx.storage.getUrl(fromProfile.profileImage)
            : null,
          fromBio: fromProfile?.bio,
        };
      })
    );
  },
});

// Handle friend request (accept/decline)
export const handleFriendRequest = mutation({
  args: {
    requestId: v.id("friendRequests"),
    action: v.union(v.literal("accept"), v.literal("decline")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found");

    if (request.toUserId !== userId) {
      throw new Error("Not authorized to handle this request");
    }

    if (request.status !== "pending") {
      throw new Error("Request already handled");
    }

    if (args.action === "accept") {
      // Create friendship
      await ctx.db.insert("friendships", {
        user1Id: request.fromUserId,
        user2Id: request.toUserId,
        createdAt: Date.now(),
      });

      // Update request status
      await ctx.db.patch(request._id, { status: "accepted" });
    } else {
      // Update request status
      await ctx.db.patch(request._id, { status: "declined" });
    }

    return request._id;
  },
});

// Get user's friends
export const getFriends = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const friendships = await ctx.db
      .query("friendships")
      .filter((q) => 
        q.or(
          q.eq(q.field("user1Id"), userId),
          q.eq(q.field("user2Id"), userId)
        )
      )
      .collect();

    return await Promise.all(
      friendships.map(async (friendship) => {
        const friendId = friendship.user1Id === userId ? friendship.user2Id : friendship.user1Id;
        const friend = await ctx.db.get(friendId);
        const friendProfile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", friendId))
          .unique();

        // Get last message
        const lastMessage = await ctx.db
          .query("privateMessages")
          .filter((q) => 
            q.or(
              q.and(q.eq(q.field("fromUserId"), userId), q.eq(q.field("toUserId"), friendId)),
              q.and(q.eq(q.field("fromUserId"), friendId), q.eq(q.field("toUserId"), userId))
            )
          )
          .order("desc")
          .first();

        // Count unread messages
        const unreadCount = await ctx.db
          .query("privateMessages")
          .withIndex("by_to_user", (q) => q.eq("toUserId", userId))
          .filter((q) => q.and(
            q.eq(q.field("fromUserId"), friendId),
            q.eq(q.field("isRead"), false)
          ))
          .collect();

        return {
          friendId,
          username: friendProfile?.username || friend?.email || "Unknown",
          profileImageUrl: friendProfile?.profileImage 
            ? await ctx.storage.getUrl(friendProfile.profileImage)
            : null,
          status: friendProfile?.status || "offline",
          bio: friendProfile?.bio,
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            timestamp: lastMessage._creationTime,
            fromMe: lastMessage.fromUserId === userId,
          } : null,
          unreadCount: unreadCount.length,
          friendshipCreatedAt: friendship.createdAt,
        };
      })
    );
  },
});

// Get private messages with a friend
export const getPrivateMessages = query({
  args: {
    friendId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify friendship exists
    const friendship = await ctx.db
      .query("friendships")
      .filter((q) => 
        q.or(
          q.and(q.eq(q.field("user1Id"), userId), q.eq(q.field("user2Id"), args.friendId)),
          q.and(q.eq(q.field("user1Id"), args.friendId), q.eq(q.field("user2Id"), userId))
        )
      )
      .unique();

    if (!friendship) {
      throw new Error("Not friends with this user");
    }

    const messages = await ctx.db
      .query("privateMessages")
      .filter((q) => 
        q.or(
          q.and(q.eq(q.field("fromUserId"), userId), q.eq(q.field("toUserId"), args.friendId)),
          q.and(q.eq(q.field("fromUserId"), args.friendId), q.eq(q.field("toUserId"), userId))
        )
      )
      .order("desc")
      .take(args.limit || 50);

    return messages.reverse();
  },
});

// Send private message
export const sendPrivateMessage = mutation({
  args: {
    toUserId: v.id("users"),
    content: v.string(),
    type: v.optional(v.union(v.literal("text"), v.literal("file"))),
    fileId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const fromUserId = await getAuthUserId(ctx);
    if (!fromUserId) throw new Error("Not authenticated");

    // Verify friendship exists
    const friendship = await ctx.db
      .query("friendships")
      .filter((q) => 
        q.or(
          q.and(q.eq(q.field("user1Id"), fromUserId), q.eq(q.field("user2Id"), args.toUserId)),
          q.and(q.eq(q.field("user1Id"), args.toUserId), q.eq(q.field("user2Id"), fromUserId))
        )
      )
      .unique();

    if (!friendship) {
      throw new Error("Not friends with this user");
    }

    const messageId = await ctx.db.insert("privateMessages", {
      fromUserId,
      toUserId: args.toUserId,
      content: args.content,
      type: args.type || "text",
      fileId: args.fileId,
      isRead: false,
    });

    return messageId;
  },
});

// Mark messages as read
export const markMessagesAsRead = mutation({
  args: {
    fromUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const toUserId = await getAuthUserId(ctx);
    if (!toUserId) throw new Error("Not authenticated");

    const unreadMessages = await ctx.db
      .query("privateMessages")
      .withIndex("by_to_user", (q) => q.eq("toUserId", toUserId))
      .filter((q) => q.and(
        q.eq(q.field("fromUserId"), args.fromUserId),
        q.eq(q.field("isRead"), false)
      ))
      .collect();

    await Promise.all(
      unreadMessages.map(message => 
        ctx.db.patch(message._id, { isRead: true })
      )
    );

    return unreadMessages.length;
  },
});

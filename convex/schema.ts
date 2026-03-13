import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // User profiles
  profiles: defineTable({
    userId: v.id("users"),
    username: v.string(),
    profileImage: v.optional(v.id("_storage")),
    bio: v.optional(v.string()),
    status: v.union(v.literal("online"), v.literal("offline"), v.literal("coding")),
    userColor: v.optional(v.string()), // Hex color for user identification
    isPublic: v.optional(v.boolean()), // Whether profile is visible in public search
  }).index("by_user", ["userId"]).index("by_username", ["username"]),

  // Coding rooms
  rooms: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("public"), v.literal("private")),
    uniqueCode: v.optional(v.string()),
    createdBy: v.id("users"),
    members: v.array(v.id("users")),
    admins: v.optional(v.array(v.id("users"))), // Room admins (can manage users)
    language: v.union(
      v.literal("javascript"),
      v.literal("python"),
      v.literal("html"),
      v.literal("css"),
      v.literal("c"),
      v.literal("cpp"),
      v.literal("react")
    ),
    isActive: v.boolean(),
    color: v.optional(v.string()),
  })
    .index("by_type", ["type"])
    .index("by_creator", ["createdBy"])
    .index("by_code", ["uniqueCode"]),

  // Code files in rooms
  files: defineTable({
    roomId: v.id("rooms"),
    name: v.string(),
    content: v.string(),
    language: v.string(),
    createdBy: v.id("users"),
    lastModifiedBy: v.id("users"),
    version: v.number(),
  }).index("by_room", ["roomId"]),

  // Room messages
  messages: defineTable({
    roomId: v.id("rooms"),
    authorId: v.id("users"),
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("file"), v.literal("code")),
    fileId: v.optional(v.id("_storage")),
  }).index("by_room", ["roomId"]),

  // Join requests for private rooms
  joinRequests: defineTable({
    roomId: v.id("rooms"),
    userId: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("denied")),
    requestedBy: v.id("users"),
  })
    .index("by_room", ["roomId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // Friend requests
  friendRequests: defineTable({
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("declined")),
    message: v.optional(v.string()),
  })
    .index("by_to_user", ["toUserId"])
    .index("by_from_user", ["fromUserId"])
    .index("by_status", ["status"]),

  // Friendships (accepted friend requests become friendships)
  friendships: defineTable({
    user1Id: v.id("users"),
    user2Id: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_user1", ["user1Id"])
    .index("by_user2", ["user2Id"]),

  // Private messages between friends
  privateMessages: defineTable({
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("file")),
    fileId: v.optional(v.id("_storage")),
    isRead: v.boolean(),
  })
    .index("by_conversation", ["fromUserId", "toUserId"])
    .index("by_to_user", ["toUserId"]),

  // Code execution results
  executions: defineTable({
    roomId: v.id("rooms"),
    fileId: v.id("files"),
    userId: v.id("users"),
    language: v.string(),
    code: v.string(),
    output: v.string(),
    error: v.optional(v.string()),
    executionTime: v.number(),
  }).index("by_room", ["roomId"]).index("by_file", ["fileId"]),

  // User presence in rooms
  userPresence: defineTable({
    userId: v.id("users"),
    roomId: v.id("rooms"),
    isActive: v.boolean(),
    lastSeen: v.number(),
    fileId: v.optional(v.id("files")), // Legacy field
    userColor: v.optional(v.string()), // Legacy field
    cursorPosition: v.optional(v.object({
      fileId: v.optional(v.id("files")),
      line: v.number(),
      column: v.number(),
    })),
  })
    .index("by_room", ["roomId"])
    .index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});

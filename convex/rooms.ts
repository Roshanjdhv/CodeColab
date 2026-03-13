import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const ROOM_COLORS = [
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#f43f5e", // Rose
  "#f59e0b", // Amber
  "#3b82f6", // Blue
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#f97316", // Orange
];

export const createRoom = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("public"), v.literal("private")),
    language: v.union(
      v.literal("javascript"),
      v.literal("python"),
      v.literal("html"),
      v.literal("css"),
      v.literal("c"),
      v.literal("cpp"),
      v.literal("react")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const uniqueCode = args.type === "private" 
      ? Math.random().toString(36).substring(2, 8).toUpperCase()
      : undefined;

    const randomColor = ROOM_COLORS[Math.floor(Math.random() * ROOM_COLORS.length)];

    const roomId = await ctx.db.insert("rooms", {
      name: args.name,
      description: args.description,
      type: args.type,
      uniqueCode,
      createdBy: userId,
      members: [userId],
      admins: [userId], // Creator is automatically an admin
      language: args.language,
      isActive: true,
      color: randomColor,
    });

    // Create initial file
    await ctx.db.insert("files", {
      roomId,
      name: `main.${getFileExtension(args.language)}`,
      content: getInitialCode(args.language),
      language: args.language,
      createdBy: userId,
      lastModifiedBy: userId,
      version: 1,
    });

    return roomId;
  },
});

export const getRoomInfo = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const room = await ctx.db.get(args.roomId);
    if (!room) {
      throw new Error("Room not found or has been deleted");
    }
    
    if (!room.members.includes(userId)) {
      throw new Error("Not authorized to access this room");
    }

    // Get member details with profiles
    const memberDetails = await Promise.all(
      room.members.map(async (memberId) => {
        const user = await ctx.db.get(memberId);
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", memberId))
          .unique();

        return {
          userId: memberId,
          username: profile?.username || user?.email || "Unknown",
          userColor: profile?.userColor || "#666666",
          profileImageUrl: profile?.profileImage 
            ? await ctx.storage.getUrl(profile.profileImage)
            : null,
          isOwner: room.createdBy === memberId,
          isAdmin: (room.admins || []).includes(memberId),
          status: profile?.status || "offline",
        };
      })
    );

    const creator = await ctx.db.get(room.createdBy);
    const creatorProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", room.createdBy))
      .unique();

    return {
      ...room,
      creatorName: creatorProfile?.username || creator?.email || "Unknown",
      memberCount: room.members.length,
      members: memberDetails,
      currentUserRole: {
        isOwner: room.createdBy === userId,
        isAdmin: (room.admins || []).includes(userId),
        isMember: room.members.includes(userId),
      },
    };
  },
});

export const removeUserFromRoom = mutation({
  args: {
    roomId: v.id("rooms"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");

    // Check if current user is owner or admin
    const isOwner = room.createdBy === currentUserId;
    const isAdmin = (room.admins || []).includes(currentUserId);

    if (!isOwner && !isAdmin) {
      throw new Error("Not authorized to remove users");
    }

    // Can't remove the owner
    if (args.userId === room.createdBy) {
      throw new Error("Cannot remove room owner");
    }

    // Remove user from members and admins
    const newMembers = room.members.filter(id => id !== args.userId);
    const newAdmins = (room.admins || []).filter(id => id !== args.userId);

    await ctx.db.patch(args.roomId, {
      members: newMembers,
      admins: newAdmins,
    });

    return args.userId;
  },
});

export const promoteToAdmin = mutation({
  args: {
    roomId: v.id("rooms"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");

    // Only owner can promote to admin
    if (room.createdBy !== currentUserId) {
      throw new Error("Only room owner can promote users to admin");
    }

    // Check if user is a member
    if (!room.members.includes(args.userId)) {
      throw new Error("User is not a member of this room");
    }

    // Add to admins if not already
    const currentAdmins = room.admins || [];
    if (!currentAdmins.includes(args.userId)) {
      await ctx.db.patch(args.roomId, {
        admins: [...currentAdmins, args.userId],
      });
    }

    return args.userId;
  },
});

export const demoteFromAdmin = mutation({
  args: {
    roomId: v.id("rooms"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");

    // Only owner can demote admins
    if (room.createdBy !== currentUserId) {
      throw new Error("Only room owner can demote admins");
    }

    // Can't demote the owner
    if (args.userId === room.createdBy) {
      throw new Error("Cannot demote room owner");
    }

    // Remove from admins
    const newAdmins = (room.admins || []).filter(id => id !== args.userId);
    await ctx.db.patch(args.roomId, {
      admins: newAdmins,
    });

    return args.userId;
  },
});

export const getPublicRooms = query({
  args: {},
  handler: async (ctx) => {
    const rooms = await ctx.db
      .query("rooms")
      .withIndex("by_type", (q) => q.eq("type", "public"))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return await Promise.all(
      rooms.map(async (room) => {
        const creator = await ctx.db.get(room.createdBy);
        const creatorProfile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", room.createdBy))
          .unique();

        return {
          ...room,
          creatorName: creatorProfile?.username || creator?.email || "Unknown",
          memberCount: room.members.length,
        };
      })
    );
  },
});

export const getAllRooms = query({
  args: {},
  handler: async (ctx) => {
    const rooms = await ctx.db
      .query("rooms")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return await Promise.all(
      rooms.map(async (room) => {
        const creator = await ctx.db.get(room.createdBy);
        const creatorProfile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", room.createdBy))
          .unique();

        return {
          ...room,
          creatorName: creatorProfile?.username || creator?.email || "Unknown",
          memberCount: room.members.length,
        };
      })
    );
  },
});

export const getMyRooms = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const rooms = await ctx.db.query("rooms").collect();
    const myRooms = rooms.filter(room => room.createdBy === userId);

    return await Promise.all(
      myRooms.map(async (room) => {
        const creator = await ctx.db.get(room.createdBy);
        const creatorProfile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", room.createdBy))
          .unique();

        return {
          ...room,
          creatorName: creatorProfile?.username || creator?.email || "Unknown",
          memberCount: room.members.length,
        };
      })
    );
  },
});

export const getJoinedRooms = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const rooms = await ctx.db.query("rooms").collect();
    const joinedRooms = rooms.filter(room => 
      room.members.includes(userId) && room.createdBy !== userId
    );

    return await Promise.all(
      joinedRooms.map(async (room) => {
        const creator = await ctx.db.get(room.createdBy);
        const creatorProfile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", room.createdBy))
          .unique();

        return {
          ...room,
          creatorName: creatorProfile?.username || creator?.email || "Unknown",
          memberCount: room.members.length,
        };
      })
    );
  },
});

export const validateRoomAccess = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { valid: false, error: "Not authenticated" };
    }

    const room = await ctx.db.get(args.roomId);
    if (!room) {
      return { valid: false, error: "Room not found" };
    }

    if (!room.isActive) {
      return { valid: false, error: "Room is not active" };
    }

    if (!room.members.includes(userId)) {
      return { valid: false, error: "Not a member of this room" };
    }

    return { valid: true, error: null };
  },
});

export const getRoomById = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    return room || null;
  },
});

export const joinRoom = mutation({
  args: {
    roomId: v.optional(v.id("rooms")),
    uniqueCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    let room;
    if (args.roomId) {
      room = await ctx.db.get(args.roomId);
    } else if (args.uniqueCode) {
      room = await ctx.db
        .query("rooms")
        .withIndex("by_code", (q) => q.eq("uniqueCode", args.uniqueCode))
        .unique();
    }

    if (!room) {
      console.warn(`[joinRoom] Room not found: ${args.roomId || args.uniqueCode}`);
      return { 
        success: false, 
        error: "Room not found. Please check the link or create a new room.", 
        roomId: null 
      };
    }

    if (!room.isActive) {
      return { 
        success: false, 
        error: "This room is no longer active.", 
        roomId: null 
      };
    }

    if (room.type === "public") {
      // Join public room directly
      if (!room.members.includes(userId)) {
        await ctx.db.patch(room._id, {
          members: [...room.members, userId],
        });
      }
      console.log(`[joinRoom] User ${userId} joined public room ${room._id}`);
      return { success: true, error: null, roomId: room._id };
    } else {
      // For private rooms, create join request
      const existingRequest = await ctx.db
        .query("joinRequests")
        .withIndex("by_room", (q) => q.eq("roomId", room._id))
        .filter((q) => q.eq(q.field("userId"), userId))
        .filter((q) => q.eq(q.field("status"), "pending"))
        .unique();

      if (existingRequest) {
        return { 
          success: false, 
          error: "Join request already pending for this room.", 
          roomId: null 
        };
      }

      if (room.members.includes(userId)) {
        console.log(`[joinRoom] User ${userId} already member of room ${room._id}`);
        return { success: true, error: null, roomId: room._id };
      }

      await ctx.db.insert("joinRequests", {
        roomId: room._id,
        userId,
        status: "pending",
        requestedBy: userId,
      });

      console.log(`[joinRoom] Join request created for user ${userId} to room ${room._id}`);
      return { 
        success: false, 
        error: "Join request sent to room creator. You'll be notified when approved.", 
        roomId: null 
      };
    }
  },
});

export const getJoinRequests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Get rooms created by current user
    const myRooms = await ctx.db
      .query("rooms")
      .withIndex("by_creator", (q) => q.eq("createdBy", userId))
      .collect();

    const roomIds = myRooms.map(room => room._id);
    
    const requests = await ctx.db
      .query("joinRequests")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    const myRoomRequests = requests.filter(req => roomIds.includes(req.roomId));

    return await Promise.all(
      myRoomRequests.map(async (request) => {
        const room = await ctx.db.get(request.roomId);
        const requester = await ctx.db.get(request.userId);
        const requesterProfile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", request.userId))
          .unique();

        return {
          ...request,
          roomName: room?.name,
          requesterName: requesterProfile?.username || requester?.email || "Unknown",
        };
      })
    );
  },
});

export const handleJoinRequest = mutation({
  args: {
    requestId: v.id("joinRequests"),
    action: v.union(v.literal("approve"), v.literal("deny")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found");

    const room = await ctx.db.get(request.roomId);
    if (!room || room.createdBy !== userId) {
      throw new Error("Not authorized to handle this request");
    }

    if (args.action === "approve") {
      // Add user to room members
      await ctx.db.patch(room._id, {
        members: [...room.members, request.userId],
      });
      
      await ctx.db.patch(request._id, { status: "approved" });
    } else {
      await ctx.db.patch(request._id, { status: "denied" });
    }

    return request._id;
  },
});

function getFileExtension(language: string): string {
  const extensions: Record<string, string> = {
    javascript: "js",
    python: "py",
    html: "html",
    css: "css",
    c: "c",
    cpp: "cpp",
    react: "jsx",
  };
  return extensions[language] || "txt";
}

function getInitialCode(language: string): string {
  const templates: Record<string, string> = {
    javascript: `// Welcome to CodeCollab!
console.log("Hello, World!");

function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("CodeCollab"));`,
    python: `# Welcome to CodeCollab!
print("Hello, World!")

def greet(name):
    return f"Hello, {name}!"

print(greet("CodeCollab"))`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeCollab</title>
</head>
<body>
    <h1>Welcome to CodeCollab!</h1>
    <p>Start coding together!</p>
</body>
</html>`,
    css: `/* Welcome to CodeCollab! */
body {
    font-family: 'Arial', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    margin: 0;
    padding: 20px;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}`,
    c: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    printf("Welcome to CodeCollab!\\n");
    return 0;
}`,
    cpp: `#include <iostream>
#include <string>

int main() {
    std::cout << "Hello, World!" << std::endl;
    std::cout << "Welcome to CodeCollab!" << std::endl;
    
    std::string name = "CodeCollab";
    std::cout << "Hello, " << name << "!" << std::endl;
    
    return 0;
}`,
    react: `import React, { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Welcome to CodeCollab!</h1>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}

export default App;`,
  };
  return templates[language] || "// Start coding here!";
}

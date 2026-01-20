import { v } from "convex/values";
import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

// ============ CONSTANTS ============

export const PRACTICE_STATUSES = [
  "new",
  "learning",
  "solid",
  "performance_ready",
] as const;

export type PracticeStatus = (typeof PRACTICE_STATUSES)[number];

// ============ HELPERS ============

async function getCurrentUserId(ctx: MutationCtx | QueryCtx): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }
  return userId;
}

async function getQueryUserId(ctx: QueryCtx): Promise<Id<"users"> | null> {
  const userId = await getAuthUserId(ctx);
  return userId;
}

/**
 * Verify user is a member of the band that owns the song
 */
async function verifySongAccess(
  ctx: QueryCtx | MutationCtx,
  songId: Id<"songs">,
  userId: Id<"users">
): Promise<{ song: NonNullable<Awaited<ReturnType<typeof ctx.db.get>>>; bandId: Id<"bands"> }> {
  const song = await ctx.db.get(songId);
  if (!song || song.deletedAt) {
    throw new Error("Song not found");
  }

  const membership = await ctx.db
    .query("bandMemberships")
    .withIndex("by_band_user", (q) =>
      q.eq("bandId", song.bandId).eq("userId", userId)
    )
    .first();

  if (!membership || membership.leftAt) {
    throw new Error("Not a member of this band");
  }

  return { song, bandId: song.bandId };
}

// ============ QUERIES ============

/**
 * Get user's progress for a specific song
 */
export const getForSong = query({
  args: { songId: v.id("songs") },
  handler: async (ctx, args) => {
    const userId = await getQueryUserId(ctx);
    if (!userId) {
      return null;
    }

    // Verify access
    try {
      await verifySongAccess(ctx, args.songId, userId);
    } catch {
      return null;
    }

    const progress = await ctx.db
      .query("userSongProgress")
      .withIndex("by_user_song", (q) =>
        q.eq("userId", userId).eq("songId", args.songId)
      )
      .unique();

    return progress;
  },
});

/**
 * Get user's progress for all songs in a band
 * Returns a map of songId -> progress
 */
export const listByBand = query({
  args: { bandId: v.id("bands") },
  handler: async (ctx, args) => {
    const userId = await getQueryUserId(ctx);
    if (!userId) {
      return {};
    }

    // Verify band membership
    const membership = await ctx.db
      .query("bandMemberships")
      .withIndex("by_band_user", (q) =>
        q.eq("bandId", args.bandId).eq("userId", userId)
      )
      .first();

    if (!membership || membership.leftAt) {
      return {};
    }

    // Get all songs in the band
    const songs = await ctx.db
      .query("songs")
      .withIndex("by_band_active", (q) =>
        q.eq("bandId", args.bandId).eq("deletedAt", undefined)
      )
      .collect();

    const songIds = songs.map((s) => s._id);

    // Get user's progress for these songs
    const allProgress = await ctx.db
      .query("userSongProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Filter to songs in this band and create map
    const progressMap: Record<string, {
      practiceStatus: string;
      personalNotes?: string;
    }> = {};

    for (const progress of allProgress) {
      if (songIds.includes(progress.songId)) {
        progressMap[progress.songId] = {
          practiceStatus: progress.practiceStatus,
          personalNotes: progress.personalNotes,
        };
      }
    }

    return progressMap;
  },
});

// ============ MUTATIONS ============

/**
 * Update user's practice status for a song
 */
export const updatePracticeStatus = mutation({
  args: {
    songId: v.id("songs"),
    practiceStatus: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);

    // Verify access
    await verifySongAccess(ctx, args.songId, userId);

    // Validate practice status
    if (!PRACTICE_STATUSES.includes(args.practiceStatus as PracticeStatus)) {
      throw new Error(`Invalid practice status. Must be one of: ${PRACTICE_STATUSES.join(", ")}`);
    }

    // Check for existing progress record
    const existing = await ctx.db
      .query("userSongProgress")
      .withIndex("by_user_song", (q) =>
        q.eq("userId", userId).eq("songId", args.songId)
      )
      .unique();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        practiceStatus: args.practiceStatus,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      // Create new
      const id = await ctx.db.insert("userSongProgress", {
        userId,
        songId: args.songId,
        practiceStatus: args.practiceStatus,
        createdAt: Date.now(),
      });
      return id;
    }
  },
});

/**
 * Update user's personal notes for a song
 */
export const updatePersonalNotes = mutation({
  args: {
    songId: v.id("songs"),
    personalNotes: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);

    // Verify access
    await verifySongAccess(ctx, args.songId, userId);

    // Check for existing progress record
    const existing = await ctx.db
      .query("userSongProgress")
      .withIndex("by_user_song", (q) =>
        q.eq("userId", userId).eq("songId", args.songId)
      )
      .unique();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        personalNotes: args.personalNotes.trim() || undefined,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      // Create new with default practice status
      const id = await ctx.db.insert("userSongProgress", {
        userId,
        songId: args.songId,
        practiceStatus: "new",
        personalNotes: args.personalNotes.trim() || undefined,
        createdAt: Date.now(),
      });
      return id;
    }
  },
});

/**
 * Update both practice status and personal notes for a song
 */
export const update = mutation({
  args: {
    songId: v.id("songs"),
    practiceStatus: v.optional(v.string()),
    personalNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);

    // Verify access
    await verifySongAccess(ctx, args.songId, userId);

    // Validate practice status if provided
    if (args.practiceStatus && !PRACTICE_STATUSES.includes(args.practiceStatus as PracticeStatus)) {
      throw new Error(`Invalid practice status. Must be one of: ${PRACTICE_STATUSES.join(", ")}`);
    }

    // Check for existing progress record
    const existing = await ctx.db
      .query("userSongProgress")
      .withIndex("by_user_song", (q) =>
        q.eq("userId", userId).eq("songId", args.songId)
      )
      .unique();

    const updates: Partial<{
      practiceStatus: string;
      personalNotes: string | undefined;
      updatedAt: number;
    }> = {
      updatedAt: Date.now(),
    };

    if (args.practiceStatus !== undefined) {
      updates.practiceStatus = args.practiceStatus;
    }
    if (args.personalNotes !== undefined) {
      updates.personalNotes = args.personalNotes.trim() || undefined;
    }

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, updates);
      return existing._id;
    } else {
      // Create new
      const id = await ctx.db.insert("userSongProgress", {
        userId,
        songId: args.songId,
        practiceStatus: args.practiceStatus || "new",
        personalNotes: args.personalNotes?.trim() || undefined,
        createdAt: Date.now(),
      });
      return id;
    }
  },
});

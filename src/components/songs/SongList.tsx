"use client";

import { SongCard } from "./SongCard";
import { Id } from "../../../convex/_generated/dataModel";

interface Song {
  _id: Id<"songs">;
  bandId: Id<"bands">;
  title: string;
  key?: string;
  mode?: string;
  tempo?: number;
  timeSignature?: string;
  practiceStatus: string;
  fileCount: number;
  hasAudio: boolean;
  hasVideo: boolean;
  hasChart: boolean;
  hasTab: boolean;
}

interface UserProgress {
  practiceStatus: string;
  personalNotes?: string;
}

interface SongListProps {
  songs: Song[];
  /** Map of songId -> user's progress for that song */
  userProgress?: Record<string, UserProgress>;
}

export function SongList({ songs, userProgress }: SongListProps) {
  if (songs.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {songs.map((song) => (
        <SongCard
          key={song._id}
          song={song}
          userPracticeStatus={userProgress?.[song._id]?.practiceStatus}
        />
      ))}
    </div>
  );
}

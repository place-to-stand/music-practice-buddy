"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Check, X, StickyNote } from "lucide-react";
import { toast } from "sonner";

interface PersonalNotesSectionProps {
  songId: Id<"songs">;
}

export function PersonalNotesSection({ songId }: PersonalNotesSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const progress = useQuery(api.userSongProgress.getForSong, { songId });
  const updatePersonalNotes = useMutation(api.userSongProgress.updatePersonalNotes);

  const isLoading = progress === undefined;

  // Initialize edit state when progress loads
  useEffect(() => {
    if (progress) {
      setEditNotes(progress.personalNotes || "");
    }
  }, [progress]);

  const startEditing = () => {
    setEditNotes(progress?.personalNotes || "");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setEditNotes(progress?.personalNotes || "");
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePersonalNotes({
        songId,
        personalNotes: editNotes,
      });
      setIsEditing(false);
      toast.success("Personal notes saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save notes");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <StickyNote className="h-4 w-4" />
          My Notes
        </CardTitle>
        {!isEditing && !isLoading && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={startEditing}>
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-20 bg-muted rounded animate-pulse" />
        ) : isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Add your personal notes about this song..."
              rows={4}
              disabled={isSaving}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelEditing}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                <Check className="h-4 w-4 mr-1" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        ) : progress?.personalNotes ? (
          <p className="text-sm whitespace-pre-wrap">{progress.personalNotes}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No personal notes yet. Click the pencil to add your own notes.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

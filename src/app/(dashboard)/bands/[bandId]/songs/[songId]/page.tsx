"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  PracticeStatusBadge,
  PRACTICE_STATUS_OPTIONS,
  SongFilesSection,
  PracticeStatus,
} from "@/components/songs";
import { ArrowLeft, Pencil, Check, X, Trash2, Music } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const MUSICAL_KEYS = [
  "C", "C#", "Db", "D", "D#", "Eb", "E", "F",
  "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B",
] as const;

const MODES = [
  "Major", "Minor", "Dorian", "Phrygian",
  "Lydian", "Mixolydian", "Aeolian", "Locrian",
] as const;

const TIME_SIGNATURES = [
  "4/4", "3/4", "6/8", "2/4", "5/4", "7/8", "12/8",
] as const;

export default function SongDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bandId = params.bandId as Id<"bands">;
  const songId = params.songId as Id<"songs">;

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editKey, setEditKey] = useState("");
  const [editMode, setEditMode] = useState("");
  const [editTempo, setEditTempo] = useState("");
  const [editTimeSignature, setEditTimeSignature] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const song = useQuery(api.songs.get, { id: songId });
  const updateSong = useMutation(api.songs.update);
  const updatePracticeStatus = useMutation(api.songs.updatePracticeStatus);
  const deleteSong = useMutation(api.songs.softDelete);

  const isLoading = song === undefined;

  // Song not found or no access
  if (song === null) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Song not found</CardTitle>
            <CardDescription>
              This song doesn&apos;t exist or you don&apos;t have access to it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => router.push(`/bands/${bandId}/songs`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Songs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const startEditing = () => {
    if (!song) return;
    setEditTitle(song.title);
    setEditKey(song.key || "");
    setEditMode(song.mode || "");
    setEditTempo(song.tempo?.toString() || "");
    setEditTimeSignature(song.timeSignature || "");
    setEditNotes(song.notes || "");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editTitle.trim()) {
      toast.error("Song title is required");
      return;
    }

    const tempoNum = editTempo ? parseInt(editTempo, 10) : undefined;
    if (editTempo && (isNaN(tempoNum!) || tempoNum! < 1 || tempoNum! > 400)) {
      toast.error("Tempo must be between 1 and 400 BPM");
      return;
    }

    setIsSaving(true);
    try {
      await updateSong({
        id: songId,
        title: editTitle.trim(),
        key: editKey || undefined,
        mode: editMode || undefined,
        tempo: tempoNum,
        timeSignature: editTimeSignature || undefined,
        notes: editNotes.trim() || undefined,
      });
      setIsEditing(false);
      toast.success("Song updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update song");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      await updatePracticeStatus({ id: songId, practiceStatus: status });
      toast.success("Practice status updated");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update status"
      );
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteSong({ id: songId });
      toast.success("Song deleted");
      router.push(`/bands/${bandId}/songs`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete song");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/bands/${bandId}/songs`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {isLoading ? (
                  <span className="animate-pulse bg-muted rounded h-7 w-48 inline-block" />
                ) : (
                  song?.title
                )}
              </h1>
              {!isLoading && song && (
                <PracticeStatusBadge
                  status={song.practiceStatus as PracticeStatus}
                />
              )}
            </div>
            <p className="text-muted-foreground">
              {isLoading ? (
                <span className="animate-pulse bg-muted rounded h-4 w-24 inline-block" />
              ) : (
                song?.bandName
              )}
            </p>
          </div>
        </div>
        {!isLoading && (
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <Button variant="outline" onClick={startEditing}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={cancelEditing}
                  disabled={isSaving}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  <Check className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Song Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Song Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-muted rounded w-20 animate-pulse" />
                      <div className="h-10 bg-muted rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : isEditing ? (
                <div className="space-y-4">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Title *</Label>
                    <Input
                      id="edit-title"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      disabled={isSaving}
                    />
                  </div>

                  {/* Key and Mode */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="edit-key">Key</Label>
                      <Select
                        value={editKey || undefined}
                        onValueChange={setEditKey}
                        disabled={isSaving}
                      >
                        <SelectTrigger id="edit-key">
                          <SelectValue placeholder="Select key" />
                        </SelectTrigger>
                        <SelectContent>
                          {MUSICAL_KEYS.map((k) => (
                            <SelectItem key={k} value={k}>
                              {k}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-mode">Mode</Label>
                      <Select
                        value={editMode || undefined}
                        onValueChange={setEditMode}
                        disabled={isSaving}
                      >
                        <SelectTrigger id="edit-mode">
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                        <SelectContent>
                          {MODES.map((m) => (
                            <SelectItem key={m} value={m}>
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Tempo and Time Signature */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="edit-tempo">Tempo (BPM)</Label>
                      <Input
                        id="edit-tempo"
                        type="number"
                        min={1}
                        max={400}
                        value={editTempo}
                        onChange={(e) => setEditTempo(e.target.value)}
                        disabled={isSaving}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-time">Time Signature</Label>
                      <Select
                        value={editTimeSignature || undefined}
                        onValueChange={setEditTimeSignature}
                        disabled={isSaving}
                      >
                        <SelectTrigger id="edit-time">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_SIGNATURES.map((ts) => (
                            <SelectItem key={ts} value={ts}>
                              {ts}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-notes">Notes</Label>
                    <Textarea
                      id="edit-notes"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      disabled={isSaving}
                      rows={4}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Display mode */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Key</p>
                      <p className="font-medium">
                        {song?.key
                          ? `${song.key}${song.mode ? ` ${song.mode}` : ""}`
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tempo</p>
                      <p className="font-medium">
                        {song?.tempo ? `${song.tempo} BPM` : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Time Signature
                      </p>
                      <p className="font-medium">{song?.timeSignature || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">
                        {song?.durationSeconds
                          ? `${Math.floor(song.durationSeconds / 60)}:${String(
                              song.durationSeconds % 60
                            ).padStart(2, "0")}`
                          : "—"}
                      </p>
                    </div>
                  </div>
                  {song?.notes && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Notes
                        </p>
                        <p className="whitespace-pre-wrap">{song.notes}</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Files Section */}
          {!isLoading && song && <SongFilesSection songId={songId} />}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Practice Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Practice Status</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-10 bg-muted rounded animate-pulse" />
              ) : (
                <Select
                  value={song?.practiceStatus}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRACTICE_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Info</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              {isLoading ? (
                <>
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse" />
                </>
              ) : (
                <>
                  <p>
                    Added{" "}
                    {song?.createdAt
                      ? new Date(song.createdAt).toLocaleDateString()
                      : "—"}
                  </p>
                  {song?.updatedAt && (
                    <p>
                      Updated {new Date(song.updatedAt).toLocaleDateString()}
                    </p>
                  )}
                  <p>{song?.files?.length ?? 0} files attached</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Song</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{song?.title}&quot;? This
              will also delete all attached files. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

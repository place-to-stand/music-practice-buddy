"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

interface CreateSongDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bandId: Id<"bands">;
  onSuccess?: (songId: Id<"songs">) => void;
}

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

export function CreateSongDialog({
  open,
  onOpenChange,
  bandId,
  onSuccess,
}: CreateSongDialogProps) {
  const [title, setTitle] = useState("");
  const [key, setKey] = useState<string>("");
  const [mode, setMode] = useState<string>("");
  const [tempo, setTempo] = useState<string>("");
  const [timeSignature, setTimeSignature] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSong = useMutation(api.songs.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Song title is required");
      return;
    }

    const tempoNum = tempo ? parseInt(tempo, 10) : undefined;
    if (tempo && (isNaN(tempoNum!) || tempoNum! < 1 || tempoNum! > 400)) {
      setError("Tempo must be between 1 and 400 BPM");
      return;
    }

    setIsSubmitting(true);

    try {
      const songId = await createSong({
        bandId,
        title: title.trim(),
        key: key || undefined,
        mode: mode || undefined,
        tempo: tempoNum,
        timeSignature: timeSignature || undefined,
        notes: notes.trim() || undefined,
      });

      resetForm();
      onOpenChange(false);
      onSuccess?.(songId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create song");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setKey("");
    setMode("");
    setTempo("");
    setTimeSignature("");
    setNotes("");
    setError(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add a Song</DialogTitle>
            <DialogDescription>
              Add a new song to your band&apos;s repertoire.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="song-title">Title *</Label>
              <Input
                id="song-title"
                placeholder="Enter song title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            {/* Key and Mode */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="song-key">Key</Label>
                <Select
                  value={key || undefined}
                  onValueChange={setKey}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="song-key">
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
                <Label htmlFor="song-mode">Mode</Label>
                <Select
                  value={mode || undefined}
                  onValueChange={setMode}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="song-mode">
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
                <Label htmlFor="song-tempo">Tempo (BPM)</Label>
                <Input
                  id="song-tempo"
                  type="number"
                  placeholder="e.g., 120"
                  min={1}
                  max={400}
                  value={tempo}
                  onChange={(e) => setTempo(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="song-time">Time Signature</Label>
                <Select
                  value={timeSignature || undefined}
                  onValueChange={setTimeSignature}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="song-time">
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
              <Label htmlFor="song-notes">Notes</Label>
              <Textarea
                id="song-notes"
                placeholder="Optional notes about this song..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim()}>
              {isSubmitting ? "Adding..." : "Add Song"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

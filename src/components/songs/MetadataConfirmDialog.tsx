"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
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
import { formatDuration } from "@/lib/audio";

interface MetadataValues {
  durationSeconds?: number;
  tempo?: number;
  key?: string;
}

interface MetadataConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  songId: Id<"songs">;
  detected: MetadataValues;
  current: MetadataValues;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * Dialog that shows detected vs current song metadata
 * and allows user to confirm updating the song with detected values
 */
export function MetadataConfirmDialog({
  open,
  onOpenChange,
  songId,
  detected,
  current,
  onSuccess,
  onError,
}: MetadataConfirmDialogProps) {
  const applySongMetadata = useMutation(api.waveform.applySongMetadata);

  const handleConfirm = async () => {
    try {
      await applySongMetadata({
        songId,
        durationSeconds: detected.durationSeconds,
        tempo: detected.tempo,
        key: detected.key,
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update song metadata";
      onError?.(message);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  // Build diff rows
  const diffs: { label: string; current: string; detected: string }[] = [];

  if (detected.durationSeconds !== undefined) {
    diffs.push({
      label: "Duration",
      current: current.durationSeconds !== undefined ? formatDuration(current.durationSeconds) : "—",
      detected: formatDuration(detected.durationSeconds),
    });
  }

  if (detected.tempo !== undefined) {
    diffs.push({
      label: "Tempo",
      current: current.tempo !== undefined ? `${current.tempo} BPM` : "—",
      detected: `${detected.tempo} BPM`,
    });
  }

  if (detected.key !== undefined) {
    diffs.push({
      label: "Key",
      current: current.key ?? "—",
      detected: detected.key,
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Update Song Metadata?</AlertDialogTitle>
          <AlertDialogDescription>
            The primary audio file has different metadata than the song. Would you like to update the song with the detected values?
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Diff table */}
        <div className="rounded-md border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Field</th>
                <th className="text-left px-3 py-2 font-medium">Current</th>
                <th className="text-left px-3 py-2 font-medium">Detected</th>
              </tr>
            </thead>
            <tbody>
              {diffs.map((diff) => (
                <tr key={diff.label} className="border-t">
                  <td className="px-3 py-2 text-muted-foreground">{diff.label}</td>
                  <td className="px-3 py-2">
                    <span className={diff.current !== "—" ? "text-yellow-600 dark:text-yellow-400" : "text-muted-foreground"}>
                      {diff.current}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      {diff.detected}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Keep Current</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Update Song</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

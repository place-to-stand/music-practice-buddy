"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  RotateCcw,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { FileTypeIcon, MetadataUpdateInfo } from "./FileUploadDropzone";
import { formatFileSize } from "@/hooks/useFileUpload";
import { toast } from "sonner";

// File type display labels
const FILE_TYPE_LABELS: Record<string, string> = {
  audio: "Audio",
  video: "Video",
  chart: "Chart",
  tab: "Tab",
  gp: "Guitar Pro",
  stem: "Stem",
  other: "Other",
};

interface ArchivedFilesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  songId: Id<"songs">;
  onMetadataDetected?: (info: MetadataUpdateInfo) => void;
}

export function ArchivedFilesDialog({
  open,
  onOpenChange,
  songId,
  onMetadataDetected,
}: ArchivedFilesDialogProps) {
  const archivedFiles = useQuery(api.files.listArchivedBySong, { songId });
  const restoreFile = useMutation(api.files.restore);
  const permanentDelete = useMutation(api.files.permanentDelete);
  const applySongMetadata = useMutation(api.waveform.applySongMetadata);

  const handleRestore = async (fileId: Id<"songFiles">) => {
    try {
      const result = await restoreFile({ id: fileId });
      toast.success("File restored");

      // If restored file became primary and has metadata, handle it
      if (result.becamePrimary && result.detected && (
        result.detected.durationSeconds !== undefined ||
        result.detected.tempo !== undefined ||
        result.detected.key !== undefined
      )) {
        if (result.songHasNoMetadata) {
          // Auto-apply detected metadata
          await applySongMetadata({
            songId: result.songId,
            durationSeconds: result.detected.durationSeconds,
            tempo: result.detected.tempo,
            key: result.detected.key,
          });
          toast.success("Song metadata updated from restored file");
        } else if (result.hasConflict && onMetadataDetected) {
          // Show confirmation dialog via parent
          onMetadataDetected({
            songId: result.songId,
            hasConflict: result.hasConflict,
            songHasNoMetadata: result.songHasNoMetadata,
            detected: result.detected,
            current: result.current,
          });
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to restore file");
    }
  };

  const handlePermanentDelete = async (fileId: Id<"songFiles">) => {
    try {
      await permanentDelete({ id: fileId });
      toast.success("File permanently deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete file");
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isLoading = archivedFiles === undefined;
  const hasFiles = archivedFiles && archivedFiles.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Archived Files</DialogTitle>
          <DialogDescription>
            View and restore previously archived files. Files are permanently deleted only when you choose &quot;Delete Permanently&quot;.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg border animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-muted" />
                    <div className="space-y-1">
                      <div className="h-4 bg-muted rounded w-32" />
                      <div className="h-3 bg-muted rounded w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : hasFiles ? (
            archivedFiles.map((file) => (
              <div
                key={file._id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 h-8 w-8 rounded bg-muted flex items-center justify-center">
                    <FileTypeIcon fileType={file.fileType} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate text-muted-foreground">
                        {file.fileName || file.variantLabel || `${FILE_TYPE_LABELS[file.fileType]} file`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{FILE_TYPE_LABELS[file.fileType] || file.fileType}</span>
                      {file.fileSize && (
                        <>
                          <span>•</span>
                          <span>{formatFileSize(file.fileSize)}</span>
                        </>
                      )}
                      {file.deletedAt && (
                        <>
                          <span>•</span>
                          <span>Archived {formatDate(file.deletedAt)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {file.url && (
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="h-8 w-8"
                    >
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleRestore(file._id)}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Restore
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handlePermanentDelete(file._id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Permanently
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No archived files</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useCallback, useState, useRef, useImperativeHandle, forwardRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, FileAudio, FileVideo, FileText, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFileUpload, detectFileType } from "@/hooks/useFileUpload";

interface FileUploadDropzoneProps {
  songId: Id<"songs">;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  /** Whether the dropzone UI is visible (still accepts drops when hidden) */
  visible?: boolean;
  /** Called when a drag enters/leaves the dropzone area */
  onDragStateChange?: (isDragging: boolean) => void;
  /** Render as full-card overlay (absolute positioned) */
  asOverlay?: boolean;
}

export interface FileUploadDropzoneRef {
  openFilePicker: () => void;
}

export const FileUploadDropzone = forwardRef<FileUploadDropzoneRef, FileUploadDropzoneProps>(
  function FileUploadDropzone({
    songId,
    onSuccess,
    onError,
    visible = true,
    onDragStateChange,
    asOverlay = false,
  }, ref) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isUploading, progress, error, upload, reset } = useFileUpload();
  const saveSongFile = useMutation(api.files.saveSongFile);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    openFilePicker: () => fileInputRef.current?.click(),
  }));

  const handleFile = useCallback(
    async (file: File) => {
      const result = await upload(file);
      if (!result) {
        onError?.(error || "Upload failed");
        return;
      }

      try {
        const fileType = detectFileType(file);
        await saveSongFile({
          songId,
          storageId: result.storageId,
          fileType,
          fileName: result.fileName,
          fileSize: result.fileSize,
          mimeType: result.mimeType,
        });
        reset();
        onSuccess?.();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to save file";
        onError?.(message);
        reset();
      }
    },
    [upload, saveSongFile, songId, onSuccess, onError, error, reset]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      onDragStateChange?.(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile, onDragStateChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    onDragStateChange?.(true);
  }, [onDragStateChange]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    onDragStateChange?.(false);
  }, [onDragStateChange]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
      // Reset input so same file can be selected again
      e.target.value = "";
    },
    [handleFile]
  );

  // Always show when uploading
  if (isUploading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Uploading...</span>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <Progress value={progress} />
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </Card>
    );
  }

  // Hidden file input that can be triggered programmatically
  const hiddenInput = (
    <input
      ref={fileInputRef}
      type="file"
      className="hidden"
      onChange={handleFileSelect}
      accept="audio/*,video/*,image/*,.pdf,.gp,.gp3,.gp4,.gp5,.gpx,.gp7,.txt"
    />
  );

  // When not visible, render only the hidden input
  if (!visible) {
    return hiddenInput;
  }

  // Overlay mode - covers the entire parent card
  if (asOverlay) {
    return (
      <div
        className="absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/10 backdrop-blur-sm"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {hiddenInput}
        <div className="flex flex-col items-center gap-2 text-primary">
          <Upload className="h-10 w-10" />
          <p className="font-medium">Drop file to upload</p>
        </div>
      </div>
    );
  }

  // Normal dropzone mode
  return (
    <Card
      className={cn(
        "border-2 border-dashed transition-colors",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-muted-foreground/50"
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <label className="flex flex-col items-center justify-center p-8 cursor-pointer">
        {hiddenInput}
        <Upload className="h-10 w-10 text-muted-foreground mb-4" />
        <p className="text-sm font-medium mb-1">
          Drop a file here or click to browse
        </p>
        <p className="text-xs text-muted-foreground">
          Audio, video, images, PDFs, or Guitar Pro files (max 100MB)
        </p>
      </label>
      {error && (
        <div className="px-6 pb-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </Card>
  );
});

// Helper component for file type icons
interface FileTypeIconProps {
  fileType: string;
  className?: string;
}

export function FileTypeIcon({ fileType, className }: FileTypeIconProps) {
  const iconClass = cn("h-4 w-4", className);

  switch (fileType) {
    case "audio":
    case "stem":
      return <FileAudio className={iconClass} />;
    case "video":
      return <FileVideo className={iconClass} />;
    case "chart":
    case "tab":
    case "gp":
      return <FileText className={iconClass} />;
    default:
      return <File className={iconClass} />;
  }
}

"use client";

import { useState, useCallback, useRef } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link2, Youtube, Music2, Cloud, HardDrive, Loader2 } from "lucide-react";
import { fetchYouTubeMetadata, isYouTubeUrl } from "@/lib/youtube";

interface ExternalUrlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  songId: Id<"songs">;
  onSuccess?: () => void;
}

const FILE_TYPES = [
  { value: "audio", label: "Audio" },
  { value: "video", label: "Video" },
  { value: "chart", label: "Chart/Sheet Music" },
  { value: "tab", label: "Tab" },
  { value: "gp", label: "Guitar Pro" },
  { value: "other", label: "Other" },
] as const;

// Detect service from URL
function detectService(url: string): { service: string; icon: React.ReactNode } {
  const urlLower = url.toLowerCase();

  if (urlLower.includes("music.youtube.com")) {
    return { service: "YouTube Music", icon: <Youtube className="h-4 w-4 text-red-500" /> };
  }
  if (urlLower.includes("youtube.com") || urlLower.includes("youtu.be")) {
    return { service: "YouTube", icon: <Youtube className="h-4 w-4 text-red-500" /> };
  }
  if (urlLower.includes("dropbox.com")) {
    return { service: "Dropbox", icon: <Cloud className="h-4 w-4 text-blue-500" /> };
  }
  if (urlLower.includes("drive.google.com")) {
    return { service: "Google Drive", icon: <HardDrive className="h-4 w-4 text-yellow-600" /> };
  }
  if (urlLower.includes("bandcamp.com")) {
    return { service: "Bandcamp", icon: <Music2 className="h-4 w-4 text-teal-500" /> };
  }
  return { service: "External Link", icon: <Link2 className="h-4 w-4 text-gray-500" /> };
}

export function ExternalUrlDialog({
  open,
  onOpenChange,
  songId,
  onSuccess,
}: ExternalUrlDialogProps) {
  const [url, setUrl] = useState("");
  const [fileType, setFileType] = useState<string>("audio");
  const [fileName, setFileName] = useState("");
  const [variantLabel, setVariantLabel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchedUrl = useRef("");

  const saveExternalUrl = useMutation(api.files.saveExternalUrl);

  const detectedService = url ? detectService(url) : null;

  // Fetch YouTube metadata and auto-fill fields
  const fetchMetadata = useCallback(async (youtubeUrl: string) => {
    if (lastFetchedUrl.current === youtubeUrl) return;

    lastFetchedUrl.current = youtubeUrl;
    setIsFetchingMetadata(true);

    try {
      const metadata = await fetchYouTubeMetadata(youtubeUrl);
      if (metadata) {
        // Use the parsed song title or full title as display name
        const displayName = metadata.parsedSongTitle || metadata.title;
        setFileName(displayName);
        // Set file type based on URL - music.youtube.com = audio, regular youtube = video
        const isYouTubeMusic = youtubeUrl.toLowerCase().includes("music.youtube.com");
        setFileType(isYouTubeMusic ? "audio" : "video");
      }
    } catch {
      // Silently fail - user can still manually enter data
    } finally {
      setIsFetchingMetadata(false);
    }
  }, []);

  // Handle URL change - auto-fetch for YouTube URLs
  const handleUrlChange = useCallback((newUrl: string) => {
    setUrl(newUrl);

    // Auto-fetch metadata for YouTube URLs
    if (newUrl.length > 10 && isYouTubeUrl(newUrl)) {
      fetchMetadata(newUrl);
    }
  }, [fetchMetadata]);

  // Handle paste event for immediate detection
  const handleUrlPaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text");
    if (pastedText && isYouTubeUrl(pastedText)) {
      // Fetch metadata after a brief delay to let the input update
      setTimeout(() => fetchMetadata(pastedText), 0);
    }
  }, [fetchMetadata]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError("URL is required");
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    setIsSubmitting(true);

    try {
      await saveExternalUrl({
        songId,
        externalUrl: url.trim(),
        fileType,
        fileName: fileName.trim() || undefined,
        variantLabel: variantLabel.trim() || undefined,
      });
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add link");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setUrl("");
    setFileType("audio");
    setFileName("");
    setVariantLabel("");
    setError(null);
    lastFetchedUrl.current = "";
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add External Link</DialogTitle>
            <DialogDescription>
              Link to a file on Dropbox, YouTube, Bandcamp, Google Drive, or any URL.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* URL */}
            <div className="space-y-2">
              <Label htmlFor="external-url">URL *</Label>
              <div className="relative">
                <Input
                  id="external-url"
                  type="url"
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  onPaste={handleUrlPaste}
                  disabled={isSubmitting}
                  autoFocus
                  className={detectedService ? "pr-28" : ""}
                />
                {detectedService && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-muted-foreground">
                    {isFetchingMetadata ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      detectedService.icon
                    )}
                    <span>{isFetchingMetadata ? "Fetching..." : detectedService.service}</span>
                  </div>
                )}
              </div>
            </div>

            {/* File Type */}
            <div className="space-y-2">
              <Label htmlFor="file-type">File Type *</Label>
              <Select
                value={fileType}
                onValueChange={setFileType}
                disabled={isSubmitting}
              >
                <SelectTrigger id="file-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {FILE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* File Name (optional) */}
            <div className="space-y-2">
              <Label htmlFor="file-name">Display Name</Label>
              <Input
                id="file-name"
                placeholder="Optional display name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Variant Label (optional) */}
            <div className="space-y-2">
              <Label htmlFor="variant-label">Variant</Label>
              <Input
                id="variant-label"
                placeholder="e.g., Live Version, Instrumental"
                value={variantLabel}
                onChange={(e) => setVariantLabel(e.target.value)}
                disabled={isSubmitting}
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
            <Button type="submit" disabled={isSubmitting || !url.trim()}>
              {isSubmitting ? "Adding..." : "Add Link"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

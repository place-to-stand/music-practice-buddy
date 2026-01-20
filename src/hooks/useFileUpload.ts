"use client";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useCallback } from "react";
import { Id } from "../../convex/_generated/dataModel";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

interface UploadResult {
  storageId: Id<"_storage">;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export function useFileUpload() {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  const upload = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      setState({ isUploading: true, progress: 0, error: null });

      try {
        // Client-side file size validation
        if (file.size > MAX_FILE_SIZE) {
          throw new Error(`File too large. Maximum size is 100MB.`);
        }

        // Get upload URL from Convex
        const uploadUrl = await generateUploadUrl();

        // Upload with progress tracking using XMLHttpRequest
        const storageId = await new Promise<string>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              const percent = Math.round((e.loaded / e.total) * 100);
              setState((s) => ({ ...s, progress: percent }));
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                resolve(response.storageId);
              } catch {
                reject(new Error("Invalid response from server"));
              }
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          });

          xhr.addEventListener("error", () => {
            reject(new Error("Network error during upload"));
          });

          xhr.addEventListener("abort", () => {
            reject(new Error("Upload was cancelled"));
          });

          xhr.open("POST", uploadUrl);
          xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
          xhr.send(file);
        });

        setState({ isUploading: false, progress: 100, error: null });

        return {
          storageId: storageId as Id<"_storage">,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || "application/octet-stream",
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Upload failed";
        setState({ isUploading: false, progress: 0, error: errorMessage });
        return null;
      }
    },
    [generateUploadUrl]
  );

  const reset = useCallback(() => {
    setState({ isUploading: false, progress: 0, error: null });
  }, []);

  return {
    ...state,
    upload,
    reset,
  };
}

/**
 * Determine file type from MIME type or extension
 */
export function detectFileType(
  file: File
): "audio" | "video" | "chart" | "tab" | "gp" | "stem" | "other" {
  const mimeType = file.type.toLowerCase();
  const extension = file.name.split(".").pop()?.toLowerCase() || "";

  // Audio files
  if (
    mimeType.startsWith("audio/") ||
    ["mp3", "wav", "flac", "m4a", "aac", "ogg", "wma"].includes(extension)
  ) {
    return "audio";
  }

  // Video files
  if (
    mimeType.startsWith("video/") ||
    ["mp4", "mov", "webm", "avi", "mkv"].includes(extension)
  ) {
    return "video";
  }

  // Guitar Pro files
  if (["gp", "gp3", "gp4", "gp5", "gpx", "gp7"].includes(extension)) {
    return "gp";
  }

  // Text tab files
  if (extension === "txt" && file.name.toLowerCase().includes("tab")) {
    return "tab";
  }

  // Chart files (images and PDFs)
  if (
    mimeType === "application/pdf" ||
    mimeType.startsWith("image/") ||
    ["pdf", "png", "jpg", "jpeg", "gif"].includes(extension)
  ) {
    return "chart";
  }

  return "other";
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

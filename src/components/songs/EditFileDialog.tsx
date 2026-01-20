"use client";

import { useState, useEffect } from "react";
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

interface EditFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: {
    _id: Id<"songFiles">;
    fileName?: string;
    variantLabel?: string;
    fileType: string;
  } | null;
  onSuccess?: () => void;
}

const FILE_TYPES = [
  { value: "audio", label: "Audio" },
  { value: "video", label: "Video" },
  { value: "chart", label: "Chart/Sheet Music" },
  { value: "tab", label: "Tab" },
  { value: "gp", label: "Guitar Pro" },
  { value: "stem", label: "Stem" },
  { value: "other", label: "Other" },
] as const;

export function EditFileDialog({
  open,
  onOpenChange,
  file,
  onSuccess,
}: EditFileDialogProps) {
  const [fileName, setFileName] = useState("");
  const [variantLabel, setVariantLabel] = useState("");
  const [fileType, setFileType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateMetadata = useMutation(api.files.updateMetadata);

  // Populate form when file changes
  useEffect(() => {
    if (file) {
      setFileName(file.fileName || "");
      setVariantLabel(file.variantLabel || "");
      setFileType(file.fileType);
    }
  }, [file]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setError(null);
    setIsSubmitting(true);

    try {
      await updateMetadata({
        id: file._id,
        fileName: fileName.trim() || undefined,
        variantLabel: variantLabel.trim() || undefined,
        fileType: fileType || undefined,
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update file");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit File</DialogTitle>
            <DialogDescription>
              Update the file&apos;s display name, variant label, or type.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* File Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-file-name">Display Name</Label>
              <Input
                id="edit-file-name"
                placeholder="Enter display name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            {/* Variant Label */}
            <div className="space-y-2">
              <Label htmlFor="edit-variant">Variant</Label>
              <Input
                id="edit-variant"
                placeholder="e.g., Live Version, Instrumental"
                value={variantLabel}
                onChange={(e) => setVariantLabel(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* File Type */}
            <div className="space-y-2">
              <Label htmlFor="edit-file-type">File Type</Label>
              <Select
                value={fileType}
                onValueChange={setFileType}
                disabled={isSubmitting}
              >
                <SelectTrigger id="edit-file-type">
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

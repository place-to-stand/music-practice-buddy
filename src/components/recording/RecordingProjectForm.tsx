"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface RecordingProjectFormProps {
  projectId?: Id<"recordingProjects">;
  initialData?: {
    name: string;
    bandId?: Id<"bands">;
    status?: string;
    notes?: string;
  };
}

const statusOptions = [
  { value: "pre_production", label: "Pre-Production" },
  { value: "tracking", label: "Tracking" },
  { value: "mixing", label: "Mixing" },
  { value: "mastering", label: "Mastering" },
  { value: "complete", label: "Complete" },
];

export function RecordingProjectForm({
  projectId,
  initialData,
}: RecordingProjectFormProps) {
  const router = useRouter();
  const bands = useQuery(api.bands.list);
  const createProject = useMutation(api.recordingProjects.create);
  const updateProject = useMutation(api.recordingProjects.update);

  const [name, setName] = useState(initialData?.name || "");
  const [bandId, setBandId] = useState<Id<"bands"> | undefined>(
    initialData?.bandId
  );
  const [status, setStatus] = useState(initialData?.status || "pre_production");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      if (projectId) {
        await updateProject({
          id: projectId,
          name: name.trim(),
          bandId,
          status,
          notes: notes.trim() || undefined,
        });
        router.push(`/recording/${projectId}`);
      } else {
        const newId = await createProject({
          name: name.trim(),
          bandId,
          status,
          notes: notes.trim() || undefined,
        });
        router.push(`/recording/${newId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Project Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Album Recording 2026"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="band">Associated Band (optional)</Label>
        <select
          id="band"
          value={bandId || ""}
          onChange={(e) =>
            setBandId(e.target.value ? (e.target.value as Id<"bands">) : undefined)
          }
          className="w-full px-3 py-2 border rounded-md bg-background"
        >
          <option value="">No band</option>
          {bands?.map((band) => (
            <option key={band._id} value={band._id}>
              {band.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-3 py-2 border rounded-md bg-background"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Project notes, goals, etc."
          rows={4}
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : projectId
              ? "Update Project"
              : "Create Project"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

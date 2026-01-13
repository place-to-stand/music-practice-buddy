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

interface SetlistFormProps {
  setlistId?: Id<"setlists">;
  initialData?: {
    name?: string;
    bandId: Id<"bands">;
    date?: string;
    venue?: string;
    notes?: string;
  };
}

export function SetlistForm({ setlistId, initialData }: SetlistFormProps) {
  const router = useRouter();
  const bands = useQuery(api.bands.list);
  const createSetlist = useMutation(api.setlists.create);
  const updateSetlist = useMutation(api.setlists.update);

  const [name, setName] = useState(initialData?.name || "");
  const [bandId, setBandId] = useState<Id<"bands"> | undefined>(
    initialData?.bandId
  );
  const [date, setDate] = useState(initialData?.date || "");
  const [venue, setVenue] = useState(initialData?.venue || "");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!bandId) {
      setError("Please select a band");
      return;
    }

    if (!name.trim()) {
      setError("Setlist name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      if (setlistId) {
        await updateSetlist({
          id: setlistId,
          name: name.trim(),
          date: date || undefined,
          venue: venue.trim() || undefined,
          notes: notes.trim() || undefined,
        });
        router.push(`/setlists/${setlistId}`);
      } else {
        const newId = await createSetlist({
          bandId,
          name: name.trim(),
          date: date || undefined,
          venue: venue.trim() || undefined,
          notes: notes.trim() || undefined,
        });
        router.push(`/setlists/${newId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save setlist");
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
        <Label htmlFor="band">Band *</Label>
        <select
          id="band"
          value={bandId || ""}
          onChange={(e) =>
            setBandId(e.target.value ? (e.target.value as Id<"bands">) : undefined)
          }
          className="w-full px-3 py-2 border rounded-md bg-background"
          required
          disabled={!!setlistId}
        >
          <option value="">Select a band</option>
          {bands?.map((band) => (
            <option key={band._id} value={band._id}>
              {band.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Setlist Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Friday Night Show"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Event Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="venue">Venue</Label>
          <Input
            id="venue"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder="e.g., The Blue Note"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Show notes, special requirements, etc."
          rows={4}
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : setlistId
              ? "Update Setlist"
              : "Create Setlist"}
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

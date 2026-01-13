"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ArrowLeft } from "lucide-react";
import { SetlistForm } from "@/components/setlists/SetlistForm";

export default function EditSetlistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const setlist = useQuery(api.setlists.getById, {
    id: id as Id<"setlists">,
  });

  if (setlist === undefined) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (setlist === null) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/setlists"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to setlists
          </Link>
        </div>
        <div className="text-center py-12">
          <h2 className="text-lg font-medium">Setlist not found</h2>
          <p className="text-muted-foreground">
            This setlist may have been deleted or you don&apos;t have access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/setlists/${setlist._id}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to setlist
        </Link>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Edit Setlist</h1>
        <p className="text-muted-foreground">Update your setlist details</p>
      </div>

      <div className="max-w-xl">
        <SetlistForm
          setlistId={setlist._id}
          initialData={{
            name: setlist.name,
            bandId: setlist.bandId,
            date: setlist.date,
            venue: setlist.venue,
            notes: setlist.notes,
          }}
        />
      </div>
    </div>
  );
}

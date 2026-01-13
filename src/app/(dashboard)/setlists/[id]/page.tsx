"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Pencil, Music, Plus, Clock, MapPin } from "lucide-react";

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
}

export default function SetlistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const setlist = useQuery(api.setlists.getSetlistWithDuration, {
    id: id as Id<"setlists">,
  });

  if (setlist === undefined) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
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
          href="/setlists"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to setlists
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {setlist.name || "Untitled Setlist"}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {setlist.venue && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{setlist.venue}</span>
              </div>
            )}
            {setlist.date && <span>{setlist.date}</span>}
            {setlist.totalDuration > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(setlist.totalDuration)}</span>
              </div>
            )}
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/setlists/${setlist._id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>

      {setlist.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {setlist.notes}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Songs</CardTitle>
          <Button size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Song
          </Button>
        </CardHeader>
        <CardContent>
          {setlist.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Music className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                No songs in this setlist yet
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {setlist.items.map((item, index) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-sm w-6">
                      {index + 1}.
                    </span>
                    <div>
                      <span className="font-medium">
                        {item.song?.title || "Unknown Song"}
                      </span>
                      {item.transitionNotes && (
                        <p className="text-xs text-muted-foreground">
                          {item.transitionNotes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDuration(item.runningDuration)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Pencil, Music, Plus } from "lucide-react";

const statusColors: Record<string, string> = {
  pre_production: "bg-blue-100 text-blue-800",
  tracking: "bg-yellow-100 text-yellow-800",
  mixing: "bg-purple-100 text-purple-800",
  mastering: "bg-orange-100 text-orange-800",
  complete: "bg-green-100 text-green-800",
};

const statusLabels: Record<string, string> = {
  pre_production: "Pre-Production",
  tracking: "Tracking",
  mixing: "Mixing",
  mastering: "Mastering",
  complete: "Complete",
};

const nextStatus: Record<string, string> = {
  pre_production: "tracking",
  tracking: "mixing",
  mixing: "mastering",
  mastering: "complete",
};

export default function RecordingProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const project = useQuery(api.recordingProjects.getWithSongs, {
    id: id as Id<"recordingProjects">,
  });
  const updateStatus = useMutation(api.recordingProjects.updateStatus);

  if (project === undefined) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/recording"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to projects
          </Link>
        </div>
        <div className="text-center py-12">
          <h2 className="text-lg font-medium">Project not found</h2>
          <p className="text-muted-foreground">
            This project may have been deleted or you don&apos;t have access.
          </p>
        </div>
      </div>
    );
  }

  const statusColor = statusColors[project.status] || "bg-gray-100 text-gray-800";
  const statusLabel = statusLabels[project.status] || project.status;
  const canAdvance = nextStatus[project.status];

  const handleAdvanceStatus = async () => {
    if (canAdvance) {
      await updateStatus({
        id: project._id,
        status: canAdvance,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/recording"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to projects
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
          <div className="flex items-center gap-3">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}
            >
              {statusLabel}
            </span>
            {canAdvance && (
              <Button variant="outline" size="sm" onClick={handleAdvanceStatus}>
                Advance to {statusLabels[canAdvance]}
              </Button>
            )}
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/recording/${project._id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>

      {project.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {project.notes}
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
          {project.songs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Music className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                No songs in this project yet
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {project.songs.map((song, index) => (
                <div
                  key={song._id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-sm w-6">
                      {index + 1}.
                    </span>
                    <span className="font-medium">{song.title}</span>
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

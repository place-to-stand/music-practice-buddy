"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ArrowLeft } from "lucide-react";
import { RecordingProjectForm } from "@/components/recording/RecordingProjectForm";

export default function EditRecordingProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const project = useQuery(api.recordingProjects.getById, {
    id: id as Id<"recordingProjects">,
  });

  if (project === undefined) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/recording/${project._id}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to project
        </Link>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Edit Project</h1>
        <p className="text-muted-foreground">Update your recording project</p>
      </div>

      <div className="max-w-xl">
        <RecordingProjectForm
          projectId={project._id}
          initialData={{
            name: project.name,
            bandId: project.bandId,
            status: project.status,
            notes: project.notes,
          }}
        />
      </div>
    </div>
  );
}

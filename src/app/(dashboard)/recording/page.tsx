"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { RecordingProjectCard } from "@/components/recording/RecordingProjectCard";
import { Plus, Disc3 } from "lucide-react";

const statusFilters = [
  { value: "", label: "All" },
  { value: "pre_production", label: "Pre-Production" },
  { value: "tracking", label: "Tracking" },
  { value: "mixing", label: "Mixing" },
  { value: "mastering", label: "Mastering" },
  { value: "complete", label: "Complete" },
];

export default function RecordingProjectsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const projects = useQuery(api.recordingProjects.list, {
    status: statusFilter || undefined,
  });
  const deleteProject = useMutation(api.recordingProjects.softDelete);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      await deleteProject({ id: id as Id<"recordingProjects"> });
    }
  };

  if (projects === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Recording Projects</h1>
            <p className="text-muted-foreground">
              Manage your recording sessions and track progress
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 rounded-lg border bg-muted animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Recording Projects</h1>
          <p className="text-muted-foreground">
            Manage your recording sessions and track progress
          </p>
        </div>
        <Button asChild>
          <Link href="/recording/new">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {statusFilters.map((filter) => (
          <Button
            key={filter.value}
            variant={statusFilter === filter.value ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Disc3 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No recording projects yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first recording project to start tracking
          </p>
          <Button asChild>
            <Link href="/recording/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <RecordingProjectCard
              key={project._id}
              project={project}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

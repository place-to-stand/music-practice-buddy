"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Disc3, Pencil, Trash2 } from "lucide-react";

interface RecordingProject {
  _id: string;
  name: string;
  status: string;
  notes?: string;
  createdAt: number;
}

interface RecordingProjectCardProps {
  project: RecordingProject;
  onDelete?: (id: string) => void;
}

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

export function RecordingProjectCard({
  project,
  onDelete,
}: RecordingProjectCardProps) {
  const statusColor = statusColors[project.status] || "bg-gray-100 text-gray-800";
  const statusLabel = statusLabels[project.status] || project.status;

  return (
    <Card className="group relative">
      <Link href={`/recording/${project._id}`} className="absolute inset-0 z-0" />
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Disc3 className="h-5 w-5" />
            {project.name}
          </CardTitle>
          {project.notes && (
            <CardDescription className="line-clamp-2">
              {project.notes}
            </CardDescription>
          )}
        </div>
        <div className="relative z-10 flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
            asChild
          >
            <Link href={`/recording/${project._id}/edit`}>
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Link>
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
              onClick={(e) => {
                e.preventDefault();
                onDelete(project._id);
              }}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
            {statusLabel}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

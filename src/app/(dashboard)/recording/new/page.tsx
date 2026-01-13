"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RecordingProjectForm } from "@/components/recording/RecordingProjectForm";

export default function NewRecordingProjectPage() {
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

      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          New Recording Project
        </h1>
        <p className="text-muted-foreground">
          Create a new project to track your recording session
        </p>
      </div>

      <div className="max-w-xl">
        <RecordingProjectForm />
      </div>
    </div>
  );
}

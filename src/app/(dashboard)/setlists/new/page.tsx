"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SetlistForm } from "@/components/setlists/SetlistForm";

export default function NewSetlistPage() {
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

      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">New Setlist</h1>
        <p className="text-muted-foreground">
          Create a new setlist for an upcoming show
        </p>
      </div>

      <div className="max-w-xl">
        <SetlistForm />
      </div>
    </div>
  );
}

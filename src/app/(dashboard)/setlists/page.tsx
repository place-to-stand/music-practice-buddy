"use client";

import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { SetlistCard } from "@/components/setlists/SetlistCard";
import { Plus, ListMusic } from "lucide-react";

export default function SetlistsPage() {
  const setlists = useQuery(api.setlists.list);
  const deleteSetlist = useMutation(api.setlists.softDelete);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this setlist?")) {
      await deleteSetlist({ id: id as Id<"setlists"> });
    }
  };

  if (setlists === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Setlists</h1>
            <p className="text-muted-foreground">
              Build and manage setlists for your performances
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
          <h1 className="text-2xl font-bold tracking-tight">Setlists</h1>
          <p className="text-muted-foreground">
            Build and manage setlists for your performances
          </p>
        </div>
        <Button asChild>
          <Link href="/setlists/new">
            <Plus className="mr-2 h-4 w-4" />
            New Setlist
          </Link>
        </Button>
      </div>

      {setlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ListMusic className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No setlists yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first setlist to start planning your shows
          </p>
          <Button asChild>
            <Link href="/setlists/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Setlist
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {setlists.map((setlist) => (
            <SetlistCard
              key={setlist._id}
              setlist={setlist}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

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
import { ListMusic, Pencil, Trash2, Clock, MapPin } from "lucide-react";

interface Setlist {
  _id: string;
  name?: string;
  date?: string;
  venue?: string;
  notes?: string;
  estimatedDurationSeconds?: number;
  createdAt: number;
}

interface SetlistCardProps {
  setlist: Setlist;
  onDelete?: (id: string) => void;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
}

export function SetlistCard({ setlist, onDelete }: SetlistCardProps) {
  return (
    <Card className="group relative">
      <Link href={`/setlists/${setlist._id}`} className="absolute inset-0 z-0" />
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <ListMusic className="h-5 w-5" />
            {setlist.name || "Untitled Setlist"}
          </CardTitle>
          {setlist.notes && (
            <CardDescription className="line-clamp-2">
              {setlist.notes}
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
            <Link href={`/setlists/${setlist._id}/edit`}>
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
                onDelete(setlist._id);
              }}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {setlist.venue && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{setlist.venue}</span>
            </div>
          )}
          {setlist.date && (
            <div className="flex items-center gap-1">
              <span>{setlist.date}</span>
            </div>
          )}
          {setlist.estimatedDurationSeconds && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(setlist.estimatedDurationSeconds)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

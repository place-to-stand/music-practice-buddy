"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SongList, CreateSongDialog, PracticeStatus } from "@/components/songs";
import { ArrowLeft, Plus, Music, Users } from "lucide-react";
import Link from "next/link";

export default function BandSongsPage() {
  const params = useParams();
  const router = useRouter();
  const bandId = params.bandId as Id<"bands">;

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | PracticeStatus>("all");

  const band = useQuery(api.bands.get, { id: bandId });
  const songs = useQuery(api.songs.listByBand, { bandId });

  const isLoading = band === undefined || songs === undefined;

  // Not a member or band doesn't exist
  if (band === null) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Band not found</CardTitle>
            <CardDescription>
              This band doesn&apos;t exist or you don&apos;t have access to it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => router.push("/bands")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bands
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter songs by status
  const filteredSongs = songs?.filter((song) => {
    if (statusFilter === "all") return true;
    return song.practiceStatus === statusFilter;
  });

  // Get counts by status
  const statusCounts = {
    all: songs?.length ?? 0,
    new: songs?.filter((s) => s.practiceStatus === "new").length ?? 0,
    learning: songs?.filter((s) => s.practiceStatus === "learning").length ?? 0,
    solid: songs?.filter((s) => s.practiceStatus === "solid").length ?? 0,
    performance_ready:
      songs?.filter((s) => s.practiceStatus === "performance_ready").length ?? 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/bands")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isLoading ? (
                <span className="animate-pulse bg-muted rounded h-7 w-40 inline-block" />
              ) : (
                band?.name
              )}
            </h1>
            <p className="text-muted-foreground">
              {isLoading ? (
                <span className="animate-pulse bg-muted rounded h-4 w-24 inline-block" />
              ) : (
                `${songs?.length ?? 0} songs`
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/bands/${bandId}/members`}>
              <Users className="mr-2 h-4 w-4" />
              Members
            </Link>
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Song
          </Button>
        </div>
      </div>

      {/* Status filter tabs */}
      <Tabs
        value={statusFilter}
        onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}
      >
        <TabsList>
          <TabsTrigger value="all">
            All ({statusCounts.all})
          </TabsTrigger>
          <TabsTrigger value="new">
            New ({statusCounts.new})
          </TabsTrigger>
          <TabsTrigger value="learning">
            Learning ({statusCounts.learning})
          </TabsTrigger>
          <TabsTrigger value="solid">
            Solid ({statusCounts.solid})
          </TabsTrigger>
          <TabsTrigger value="performance_ready">
            Ready ({statusCounts.performance_ready})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-6">
          {isLoading ? (
            // Loading skeleton
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="h-5 bg-muted rounded w-3/4" />
                      <div className="h-5 bg-muted rounded w-16" />
                    </div>
                    <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-1">
                      <div className="h-5 bg-muted rounded w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredSongs && filteredSongs.length > 0 ? (
            <SongList songs={filteredSongs} />
          ) : songs && songs.length > 0 ? (
            // Has songs but none match filter
            <Card>
              <CardHeader>
                <CardTitle>No songs in this category</CardTitle>
                <CardDescription>
                  There are no songs with{" "}
                  {statusFilter === "performance_ready"
                    ? "Performance Ready"
                    : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}{" "}
                  status.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            // No songs at all
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  No songs yet
                </CardTitle>
                <CardDescription>
                  Add your first song to start tracking your band&apos;s
                  repertoire.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Song
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create song dialog */}
      <CreateSongDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        bandId={bandId}
        onSuccess={(songId) => {
          router.push(`/bands/${bandId}/songs/${songId}`);
        }}
      />
    </div>
  );
}

"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRACTICE_STATUS_OPTIONS } from "./PracticeStatusBadge";
import { toast } from "sonner";

interface PersonalPracticeStatusProps {
  songId: Id<"songs">;
}

export function PersonalPracticeStatus({ songId }: PersonalPracticeStatusProps) {
  const progress = useQuery(api.userSongProgress.getForSong, { songId });
  const updatePracticeStatus = useMutation(api.userSongProgress.updatePracticeStatus);

  const isLoading = progress === undefined;

  const handleStatusChange = async (status: string) => {
    try {
      await updatePracticeStatus({ songId, practiceStatus: status });
      toast.success("Practice status updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  // Default to "new" if no progress record exists
  const currentStatus = progress?.practiceStatus || "new";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">My Practice Status</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-10 bg-muted rounded animate-pulse" />
        ) : (
          <Select value={currentStatus} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRACTICE_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardContent>
    </Card>
  );
}

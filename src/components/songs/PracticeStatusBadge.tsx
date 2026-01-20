"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type PracticeStatus = "new" | "learning" | "solid" | "performance_ready";

interface PracticeStatusBadgeProps {
  status: PracticeStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  PracticeStatus,
  { label: string; variant: "default" | "secondary" | "outline"; className: string }
> = {
  new: {
    label: "New",
    variant: "outline",
    className: "border-gray-300 text-gray-600",
  },
  learning: {
    label: "Learning",
    variant: "secondary",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  },
  solid: {
    label: "Solid",
    variant: "secondary",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  },
  performance_ready: {
    label: "Performance Ready",
    variant: "default",
    className: "bg-green-600 hover:bg-green-600",
  },
};

export function PracticeStatusBadge({ status, className }: PracticeStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}

export const PRACTICE_STATUS_OPTIONS: { value: PracticeStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "learning", label: "Learning" },
  { value: "solid", label: "Solid" },
  { value: "performance_ready", label: "Performance Ready" },
];

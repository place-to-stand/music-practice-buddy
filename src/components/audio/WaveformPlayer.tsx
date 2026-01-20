"use client";

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import WaveSurfer from "wavesurfer.js";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  SkipBack,
  Volume2,
  VolumeX,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/audio";

export interface WaveformPlayerRef {
  play: () => void;
  pause: () => void;
  isPlaying: () => boolean;
}

interface WaveformPlayerProps {
  /** URL to the audio file */
  audioUrl: string;
  /** Pre-computed waveform peaks (0-1 normalized values) */
  peaks?: number[];
  /** Optional duration in seconds (used when peaks provided) */
  duration?: number;
  /** Height of the waveform in pixels */
  height?: number;
  /** Color of the waveform */
  waveColor?: string;
  /** Color of the played portion */
  progressColor?: string;
  /** Additional className for container */
  className?: string;
  /** Callback when play state changes */
  onPlayStateChange?: (isPlaying: boolean) => void;
  /** Callback when playback ends */
  onEnd?: () => void;
  /** Callback when ready to play */
  onReady?: (duration: number) => void;
}

/**
 * Audio player with waveform visualization using wavesurfer.js
 *
 * Features:
 * - Instant display when pre-computed peaks provided
 * - Click-to-seek on waveform
 * - Play/pause, restart, volume controls
 * - Duration and current time display
 * - Exposes play/pause methods via ref
 */
export const WaveformPlayer = forwardRef<WaveformPlayerRef, WaveformPlayerProps>(
  function WaveformPlayer({
    audioUrl,
    peaks,
    duration,
    height = 80,
    waveColor = "rgb(148, 163, 184)", // slate-400
    progressColor = "rgb(59, 130, 246)", // blue-500
    className,
    onPlayStateChange,
    onEnd,
    onReady,
  }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const wavesurferRef = useRef<WaveSurfer | null>(null);
    const isDestroyedRef = useRef(false);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [totalDuration, setTotalDuration] = useState(duration || 0);
    const [volume, setVolume] = useState(0.8);
    const [isMuted, setIsMuted] = useState(false);

    // Store callbacks in refs to avoid recreating WaveSurfer
    const onEndRef = useRef(onEnd);
    const onReadyRef = useRef(onReady);
    const onPlayStateChangeRef = useRef(onPlayStateChange);
    useEffect(() => {
      onEndRef.current = onEnd;
      onReadyRef.current = onReady;
      onPlayStateChangeRef.current = onPlayStateChange;
    }, [onEnd, onReady, onPlayStateChange]);

    // Expose play/pause methods to parent
    useImperativeHandle(ref, () => ({
      play: () => {
        if (wavesurferRef.current && !isDestroyedRef.current) {
          wavesurferRef.current.play().catch(() => {});
        }
      },
      pause: () => {
        if (wavesurferRef.current && !isDestroyedRef.current) {
          wavesurferRef.current.pause();
        }
      },
      isPlaying: () => isPlaying,
    }), [isPlaying]);

    // Initialize wavesurfer - only depends on URL and visual config
    useEffect(() => {
      if (!containerRef.current) return;

      isDestroyedRef.current = false;

      // Clear any existing content (handles React Strict Mode double-mounting)
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }

      // Create audio element for MediaElement backend - avoids fetch AbortError on cleanup
      const audio = new Audio();
      audio.crossOrigin = "anonymous";
      audio.preload = "auto";

      const ws = WaveSurfer.create({
        container: containerRef.current,
        height,
        waveColor,
        progressColor,
        cursorWidth: 2,
        cursorColor: "rgb(59, 130, 246)",
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        normalize: true,
        media: audio, // Use MediaElement backend instead of fetch
        // If we have pre-computed peaks, use them for instant display
        ...(peaks && duration ? { peaks: [peaks], duration } : {}),
      });

      wavesurferRef.current = ws;

      // Load audio
      ws.load(audioUrl);

      // Event listeners
      ws.on("ready", () => {
        if (isDestroyedRef.current) return;
        setIsLoading(false);
        const dur = ws.getDuration();
        setTotalDuration(dur);
        ws.setVolume(0.8); // Default volume
        onReadyRef.current?.(dur);
      });

      ws.on("play", () => {
        if (!isDestroyedRef.current) {
          setIsPlaying(true);
          onPlayStateChangeRef.current?.(true);
        }
      });
      ws.on("pause", () => {
        if (!isDestroyedRef.current) {
          setIsPlaying(false);
          onPlayStateChangeRef.current?.(false);
        }
      });
      ws.on("finish", () => {
        if (isDestroyedRef.current) return;
        setIsPlaying(false);
        onPlayStateChangeRef.current?.(false);
        onEndRef.current?.();
      });

      ws.on("timeupdate", (time) => {
        if (!isDestroyedRef.current) setCurrentTime(time);
      });

      ws.on("error", (err) => {
        // Ignore errors during cleanup or AbortError
        if (isDestroyedRef.current) return;
        if (err instanceof Error && err.name === "AbortError") return;
        if (typeof err === "object" && err !== null) {
          if ("name" in err && (err as { name: string }).name === "AbortError") return;
          // Ignore empty error objects
          if (Object.keys(err).length === 0) return;
        }
        console.error("WaveSurfer error:", err);
        setIsLoading(false);
      });

      return () => {
        isDestroyedRef.current = true;
        wavesurferRef.current = null;

        // Stop audio playback
        audio.pause();
        audio.src = "";
        audio.load();

        // Remove event listeners to prevent callbacks after unmount
        try {
          ws.unAll();
        } catch {
          // Ignore
        }

        // Manually clear the container DOM since we can't call destroy()
        // Remove all child elements to prevent duplicate waveforms on remount
        while (containerRef.current?.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
      };
      // Only recreate when URL or visual config changes - NOT volume or callbacks
    }, [audioUrl, peaks, duration, height, waveColor, progressColor]);

    // Handle play/pause toggle
    const togglePlayPause = useCallback(() => {
      if (wavesurferRef.current && !isDestroyedRef.current) {
        wavesurferRef.current.playPause();
      }
    }, []);

    // Handle restart
    const handleRestart = useCallback(() => {
      if (wavesurferRef.current && !isDestroyedRef.current) {
        wavesurferRef.current.seekTo(0);
        if (!isPlaying) {
          wavesurferRef.current.play().catch(() => {});
        }
      }
    }, [isPlaying]);

    // Handle volume change - update WaveSurfer directly without recreating
    const handleVolumeChange = useCallback((values: number[]) => {
      const newVolume = values[0];
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
      if (wavesurferRef.current && !isDestroyedRef.current) {
        wavesurferRef.current.setVolume(newVolume);
      }
    }, []);

    // Handle mute toggle
    const toggleMute = useCallback(() => {
      setIsMuted((prev) => {
        const newMuted = !prev;
        if (wavesurferRef.current && !isDestroyedRef.current) {
          wavesurferRef.current.setVolume(newMuted ? 0 : volume);
        }
        return newMuted;
      });
    }, [volume]);

    return (
      <div className={cn("space-y-3", className)}>
        {/* Waveform container */}
        <div className="relative">
          <div
            ref={containerRef}
            className={cn(
              "w-full rounded-md overflow-hidden bg-muted/50",
              isLoading && "opacity-50"
            )}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Play/Pause button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlayPause}
            disabled={isLoading}
            className="h-10 w-10"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>

          {/* Restart button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRestart}
            disabled={isLoading}
            className="h-8 w-8"
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          {/* Time display */}
          <div className="flex-1 text-sm text-muted-foreground font-mono">
            <span>{formatDuration(currentTime)}</span>
            <span className="mx-1">/</span>
            <span>{formatDuration(totalDuration)}</span>
          </div>

          {/* Volume controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="h-8 w-8"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-20"
            />
          </div>
        </div>
      </div>
    );
  }
);

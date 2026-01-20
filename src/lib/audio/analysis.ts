/**
 * Audio analysis utilities using Web Audio API
 *
 * Provides client-side audio analysis including:
 * - Waveform peak computation for visualization
 * - Audio duration detection
 * - Basic audio metadata extraction
 */

// Number of peaks to compute for waveform display
const DEFAULT_NUM_PEAKS = 200;

/**
 * Audio analysis result
 */
export interface AudioAnalysisResult {
  /** Normalized peaks for waveform display (0-1 range) */
  waveformPeaks: number[];
  /** Duration in seconds */
  durationSeconds: number;
  /** Sample rate in Hz */
  sampleRate: number;
  /** Number of audio channels */
  numberOfChannels: number;
  /** Detected tempo in BPM (requires Essentia.js - not yet implemented) */
  detectedTempo?: number;
  /** Detected musical key (requires Essentia.js - not yet implemented) */
  detectedKey?: string;
  /** Confidence of tempo/key detection (0-1) */
  analysisConfidence?: number;
}

/**
 * Decode audio data and compute waveform peaks
 *
 * Uses Web Audio API to decode the audio and compute peaks from the audio buffer.
 * Peaks are computed by sampling the audio at regular intervals and taking
 * the max absolute value in each segment.
 */
export async function analyzeAudio(
  file: File | ArrayBuffer,
  numPeaks: number = DEFAULT_NUM_PEAKS
): Promise<AudioAnalysisResult> {
  // Get ArrayBuffer from File if needed
  const arrayBuffer =
    file instanceof File ? await file.arrayBuffer() : file;

  // Create audio context
  const audioContext = new (window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

  try {
    // Decode the audio data
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));

    // Get audio metadata
    const durationSeconds = audioBuffer.duration;
    const sampleRate = audioBuffer.sampleRate;
    const numberOfChannels = audioBuffer.numberOfChannels;

    // Compute waveform peaks
    const waveformPeaks = computePeaksFromBuffer(audioBuffer, numPeaks);

    return {
      waveformPeaks,
      durationSeconds,
      sampleRate,
      numberOfChannels,
    };
  } finally {
    // Clean up audio context
    await audioContext.close();
  }
}

/**
 * Compute waveform peaks from an AudioBuffer
 *
 * Takes the max absolute value in each segment of the audio.
 * Uses all channels (summed) for better visualization.
 */
function computePeaksFromBuffer(
  audioBuffer: AudioBuffer,
  numPeaks: number
): number[] {
  const { numberOfChannels, length } = audioBuffer;
  const samplesPerPeak = Math.floor(length / numPeaks);
  const peaks: number[] = new Array(numPeaks).fill(0);

  // Process each channel and accumulate peaks
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);

    for (let peakIndex = 0; peakIndex < numPeaks; peakIndex++) {
      const start = peakIndex * samplesPerPeak;
      const end = Math.min(start + samplesPerPeak, length);

      let maxValue = 0;
      for (let i = start; i < end; i++) {
        const absValue = Math.abs(channelData[i]);
        if (absValue > maxValue) {
          maxValue = absValue;
        }
      }

      // Sum across channels (will normalize later)
      peaks[peakIndex] += maxValue;
    }
  }

  // Normalize peaks by number of channels and find max for final normalization
  let maxPeak = 0;
  for (let i = 0; i < numPeaks; i++) {
    peaks[i] = peaks[i] / numberOfChannels;
    if (peaks[i] > maxPeak) {
      maxPeak = peaks[i];
    }
  }

  // Normalize to 0-1 range
  if (maxPeak > 0) {
    for (let i = 0; i < numPeaks; i++) {
      peaks[i] = peaks[i] / maxPeak;
    }
  }

  return peaks;
}

/**
 * Get audio duration without computing full analysis
 *
 * Faster than full analysis when you only need duration.
 * Uses the Audio element for lighter-weight duration detection.
 */
export async function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);

    const cleanup = () => {
      URL.revokeObjectURL(url);
      audio.remove();
    };

    audio.addEventListener("loadedmetadata", () => {
      const duration = audio.duration;
      cleanup();
      resolve(duration);
    });

    audio.addEventListener("error", () => {
      cleanup();
      reject(new Error("Failed to load audio file"));
    });

    audio.src = url;
  });
}

/**
 * Check if a file is an audio file based on MIME type
 */
export function isAudioFile(mimeType: string | undefined): boolean {
  if (!mimeType) return false;
  return mimeType.startsWith("audio/");
}

/**
 * Check if a file is a supported audio format
 */
export function isSupportedAudioFormat(mimeType: string | undefined): boolean {
  if (!mimeType) return false;

  const supportedFormats = [
    "audio/mpeg",      // MP3
    "audio/mp3",       // MP3 (alternative)
    "audio/wav",       // WAV
    "audio/wave",      // WAV (alternative)
    "audio/x-wav",     // WAV (alternative)
    "audio/flac",      // FLAC
    "audio/x-flac",    // FLAC (alternative)
    "audio/mp4",       // M4A/AAC
    "audio/x-m4a",     // M4A
    "audio/aac",       // AAC
    "audio/ogg",       // OGG
    "audio/webm",      // WebM Audio
  ];

  return supportedFormats.includes(mimeType.toLowerCase());
}

/**
 * Format duration as MM:SS
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format duration as HH:MM:SS (for longer content)
 */
export function formatDurationLong(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * YouTube metadata utilities
 * Uses oEmbed API (no API key required) to fetch video metadata
 */

export interface YouTubeMetadata {
  title: string;
  author: string;
  thumbnailUrl: string;
  // Parsed from title if possible
  parsedArtist?: string;
  parsedSongTitle?: string;
}

/**
 * Extract video ID from various YouTube URL formats
 */
export function extractYouTubeVideoId(url: string): string | null {
  // Try URL parsing first for more reliable extraction
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace("www.", "");

    // Handle youtube.com and music.youtube.com watch URLs
    if ((hostname === "youtube.com" || hostname === "music.youtube.com") &&
        urlObj.pathname === "/watch") {
      const videoId = urlObj.searchParams.get("v");
      if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        return videoId;
      }
    }

    // Handle youtu.be short URLs
    if (hostname === "youtu.be") {
      const videoId = urlObj.pathname.slice(1); // Remove leading /
      if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        return videoId;
      }
    }

    // Handle youtube.com/embed URLs
    if (hostname === "youtube.com" && urlObj.pathname.startsWith("/embed/")) {
      const videoId = urlObj.pathname.replace("/embed/", "");
      if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        return videoId;
      }
    }
  } catch {
    // URL parsing failed, fall through to regex patterns
  }

  // Fallback regex patterns for edge cases
  const patterns = [
    // Standard watch URL with v param anywhere
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    // Short URL: youtu.be/VIDEO_ID
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    // Embed URL: youtube.com/embed/VIDEO_ID
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Check if a URL is a YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null;
}

/**
 * Parse song title to extract artist and song name
 * Common patterns:
 * - "Artist - Song Title"
 * - "Artist - Song Title (Official Video)"
 * - "Song Title by Artist"
 */
function parseSongTitle(title: string): { artist?: string; songTitle?: string } {
  // Remove common suffixes
  const cleanTitle = title
    .replace(/\s*\(Official\s*(Video|Audio|Music Video|Lyric Video|Visualizer)\)/gi, "")
    .replace(/\s*\[Official\s*(Video|Audio|Music Video|Lyric Video|Visualizer)\]/gi, "")
    .replace(/\s*\(Lyrics?\)/gi, "")
    .replace(/\s*\[Lyrics?\]/gi, "")
    .replace(/\s*\(HD\)/gi, "")
    .replace(/\s*\(HQ\)/gi, "")
    .replace(/\s*\(4K\)/gi, "")
    .replace(/\s*\(Live\)/gi, " (Live)")
    .replace(/\s*\(Acoustic\)/gi, " (Acoustic)")
    .replace(/\s*\(Cover\)/gi, " (Cover)")
    .trim();

  // Try "Artist - Song" pattern (most common)
  const dashMatch = cleanTitle.match(/^(.+?)\s*[-–—]\s*(.+)$/);
  if (dashMatch) {
    return {
      artist: dashMatch[1].trim(),
      songTitle: dashMatch[2].trim(),
    };
  }

  // Try "Song by Artist" pattern
  const byMatch = cleanTitle.match(/^(.+?)\s+by\s+(.+)$/i);
  if (byMatch) {
    return {
      artist: byMatch[2].trim(),
      songTitle: byMatch[1].trim(),
    };
  }

  // Can't parse, return the whole title as song title
  return { songTitle: cleanTitle };
}

/**
 * Fetch metadata for a YouTube video using oEmbed API
 */
export async function fetchYouTubeMetadata(url: string): Promise<YouTubeMetadata | null> {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    return null;
  }

  try {
    // Use oEmbed API - no API key required
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

    const response = await fetch(oembedUrl);
    if (!response.ok) {
      console.error("YouTube oEmbed request failed:", response.status);
      return null;
    }

    const data = await response.json();

    const parsed = parseSongTitle(data.title);

    return {
      title: data.title,
      author: data.author_name,
      thumbnailUrl: data.thumbnail_url,
      parsedArtist: parsed.artist,
      parsedSongTitle: parsed.songTitle,
    };
  } catch (error) {
    console.error("Failed to fetch YouTube metadata:", error);
    return null;
  }
}

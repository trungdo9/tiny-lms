/**
 * Shared video utility functions for embedding video players.
 */

/**
 * Converts a video URL to an embed URL for YouTube/Vimeo.
 * Returns the raw URL for direct/S3 URLs (caller decides <video> vs <iframe>).
 */
export function getVideoEmbedUrl(url: string, provider: string): string | null {
  if (!url) return null;
  if (provider === 'youtube') {
    const id = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return id ? `https://www.youtube.com/embed/${id[1]}` : null;
  }
  if (provider === 'vimeo') {
    const id = url.match(/vimeo\.com\/(\d+)/);
    return id ? `https://player.vimeo.com/video/${id[1]}` : null;
  }
  // Direct / S3 URL — returned as-is for <video> tag
  return url;
}

/**
 * Returns true when URL should be embedded via iframe (YouTube / Vimeo).
 */
export function isEmbedProvider(provider: string): boolean {
  return provider === 'youtube' || provider === 'vimeo';
}
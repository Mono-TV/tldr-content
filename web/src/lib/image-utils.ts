/**
 * Image optimization utilities for TLDR Content website
 * Provides blur placeholder generation and image loading optimization
 */

/**
 * Generate a simple blur placeholder data URL
 * Creates a subtle gradient that looks like a blurred movie poster
 * @param primaryColor - Primary color for the gradient (hex format)
 * @param secondaryColor - Secondary color for the gradient (hex format)
 * @returns Base64 encoded SVG data URL
 */
export function generateBlurDataURL(
  primaryColor: string = '#1a1a1a',
  secondaryColor: string = '#0a0a0a'
): string {
  const svg = `
    <svg width="10" height="15" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:0.9" />
          <stop offset="50%" style="stop-color:${primaryColor};stop-opacity:0.7" />
          <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="10" height="15" fill="url(#grad)" />
    </svg>
  `.trim();

  // Use btoa for browser/edge runtime compatibility
  if (typeof window !== 'undefined') {
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }
  // Use Buffer for Node.js runtime (server-side)
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Generate blur placeholder for poster images (2:3 aspect ratio)
 * Uses a dark gradient optimized for movie poster placeholders
 */
export function getPosterPlaceholder(): string {
  return generateBlurDataURL('#1a1a1a', '#0a0a0a');
}

/**
 * Generate blur placeholder for backdrop images (16:9 aspect ratio)
 * Uses a darker gradient for full-width backdrops
 */
export function getBackdropPlaceholder(): string {
  const svg = `
    <svg width="16" height="9" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="grad" cx="30%" cy="50%" r="80%">
          <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:#0a0a0a;stop-opacity:1" />
        </radialGradient>
      </defs>
      <rect width="16" height="9" fill="url(#grad)" />
    </svg>
  `.trim();

  if (typeof window !== 'undefined') {
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Generate blur placeholder for circular images (profile pictures)
 * Uses a centered gradient optimized for circular display
 */
export function getProfilePlaceholder(): string {
  const svg = `
    <svg width="10" height="10" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:#2a2a2a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:1" />
        </radialGradient>
      </defs>
      <rect width="10" height="10" fill="url(#grad)" />
    </svg>
  `.trim();

  if (typeof window !== 'undefined') {
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Responsive image sizes for different card sizes
 * Maps card size to optimal srcset sizes string
 */
export const IMAGE_SIZES = {
  // MovieCard sizes by variant
  card: {
    sm: '(max-width: 640px) 128px, (max-width: 768px) 144px, 160px',
    md: '(max-width: 640px) 144px, (max-width: 768px) 160px, 192px',
    lg: '(max-width: 640px) 144px, (max-width: 768px) 160px, 192px',
  },
  // Hero carousel poster
  heroPoster: '233px',
  // Full-width backdrop
  backdrop: '100vw',
  // Content detail poster
  detailPoster: '(max-width: 768px) 192px, 256px',
  // Profile/cast images
  profile: '80px',
  // Platform logos
  logo: '24px',
} as const;

/**
 * Default blur data URLs for immediate use
 * Pre-generated for common image types to avoid runtime generation
 */
export const BLUR_DATA_URLS = {
  poster: 'data:image/svg+xml;base64,CiAgICA8c3ZnIHdpZHRoPSIxMCIgaGVpZ2h0PSIxNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgICAgPGRlZnM+CiAgICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjAlIiB5Mj0iMTAwJSI+CiAgICAgICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMWExYTFhO3N0b3Atb3BhY2l0eTowLjkiIC8+CiAgICAgICAgICA8c3RvcCBvZmZzZXQ9IjUwJSIgc3R5bGU9InN0b3AtY29sb3I6IzFhMWExYTtzdG9wLW9wYWNpdHk6MC43IiAvPgogICAgICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMGEwYTBhO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICAgIDwvZGVmcz4KICAgICAgPHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjE1IiBmaWxsPSJ1cmwoI2dyYWQpIiAvPgogICAgPC9zdmc+',
  backdrop: 'data:image/svg+xml;base64,CiAgICA8c3ZnIHdpZHRoPSIxNiIgaGVpZ2h0PSI5IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogICAgICA8ZGVmcz4KICAgICAgICA8cmFkaWFsR3JhZGllbnQgaWQ9ImdyYWQiIGN4PSIzMCUiIGN5PSI1MCUiIHI9IjgwJSI+CiAgICAgICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMWExYTFhO3N0b3Atb3BhY2l0eTowLjgiIC8+CiAgICAgICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwYTBhMGE7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgICAgPC9yYWRpYWxHcmFkaWVudD4KICAgICAgPC9kZWZzPgogICAgICA8cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iOSIgZmlsbD0idXJsKCNncmFkKSIgLz4KICAgIDwvc3ZnPg==',
  profile: 'data:image/svg+xml;base64,CiAgICA8c3ZnIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgICAgPGRlZnM+CiAgICAgICAgPHJhZGlhbEdyYWRpZW50IGlkPSJncmFkIiBjeD0iNTAlIiBjeT0iNTAlIiByPSI1MCUiPgogICAgICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzJhMmEyYTtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzFhMWExYTtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgICA8L3JhZGlhbEdyYWRpZW50PgogICAgICA8L2RlZnM+CiAgICAgIDxyZWN0IHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0idXJsKCNncmFkKSIgLz4KICAgIDwvc3ZnPg==',
} as const;

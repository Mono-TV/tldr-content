import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRating(rating: number | null | undefined): string {
  if (rating === null || rating === undefined) return 'N/A';
  return rating.toFixed(1);
}

export function formatYear(date: string | null | undefined): string {
  if (!date) return '';
  const year = new Date(date).getFullYear();
  return isNaN(year) ? '' : String(year);
}

export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes) return '';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// Image size configurations
type ImageSize = 'sm' | 'md' | 'lg' | 'original';

const TMDB_POSTER_SIZES: Record<ImageSize, string> = {
  sm: 'w342',      // ~342px - for small cards
  md: 'w500',      // ~500px - for medium cards
  lg: 'w780',      // ~780px - for large displays
  original: 'original',
};

const TMDB_BACKDROP_SIZES: Record<ImageSize, string> = {
  sm: 'w780',      // ~780px - for smaller backdrops
  md: 'w1280',     // ~1280px - for medium backdrops
  lg: 'w1280',     // ~1280px - for large backdrops
  original: 'original',
};

// Amazon image size parameters (width in pixels)
const AMAZON_SIZES: Record<ImageSize, string> = {
  sm: 'SX400',     // 400px width
  md: 'SX600',     // 600px width
  lg: 'SX1200',    // 1200px width
  original: '',    // No size param = original
};

// Transform Amazon/IMDB URLs to requested size
function transformAmazonUrl(url: string, size: ImageSize): string {
  const sizeParam = AMAZON_SIZES[size];
  if (!sizeParam) {
    // Original size - just ensure we have ._V1_.
    return url.replace(/\._V1_[^.]*\./, '._V1_.');
  }
  // Replace any existing size params with new size
  return url.replace(/\._V1_[^.]*\./, `._V1_${sizeParam}_.`);
}

// Transform TMDB URLs to requested size
function transformTmdbUrl(url: string, sizes: Record<ImageSize, string>, size: ImageSize): string {
  const sizeParam = sizes[size];
  // Replace size in URL like /t/p/original/ or /t/p/w500/
  return url.replace(/\/t\/p\/[^/]+\//, `/t/p/${sizeParam}/`);
}

export function getImageUrl(
  path: string | null | undefined,
  size: ImageSize = 'md',
  fallback: string = '/placeholder-poster.svg'
): string {
  if (!path) return fallback;

  if (path.startsWith('http')) {
    // Full URL - check source and transform
    if (path.includes('media-amazon.com') || path.includes('imdb.com')) {
      return transformAmazonUrl(path, size);
    }
    if (path.includes('tmdb.org')) {
      return transformTmdbUrl(path, TMDB_POSTER_SIZES, size);
    }
    return path; // Unknown source, return as-is
  }

  // Relative path - assume TMDB
  return `https://image.tmdb.org/t/p/${TMDB_POSTER_SIZES[size]}${path}`;
}

export function getBackdropUrl(
  path: string | null | undefined,
  size: ImageSize = 'lg',
  fallback: string = '/placeholder-backdrop.svg'
): string {
  if (!path) return fallback;

  if (path.startsWith('http')) {
    // Full URL - check source and transform
    if (path.includes('media-amazon.com') || path.includes('imdb.com')) {
      return transformAmazonUrl(path, size);
    }
    if (path.includes('tmdb.org')) {
      return transformTmdbUrl(path, TMDB_BACKDROP_SIZES, size);
    }
    return path; // Unknown source, return as-is
  }

  // Relative path - assume TMDB
  return `https://image.tmdb.org/t/p/${TMDB_BACKDROP_SIZES[size]}${path}`;
}

export function getPlatformLogoUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `/platforms/${path}`;
}

export function extractYouTubeId(url: string | null | undefined): string {
  if (!url) return '';
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match?.[1] || '';
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function debounce<A extends unknown[]>(
  func: (...args: A) => void,
  wait: number
): (...args: A) => void {
  let timeout: NodeJS.Timeout;
  return (...args: A) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function getRatingColor(rating: number | null | undefined): string {
  if (rating === null || rating === undefined) return 'text-muted';
  if (rating >= 8) return 'text-success';
  if (rating >= 6) return 'text-gold';
  if (rating >= 4) return 'text-yellow-500';
  return 'text-accent';
}

export const INDIAN_LANGUAGES = [
  'Hindi',
  'Tamil',
  'Telugu',
  'Malayalam',
  'Kannada',
  'Bengali',
  'Marathi',
  'Gujarati',
  'Punjabi',
  'Odia',
];

export const POPULAR_GENRES = [
  'Action',
  'Comedy',
  'Drama',
  'Thriller',
  'Romance',
  'Horror',
  'Sci-Fi',
  'Crime',
  'Documentary',
  'Animation',
];

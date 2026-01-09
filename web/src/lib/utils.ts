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

export function getImageUrl(path: string | null | undefined, fallback: string = '/placeholder-poster.svg'): string {
  if (!path) return fallback;
  if (path.startsWith('http')) return path;
  return `https://image.tmdb.org/t/p/w500${path}`;
}

export function getBackdropUrl(path: string | null | undefined, fallback: string = '/placeholder-backdrop.svg'): string {
  if (!path) return fallback;
  if (path.startsWith('http')) return path;
  return `https://image.tmdb.org/t/p/original${path}`;
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

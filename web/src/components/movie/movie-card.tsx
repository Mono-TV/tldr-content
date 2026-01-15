'use client';

import Image from 'next/image';
import Link from 'next/link';
import { m } from 'framer-motion';
import { Star, Play } from 'lucide-react';
import { cn, formatRating, getImageUrl, getRatingColor } from '@/lib/utils';
import type { Content } from '@/types';

interface MovieCardProps {
  content: Content;
  index?: number;
  showRank?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MovieCard({ content, index, showRank = false, size = 'md', className }: MovieCardProps) {
  const sizeClasses = {
    sm: 'w-32 md:w-36 lg:w-40',
    md: 'w-36 md:w-40 lg:w-48',
    lg: 'w-36 md:w-40 lg:w-48',
  };

  const aspectRatios = {
    sm: 'aspect-[2/3]',
    md: 'aspect-[2/3]',
    lg: 'aspect-[2/3]',
  };

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index ? index * 0.05 : 0 }}
      className={cn(
        'relative group flex-shrink-0',
        sizeClasses[size],
        className
      )}
    >
      {/* Rank Number */}
      {showRank && index !== undefined && (
        <span className="top-number absolute -left-8 md:-left-14 lg:-left-20 bottom-10 md:bottom-12 z-0 select-none transition-all duration-300 group-hover:opacity-70" style={{ lineHeight: '0.85' }}>
          {index + 1}
        </span>
      )}

      <Link href={`/content/${content.imdb_id}`} className="block relative z-10">
        {/* Poster with enhanced hover effects */}
        <div className={cn(
          'relative overflow-hidden rounded-lg bg-card',
          'transform-gpu transition-all duration-500 ease-out',
          'group-hover:scale-[1.02] group-hover:-translate-y-2',
          'group-hover:shadow-2xl group-hover:shadow-accent/20',
          aspectRatios[size]
        )}>
          <Image
            src={getImageUrl(content.poster_url, 'sm')}
            alt={content.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            sizes="(max-width: 768px) 150px, 200px"
          />

          {/* Gradient Overlay - Always visible, enhanced on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

          {/* Hover Overlay with Play Button */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
            <div className="transform scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 ease-out delay-100">
              <div className="p-4 rounded-full bg-white/95 backdrop-blur-sm shadow-2xl hover:bg-white transition-colors">
                <Play className="w-7 h-7 text-black fill-black" />
              </div>
            </div>
          </div>

          {/* Rating Badge - Enhanced visibility on hover */}
          {content.imdb_rating && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded px-2 py-1 transition-all duration-300 group-hover:bg-black/90 group-hover:scale-105">
              <Star className="w-3.5 h-3.5 text-gold fill-gold" />
              <span className={cn('text-xs font-bold', getRatingColor(content.imdb_rating))}>
                {formatRating(content.imdb_rating)}
              </span>
            </div>
          )}
        </div>

        {/* Info with enhanced hover effects - Hidden by default, visible on hover */}
        <div className="mt-3 space-y-1 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-y-1">
          <h3 className="text-sm font-semibold truncate text-white transition-all duration-300">
            {content.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground transition-colors duration-300">
            {content.year && <span>{content.year}</span>}
            {content.genres?.[0] && (
              <>
                <span>•</span>
                <span className="truncate">{content.genres[0].name}</span>
              </>
            )}
          </div>
        </div>
      </Link>
    </m.div>
  );
}

// Skeleton loader for MovieCard
export function MovieCardSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-32 md:w-36 lg:w-40',
    md: 'w-36 md:w-40 lg:w-48',
    lg: 'w-36 md:w-40 lg:w-48',
  };

  return (
    <div className={cn('flex-shrink-0', sizeClasses[size])}>
      <div className="aspect-[2/3] rounded-lg skeleton" />
      <div className="mt-2 space-y-1">
        <div className="h-4 w-3/4 rounded skeleton" />
        <div className="h-3 w-1/2 rounded skeleton" />
      </div>
    </div>
  );
}

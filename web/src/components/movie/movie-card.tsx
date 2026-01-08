'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
    sm: 'w-44 md:w-52 lg:w-60',
    md: 'w-52 md:w-60 lg:w-[290px]',
    lg: 'w-60 md:w-72 lg:w-[340px]',
  };

  const aspectRatios = {
    sm: 'aspect-[2/3]',
    md: 'aspect-[2/3]',
    lg: 'aspect-[2/3]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index ? index * 0.05 : 0 }}
      className={cn('relative group flex-shrink-0', sizeClasses[size], className)}
    >
      {/* Rank Number */}
      {showRank && index !== undefined && (
        <span className="top-number absolute -left-4 md:-left-8 bottom-0 z-0 select-none">
          {index + 1}
        </span>
      )}

      <Link href={`/content/${content.imdb_id}`} className="block relative z-10">
        {/* Poster */}
        <div className={cn('relative overflow-hidden rounded-lg bg-card', aspectRatios[size])}>
          <Image
            src={getImageUrl(content.poster_url)}
            alt={content.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 150px, 200px"
          />

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="p-3 rounded-full bg-accent/90 transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <Play className="w-6 h-6 text-white fill-white" />
            </div>
          </div>

          {/* Rating Badge */}
          {content.imdb_rating && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded px-1.5 py-0.5">
              <Star className="w-3 h-3 text-gold fill-gold" />
              <span className={cn('text-xs font-semibold', getRatingColor(content.imdb_rating))}>
                {formatRating(content.imdb_rating)}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-2 space-y-0.5">
          <h3 className="text-sm font-medium truncate group-hover:text-accent transition-colors">
            {content.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
    </motion.div>
  );
}

// Skeleton loader for MovieCard
export function MovieCardSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-44 md:w-52 lg:w-60',
    md: 'w-52 md:w-60 lg:w-[290px]',
    lg: 'w-60 md:w-72 lg:w-[340px]',
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

'use client';

import { useRef } from 'react';
import { MovieCard, MovieCardSkeleton } from '@/components/movie/movie-card';
import { cn } from '@/lib/utils';
import type { Content } from '@/types';

interface ContentRowProps {
  title: string;
  subtitle?: string;
  contents: Content[];
  isLoading?: boolean;
  showRank?: boolean;
  href?: string;
  cardSize?: 'sm' | 'md' | 'lg';
  /** Mark first N cards as priority (above-fold optimization) */
  priorityCount?: number;
}

export function ContentRow({
  title,
  subtitle,
  contents,
  isLoading = false,
  showRank = false,
  href,
  cardSize = 'md',
  priorityCount = 0,
}: ContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="relative py-6">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 mb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          className={cn(
            'flex overflow-x-auto hide-scrollbar',
            'px-4 sm:px-6 lg:px-8',
            showRank ? 'gap-36' : 'gap-8'
          )}
        >
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <MovieCardSkeleton key={i} size={cardSize} />
              ))
            : contents.map((content, index) => (
                <MovieCard
                  key={content._id}
                  content={content}
                  index={index}
                  showRank={showRank}
                  size={cardSize}
                  priority={index < priorityCount}
                />
              ))}
        </div>
      </div>
    </section>
  );
}

// Top 10 Row variant
export function Top10Row({ title, contents, isLoading = false }: Omit<ContentRowProps, 'showRank'>) {
  return (
    <ContentRow
      title={title}
      contents={contents.slice(0, 10)}
      isLoading={isLoading}
      showRank={true}
      cardSize="lg"
    />
  );
}

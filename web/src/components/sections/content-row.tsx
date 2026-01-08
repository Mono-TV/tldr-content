'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MovieCard, MovieCardSkeleton } from '@/components/movie/movie-card';
import { cn } from '@/lib/utils';
import type { Content } from '@/types';

interface ContentRowProps {
  title: string;
  contents: Content[];
  isLoading?: boolean;
  showRank?: boolean;
  href?: string;
  cardSize?: 'sm' | 'md' | 'lg';
}

export function ContentRow({
  title,
  contents,
  isLoading = false,
  showRank = false,
  href,
  cardSize = 'md',
}: ContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;

    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="relative py-6">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
          {href && (
            <a
              href={href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              View All
            </a>
          )}
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative group/carousel">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className={cn(
            'absolute left-0 top-1/2 -translate-y-1/2 z-20',
            'w-12 h-24 flex items-center justify-center',
            'bg-gradient-to-r from-background to-transparent',
            'opacity-0 group-hover/carousel:opacity-100 transition-opacity',
            'hover:from-background/90'
          )}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className={cn(
            'absolute right-0 top-1/2 -translate-y-1/2 z-20',
            'w-12 h-24 flex items-center justify-center',
            'bg-gradient-to-l from-background to-transparent',
            'opacity-0 group-hover/carousel:opacity-100 transition-opacity',
            'hover:from-background/90'
          )}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-8 h-8" />
        </button>

        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          className={cn(
            'flex overflow-x-auto hide-scrollbar',
            'pr-0',
            showRank ? 'gap-36 pl-8 md:pl-16' : 'gap-8 pl-0'
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

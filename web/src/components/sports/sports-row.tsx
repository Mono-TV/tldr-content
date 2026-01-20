'use client';

import { useRef } from 'react';
import { SportsCard, SportsCardSkeleton } from './sports-card';
import { cn } from '@/lib/utils';
import type { SportsContent } from '@/types/sports';
import { SPORT_ICONS } from '@/types/sports';

interface SportsRowProps {
  title: string;
  subtitle?: string;
  contents: SportsContent[];
  isLoading?: boolean;
  sportType?: string;
  cardSize?: 'sm' | 'md' | 'lg';
  priorityCount?: number;
}

export function SportsRow({
  title,
  subtitle,
  contents,
  isLoading = false,
  sportType,
  cardSize = 'md',
  priorityCount = 0,
}: SportsRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sportIcon = sportType ? SPORT_ICONS[sportType] : undefined;

  // Don't render if no content and not loading
  if (!isLoading && (!contents || contents.length === 0)) {
    return null;
  }

  return (
    <section className="relative py-6">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 mb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            {sportIcon && <span>{sportIcon}</span>}
            {title}
          </h2>
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
            'gap-4 md:gap-6'
          )}
        >
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <SportsCardSkeleton key={i} size={cardSize} />
              ))
            : contents.map((content, index) => (
                <SportsCard
                  key={content.content_id || content._id}
                  content={content}
                  index={index}
                  size={cardSize}
                  priority={index < priorityCount}
                />
              ))}
        </div>
      </div>
    </section>
  );
}

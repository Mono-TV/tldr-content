'use client';

import Image from 'next/image';
import Link from 'next/link';
import { m } from 'framer-motion';
import { Play, Radio, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BLUR_DATA_URLS, IMAGE_SIZES } from '@/lib/image-utils';
import type { SportsContent } from '@/types/sports';
import { SPORT_ICONS } from '@/types/sports';

interface SportsCardProps {
  content: SportsContent;
  index?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  priority?: boolean;
}

function formatDate(timestamp?: number): string {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getHotstarUrl(content: SportsContent): string {
  // Find web locator or use deep link
  const webLocator = content.locators?.find(l => l.platform === 'web');
  if (webLocator?.url) return webLocator.url;
  return `https://www.hotstar.com/in/sports/${content.content_id}`;
}

export function SportsCard({
  content,
  index,
  size = 'md',
  className,
  priority = false,
}: SportsCardProps) {
  const sizeClasses = {
    sm: 'w-40 md:w-44 lg:w-48',
    md: 'w-44 md:w-48 lg:w-56',
    lg: 'w-48 md:w-56 lg:w-64',
  };

  const sportIcon = SPORT_ICONS[content.game_name] || '🏆';
  const imageUrl = content.thumbnail || content.source_images?.[0]?.url;

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
      <a
        href={getHotstarUrl(content)}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative z-10"
      >
        {/* Thumbnail with 16:9 aspect ratio (sports images are typically horizontal) */}
        <div
          className={cn(
            'relative overflow-hidden rounded-lg bg-card',
            'transform-gpu transition-all duration-500 ease-out',
            'group-hover:scale-[1.02] group-hover:-translate-y-2',
            'group-hover:shadow-2xl group-hover:shadow-accent/20',
            'aspect-video'
          )}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={content.title}
              fill
              priority={priority}
              loading={priority ? 'eager' : 'lazy'}
              placeholder="blur"
              blurDataURL={BLUR_DATA_URLS.backdrop}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              sizes={IMAGE_SIZES.card[size]}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <span className="text-4xl">{sportIcon}</span>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

          {/* Live Badge */}
          {content.live && (
            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-600 rounded px-2 py-1">
              <Radio className="w-3 h-3 animate-pulse" />
              <span className="text-xs font-bold uppercase">Live</span>
            </div>
          )}

          {/* Sport Badge */}
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded px-2 py-1">
            <span className="text-sm">{sportIcon}</span>
            <span className="text-xs font-medium">{content.game_name}</span>
          </div>

          {/* Hover Overlay with Play Button */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
            <div className="transform scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 ease-out delay-100">
              <div className="p-4 rounded-full bg-white/95 backdrop-blur-sm shadow-2xl hover:bg-white transition-colors">
                <Play className="w-7 h-7 text-black fill-black" />
              </div>
            </div>
          </div>

          {/* Premium Badge */}
          {content.premium && (
            <div className="absolute bottom-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded px-2 py-0.5">
              <span className="text-xs font-bold">PREMIUM</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-3 space-y-1">
          <h3 className="text-sm font-semibold line-clamp-2 text-white group-hover:text-accent transition-colors duration-300">
            {content.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {content.sports_season_name && (
              <span className="truncate">{content.sports_season_name}</span>
            )}
            {content.start_date && (
              <>
                {content.sports_season_name && <span>•</span>}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(content.start_date)}
                </span>
              </>
            )}
          </div>
          {content.lang && content.lang.length > 0 && (
            <div className="text-xs text-muted-foreground/70">
              {content.lang.slice(0, 3).join(', ')}
              {content.lang.length > 3 && ` +${content.lang.length - 3}`}
            </div>
          )}
        </div>
      </a>
    </m.div>
  );
}

// Skeleton loader for SportsCard
export function SportsCardSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-40 md:w-44 lg:w-48',
    md: 'w-44 md:w-48 lg:w-56',
    lg: 'w-48 md:w-56 lg:w-64',
  };

  return (
    <div className={cn('flex-shrink-0', sizeClasses[size])}>
      <div className="aspect-video rounded-lg skeleton" />
      <div className="mt-3 space-y-2">
        <div className="h-4 w-full rounded skeleton" />
        <div className="h-3 w-2/3 rounded skeleton" />
        <div className="h-3 w-1/2 rounded skeleton" />
      </div>
    </div>
  );
}

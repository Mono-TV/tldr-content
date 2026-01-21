'use client';

import Link from 'next/link';
import Image from 'next/image';
import { m } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BLUR_DATA_URLS } from '@/lib/image-utils';
import type { SportCollection } from '@/types/sports';

interface SportsCollectionsGridProps {
  collections: SportCollection[];
  compact?: boolean;
}

export function SportsCollectionsGrid({ collections, compact = false }: SportsCollectionsGridProps) {
  return (
    <div
      className={cn(
        'grid gap-4',
        compact
          ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8'
          : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'
      )}
    >
      {collections.map((sport, index) => (
        <SportCollectionCard
          key={sport.name}
          sport={sport}
          index={index}
          compact={compact}
        />
      ))}
    </div>
  );
}

interface SportCollectionCardProps {
  sport: SportCollection;
  index: number;
  compact?: boolean;
}

function SportCollectionCard({ sport, index, compact = false }: SportCollectionCardProps) {
  return (
    <Link href={`/sports/${sport.slug}`}>
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03, duration: 0.3 }}
        className={cn(
          'group relative rounded-xl overflow-hidden cursor-pointer',
          'bg-card hover:ring-2 hover:ring-accent transition-all duration-300',
          'hover:scale-[1.02] hover:shadow-xl hover:shadow-accent/20',
          compact ? 'aspect-square' : 'aspect-[4/3]'
        )}
      >
        {/* Background Image */}
        {sport.thumbnail ? (
          <Image
            src={sport.thumbnail}
            alt={sport.displayName}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URLS.backdrop}
            sizes={compact
              ? '(max-width: 640px) 33vw, (max-width: 1024px) 16vw, 12vw'
              : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw'}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        {/* Content */}
        <div className={cn(
          'absolute inset-0 flex flex-col justify-between',
          compact ? 'p-2' : 'p-4'
        )}>
          {/* Sport Icon */}
          <div className="self-start">
            <span className={cn(
              'drop-shadow-lg',
              compact ? 'text-2xl' : 'text-4xl'
            )}>
              {sport.icon}
            </span>
          </div>

          {/* Sport Info */}
          <div className="space-y-0.5">
            <h3 className={cn(
              'font-bold text-white drop-shadow-lg',
              compact ? 'text-sm' : 'text-xl'
            )}>
              {sport.displayName}
            </h3>
            {!compact && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-white/70">
                  {sport.tournamentCount} tournament{sport.tournamentCount !== 1 ? 's' : ''}
                </p>
                <ChevronRight className="w-5 h-5 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
            {compact && (
              <p className="text-xs text-white/60">
                {sport.matchCount} matches
              </p>
            )}
          </div>
        </div>
      </m.div>
    </Link>
  );
}

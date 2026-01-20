'use client';

import Link from 'next/link';
import Image from 'next/image';
import { m } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BLUR_DATA_URLS } from '@/lib/image-utils';
import type { SportCollection } from '@/types/sports';

interface SportsCollectionsPageProps {
  collections: SportCollection[];
}

export function SportsCollectionsPage({ collections }: SportsCollectionsPageProps) {
  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="pt-24 pb-8 px-12 lg:px-16">
        <h1 className="text-4xl lg:text-5xl font-bold mb-2">Sports</h1>
        <p className="text-muted-foreground text-lg">
          Browse sports by category
        </p>
      </div>

      {/* Sport Collections Grid */}
      <div className="px-12 lg:px-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {collections.map((sport, index) => (
            <SportCollectionCard
              key={sport.name}
              sport={sport}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface SportCollectionCardProps {
  sport: SportCollection;
  index: number;
}

function SportCollectionCard({ sport, index }: SportCollectionCardProps) {
  return (
    <Link href={`/sports/${sport.slug}`}>
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        className={cn(
          'group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer',
          'bg-card hover:ring-2 hover:ring-accent transition-all duration-300',
          'hover:scale-[1.02] hover:shadow-xl hover:shadow-accent/20'
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
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 p-4 flex flex-col justify-between">
          {/* Sport Icon */}
          <div className="self-start">
            <span className="text-4xl drop-shadow-lg">{sport.icon}</span>
          </div>

          {/* Sport Info */}
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white drop-shadow-lg">
              {sport.displayName}
            </h3>
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/70">
                {sport.tournamentCount} tournament{sport.tournamentCount !== 1 ? 's' : ''}
              </p>
              <ChevronRight className="w-5 h-5 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </m.div>
    </Link>
  );
}

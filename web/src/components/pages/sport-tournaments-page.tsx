'use client';

import Link from 'next/link';
import Image from 'next/image';
import { m } from 'framer-motion';
import { ChevronRight, ChevronLeft, Calendar, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BLUR_DATA_URLS } from '@/lib/image-utils';
import type { Tournament, SportsContent } from '@/types/sports';

interface SportTournamentsPageProps {
  sportName: string;
  sportSlug: string;
  displayName: string;
  icon: string;
  tournaments: Tournament[];
  featuredContent: SportsContent[];
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
  const webLocator = content.locators?.find(l => l.platform === 'web');
  if (webLocator?.url) return webLocator.url;
  return `https://www.hotstar.com/in/sports/${content.content_id}`;
}

export function SportTournamentsPage({
  sportName,
  sportSlug,
  displayName,
  icon,
  tournaments,
  featuredContent,
}: SportTournamentsPageProps) {
  return (
    <div className="min-h-screen pb-20">
      {/* Header with Back Button */}
      <div className="pt-24 pb-8 px-12 lg:px-16">
        <Link
          href="/sports"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          All Sports
        </Link>

        <div className="flex items-center gap-4">
          <span className="text-5xl">{icon}</span>
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold">{displayName}</h1>
            <p className="text-muted-foreground text-lg mt-1">
              {tournaments.length} tournament{tournaments.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>
      </div>

      {/* Featured Content Row */}
      {featuredContent.length > 0 && (
        <section className="mb-12">
          <div className="px-12 lg:px-16 mb-4">
            <h2 className="text-2xl font-bold">Latest</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar px-12 lg:px-16 pb-4">
            {featuredContent.map((item, index) => (
              <FeaturedCard key={item.content_id} item={item} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* Tournaments Grid */}
      <section className="px-12 lg:px-16">
        <h2 className="text-2xl font-bold mb-6">Tournaments & Series</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tournaments.map((tournament, index) => (
            <TournamentCard
              key={`${tournament.id}-${tournament.name}`}
              tournament={tournament}
              sportSlug={sportSlug}
              index={index}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

interface FeaturedCardProps {
  item: SportsContent;
  index: number;
}

function FeaturedCard({ item, index }: FeaturedCardProps) {
  const imageUrl = item.thumbnail || item.source_images?.[0]?.url;

  return (
    <a
      href={getHotstarUrl(item)}
      target="_blank"
      rel="noopener noreferrer"
    >
      <m.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className={cn(
          'relative flex-shrink-0 w-[280px] aspect-video rounded-xl overflow-hidden',
          'bg-card group cursor-pointer',
          'hover:ring-2 hover:ring-accent hover:scale-[1.02] transition-all duration-300'
        )}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URLS.backdrop}
            sizes="280px"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* Play Icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
            <Play className="w-5 h-5 fill-black text-black ml-0.5" />
          </div>
        </div>

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white font-semibold text-sm line-clamp-2">
            {item.title}
          </p>
          {item.start_date && (
            <p className="text-white/60 text-xs mt-1">
              {formatDate(item.start_date)}
            </p>
          )}
        </div>
      </m.div>
    </a>
  );
}

interface TournamentCardProps {
  tournament: Tournament;
  sportSlug: string;
  index: number;
}

function TournamentCard({ tournament, sportSlug, index }: TournamentCardProps) {
  const tournamentSlug = tournament.id || encodeURIComponent(tournament.name);

  return (
    <Link href={`/sports/${sportSlug}/${tournamentSlug}`}>
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03, duration: 0.3 }}
        className={cn(
          'group relative aspect-[16/10] rounded-xl overflow-hidden cursor-pointer',
          'bg-card hover:ring-2 hover:ring-accent transition-all duration-300',
          'hover:scale-[1.02] hover:shadow-xl hover:shadow-accent/20'
        )}
      >
        {/* Background Image */}
        {tournament.thumbnail ? (
          <Image
            src={tournament.thumbnail}
            alt={tournament.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URLS.backdrop}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 p-4 flex flex-col justify-end">
          <h3 className="text-lg font-bold text-white drop-shadow-lg line-clamp-2">
            {tournament.name}
          </h3>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3 text-sm text-white/70">
              <span>{tournament.matchCount} videos</span>
              {tournament.latestMatchDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(tournament.latestMatchDate)}
                </span>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </m.div>
    </Link>
  );
}

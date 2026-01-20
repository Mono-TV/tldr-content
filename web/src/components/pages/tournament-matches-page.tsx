'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';
import { m } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Radio, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BLUR_DATA_URLS } from '@/lib/image-utils';
import type { SportsContent, MatchGroup } from '@/types/sports';
import { groupContentByMatch } from '@/types/sports';

interface TournamentMatchesPageProps {
  sportName: string;
  sportSlug: string;
  sportDisplayName: string;
  sportIcon: string;
  tournamentId: string;
  tournamentName: string;
  matches: SportsContent[];
}

function formatDate(timestamp?: number): string {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDuration(seconds?: number): string {
  if (!seconds) return '';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function getHotstarUrl(content: SportsContent): string {
  const webLocator = content.locators?.find(l => l.platform === 'web');
  if (webLocator?.url) return webLocator.url;
  return `https://www.hotstar.com/in/sports/${content.content_id}`;
}

export function TournamentMatchesPage({
  sportName,
  sportSlug,
  sportDisplayName,
  sportIcon,
  tournamentId,
  tournamentName,
  matches,
}: TournamentMatchesPageProps) {
  // Group matches by date
  const matchGroups = groupContentByMatch(matches);

  // Get a featured match for the hero section
  const featuredMatch = matches[0];

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section with Featured Match */}
      {featuredMatch && (
        <HeroSection
          match={featuredMatch}
          sportIcon={sportIcon}
          tournamentName={tournamentName}
        />
      )}

      {/* Breadcrumb Navigation */}
      <div className="px-12 lg:px-16 py-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/sports" className="hover:text-white transition-colors">
            Sports
          </Link>
          <span>/</span>
          <Link href={`/sports/${sportSlug}`} className="hover:text-white transition-colors">
            {sportDisplayName}
          </Link>
          <span>/</span>
          <span className="text-white">{tournamentName}</span>
        </div>
      </div>

      {/* Header */}
      <div className="px-12 lg:px-16 pb-6">
        <div className="flex items-center gap-4">
          <span className="text-4xl">{sportIcon}</span>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold">{tournamentName}</h1>
            <p className="text-muted-foreground mt-1">
              {matchGroups.length} match{matchGroups.length !== 1 ? 'es' : ''} &bull; {matches.length} video{matches.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Match Rows - One row per match/date */}
      <section className="space-y-8">
        {matchGroups.map((group, groupIndex) => (
          <MatchRow
            key={group.id}
            group={group}
            groupIndex={groupIndex}
          />
        ))}
      </section>
    </div>
  );
}

interface HeroSectionProps {
  match: SportsContent;
  sportIcon: string;
  tournamentName: string;
}

function HeroSection({ match, sportIcon, tournamentName }: HeroSectionProps) {
  const imageUrl = match.thumbnail || match.source_images?.[0]?.url;

  return (
    <section className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={match.title}
            fill
            priority
            placeholder="blur"
            blurDataURL={BLUR_DATA_URLS.backdrop}
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
        )}

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-end pb-12 px-12 lg:px-16">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl"
        >
          {/* Live Badge */}
          {match.live && (
            <div className="inline-flex items-center gap-2 bg-red-600 rounded-full px-4 py-1.5 mb-4">
              <Radio className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-bold uppercase tracking-wider">Live</span>
            </div>
          )}

          {/* Tournament Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{sportIcon}</span>
            <span className="text-accent font-medium">{tournamentName}</span>
          </div>

          {/* Title */}
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            {match.title}
          </h2>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-white/70 mb-6">
            {match.start_date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(match.start_date)}
              </span>
            )}
            {match.duration && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {formatDuration(match.duration)}
              </span>
            )}
          </div>

          {/* Watch Button */}
          <a
            href={getHotstarUrl(match)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-center gap-2 px-8 py-3 rounded-full font-bold',
              'bg-accent text-black hover:bg-accent/90 transition-all',
              'hover:scale-105 shadow-lg'
            )}
          >
            <Play className="w-5 h-5 fill-black" />
            {match.live ? 'Watch Live' : 'Watch Now'}
          </a>
        </m.div>
      </div>
    </section>
  );
}

interface MatchRowProps {
  group: MatchGroup;
  groupIndex: number;
}

function MatchRow({ group, groupIndex }: MatchRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const cardWidth = 320; // Approximate card width
    const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: groupIndex * 0.1, duration: 0.4 }}
      className="relative group/row"
    >
      {/* Row Header */}
      <div className="px-12 lg:px-16 mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold">{group.matchTitle}</h3>
          <span className="text-muted-foreground text-sm">
            {group.dateString}
          </span>
          <span className="text-muted-foreground text-sm">
            &bull; {group.items.length} video{group.items.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Scroll Container */}
      <div className="relative">
        {/* Left Scroll Button */}
        <button
          onClick={() => scroll('left')}
          className={cn(
            'absolute left-2 top-1/2 -translate-y-1/2 z-10',
            'w-10 h-10 rounded-full bg-black/80 text-white',
            'flex items-center justify-center',
            'opacity-0 group-hover/row:opacity-100 transition-opacity duration-300',
            'hover:bg-accent hover:text-black'
          )}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Right Scroll Button */}
        <button
          onClick={() => scroll('right')}
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2 z-10',
            'w-10 h-10 rounded-full bg-black/80 text-white',
            'flex items-center justify-center',
            'opacity-0 group-hover/row:opacity-100 transition-opacity duration-300',
            'hover:bg-accent hover:text-black'
          )}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Cards Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth px-12 lg:px-16 pb-4 no-scrollbar"
        >
          {group.items.map((match, index) => (
            <MatchCard key={match.content_id} match={match} index={index} />
          ))}
        </div>
      </div>
    </m.div>
  );
}

interface MatchCardProps {
  match: SportsContent;
  index: number;
}

function MatchCard({ match, index }: MatchCardProps) {
  const imageUrl = match.thumbnail || match.source_images?.[0]?.url;

  // Extract content type from title (Highlights, Full Match, etc.)
  const getContentType = (title: string): string => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('highlight')) return 'Highlights';
    if (lowerTitle.includes('full match') || lowerTitle.includes('replay')) return 'Full Match';
    if (lowerTitle.includes('interview')) return 'Interview';
    if (lowerTitle.includes('preview')) return 'Preview';
    if (lowerTitle.includes('review') || lowerTitle.includes('analysis')) return 'Analysis';
    if (lowerTitle.includes('press')) return 'Press';
    return '';
  };

  const contentType = getContentType(match.title);

  // Get language badge
  const language = match.lang?.[0];

  return (
    <a
      href={getHotstarUrl(match)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex-shrink-0"
    >
      <m.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        className={cn(
          'group relative w-72 sm:w-80 aspect-video rounded-xl overflow-hidden cursor-pointer',
          'bg-card hover:ring-2 hover:ring-accent transition-all duration-300',
          'hover:scale-[1.02] hover:shadow-xl hover:shadow-accent/20'
        )}
      >
        {/* Background Image */}
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={match.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URLS.backdrop}
            sizes="320px"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between z-10">
          <div className="flex items-center gap-1.5">
            {/* Live Badge */}
            {match.live && (
              <div className="flex items-center gap-1 bg-red-600 rounded-full px-2 py-0.5">
                <Radio className="w-3 h-3 animate-pulse" />
                <span className="text-[10px] font-bold uppercase">Live</span>
              </div>
            )}

            {/* Content Type Badge */}
            {contentType && !match.live && (
              <div className="bg-accent/90 text-black rounded px-2 py-0.5">
                <span className="text-[10px] font-bold uppercase">{contentType}</span>
              </div>
            )}

            {/* Language Badge */}
            {language && (
              <div className="bg-black/70 rounded px-2 py-0.5">
                <span className="text-[10px] font-medium uppercase">{language}</span>
              </div>
            )}
          </div>

          {/* Duration Badge */}
          {match.duration && !match.live && (
            <div className="bg-black/70 rounded px-2 py-0.5">
              <span className="text-xs font-medium">{formatDuration(match.duration)}</span>
            </div>
          )}
        </div>

        {/* Play Icon on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center">
            <Play className="w-6 h-6 fill-black text-black ml-0.5" />
          </div>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h4 className="text-white font-semibold text-sm line-clamp-2">
            {match.title}
          </h4>
        </div>
      </m.div>
    </a>
  );
}

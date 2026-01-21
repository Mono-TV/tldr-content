'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { m } from 'framer-motion';
import { Play, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BLUR_DATA_URLS } from '@/lib/image-utils';
import type { SportsContent } from '@/types/sports';
import { SPORT_ICONS } from '@/types/sports';
import { FastAverageColor } from 'fast-average-color';
import { useDPadNavigation } from '@/hooks/use-dpad-navigation';

interface SportsHeroProps {
  items: SportsContent[];
  isLive?: boolean;
  title?: string;
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

function getImageUrl(content: SportsContent): string {
  return content.thumbnail || content.source_images?.[0]?.url || '';
}

export function SportsHero({ items, isLive = false, title }: SportsHeroProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dominantColor, setDominantColor] = useState('0, 0, 0');
  const [isDPadMode, setIsDPadMode] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  if (items.length === 0) return null;

  // Check if selected item is actually live
  const hasLiveContent = isLive || items.some(item => item.live);

  const selectedItem = items[selectedIndex];
  const sportIcon = SPORT_ICONS[selectedItem.game_name] || '🏆';
  const imageUrl = getImageUrl(selectedItem);

  // D-Pad Navigation for spotlight
  useDPadNavigation({
    onNavigate: (direction) => {
      setIsDPadMode(true);

      if (direction === 'left') {
        setSelectedIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
      } else if (direction === 'right') {
        setSelectedIndex((prev) => (prev + 1) % items.length);
      }
    },
    onSelect: () => {
      if (isDPadMode) {
        window.open(getHotstarUrl(selectedItem), '_blank');
      }
    },
    enabled: true,
  });

  // Scroll selected card into view when using D-Pad
  useEffect(() => {
    if (isDPadMode && cardRefs.current[selectedIndex]) {
      cardRefs.current[selectedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [selectedIndex, isDPadMode]);

  // Extract dominant color from selected image
  useEffect(() => {
    const extractColor = async () => {
      if (!imageUrl) {
        setDominantColor('0, 0, 0');
        return;
      }

      const fac = new FastAverageColor();
      const img = new window.Image();
      img.crossOrigin = 'Anonymous';
      img.src = imageUrl;

      img.onload = () => {
        try {
          const color = fac.getColor(img);
          setDominantColor(`${color.value[0]}, ${color.value[1]}, ${color.value[2]}`);
        } catch (e) {
          console.error('Error extracting color:', e);
          setDominantColor('0, 0, 0');
        }
      };

      img.onerror = () => {
        setDominantColor('0, 0, 0');
      };
    };

    extractColor();
  }, [selectedIndex, imageUrl]);

  return (
    <section
      className="relative h-[60vh] w-full overflow-hidden transition-colors duration-700"
      style={{
        background: `radial-gradient(ellipse at left, rgba(${dominantColor}, 0.3) 0%, rgba(${dominantColor}, 0.15) 40%, rgba(0, 0, 0, 0.95) 100%), linear-gradient(to right, rgb(10, 10, 10) 0%, rgb(15, 15, 20) 100%)`
      }}
    >
      {/* D-Pad Mode Indicator */}
      {isDPadMode && (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-accent/20 backdrop-blur-md border border-accent/40 rounded-full text-xs font-semibold text-accent animate-pulse">
          <span className="w-2 h-2 bg-accent rounded-full"></span>
          D-Pad Mode Active
        </div>
      )}

      <div className="h-full flex">
        {/* Left Panel - 30% - Content Info (Fixed) */}
        <div className="w-[30%] min-w-[380px] flex-shrink-0 py-8 pl-12 pr-8 lg:pl-16 lg:pr-12 flex flex-col justify-center">
          <m.div
            key={selectedItem.content_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="space-y-5"
          >
            {/* Section Title */}
            {title && (
              <h2 className="text-sm font-bold uppercase tracking-widest text-accent">
                {title}
              </h2>
            )}

            {/* Live Badge */}
            {(selectedItem.live || hasLiveContent) && (
              <div className="inline-flex items-center gap-2 bg-red-600 rounded-full px-4 py-1.5">
                <Radio className="w-4 h-4 animate-pulse" />
                <span className="text-sm font-bold uppercase tracking-wider">Live</span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-bold leading-tight text-white drop-shadow-lg">
              {selectedItem.title}
            </h1>

            {/* Meta Info */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Sport Type */}
              <div className="flex items-center gap-2 bg-accent/20 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-accent/40">
                <span className="text-lg">{sportIcon}</span>
                <span className="font-bold text-accent text-sm">
                  {selectedItem.game_name}
                </span>
              </div>

              {/* Season/Tournament */}
              {(selectedItem.sports_season_name || selectedItem.tournament_name) && (
                <span className="text-white/70 text-sm font-medium px-3 py-1.5 bg-white/5 rounded-lg">
                  {selectedItem.sports_season_name || selectedItem.tournament_name}
                </span>
              )}

              {/* Date */}
              {selectedItem.start_date && (
                <span className="text-white/70 text-sm font-medium px-3 py-1.5 bg-white/5 rounded-lg">
                  {formatDate(selectedItem.start_date)}
                </span>
              )}
            </div>

            {/* Description - 2 lines */}
            {selectedItem.description && (
              <p className="text-white/60 text-base leading-relaxed line-clamp-2">
                {selectedItem.description}
              </p>
            )}

            {/* Languages */}
            {selectedItem.lang && selectedItem.lang.length > 0 && (
              <p className="text-white/40 text-sm">
                Available in: {selectedItem.lang.slice(0, 4).join(', ')}
                {selectedItem.lang.length > 4 && ` +${selectedItem.lang.length - 4} more`}
              </p>
            )}

            {/* Watch Button */}
            <a
              href={getHotstarUrl(selectedItem)}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-base',
                'bg-accent text-black hover:bg-accent/90 transition-all duration-300',
                'shadow-lg hover:shadow-accent/30 hover:scale-105 w-fit mt-2'
              )}
            >
              <Play className="w-5 h-5 fill-black" />
              {selectedItem.live ? 'Watch Live' : 'Watch Now'}
            </a>
          </m.div>
        </div>

        {/* Right Panel - 70% - Card Carousel */}
        <div className="flex-1 relative overflow-hidden">
          {/* Fade on right edge */}
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black/80 via-black/40 to-transparent z-10 pointer-events-none" />

          {/* Scroll Container - Using 16:9 horizontal cards for sports */}
          <div className="h-full flex items-center gap-6 px-8 overflow-x-scroll hide-scrollbar scroll-smooth">
            {items.map((item, index) => {
              const itemImageUrl = getImageUrl(item);
              const itemSportIcon = SPORT_ICONS[item.game_name] || '🏆';

              return (
                <m.div
                  key={item.content_id}
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  onMouseEnter={() => {
                    setSelectedIndex(index);
                    setIsDPadMode(false);
                  }}
                  onClick={() => {
                    if (!isDPadMode) {
                      window.open(getHotstarUrl(item), '_blank');
                    }
                  }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  data-focusable="true"
                  data-card-index={index}
                  className={cn(
                    'relative flex-shrink-0 cursor-pointer transition-all duration-500 ease-out',
                    'h-[180px] w-[320px] rounded-xl overflow-hidden group',
                    selectedIndex === index
                      ? 'ring-4 ring-accent scale-110 shadow-2xl shadow-accent/40 z-20'
                      : 'hover:scale-105 hover:ring-2 hover:ring-white/40 hover:shadow-xl',
                    isDPadMode && selectedIndex === index && 'dpad-focused'
                  )}
                >
                  {itemImageUrl ? (
                    <Image
                      src={itemImageUrl}
                      alt={item.title}
                      fill
                      priority={index < 5}
                      loading={index < 5 ? 'eager' : 'lazy'}
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URLS.backdrop}
                      className="object-cover"
                      sizes="320px"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                      <span className="text-4xl">{itemSportIcon}</span>
                    </div>
                  )}

                  {/* Overlay on non-selected items */}
                  <div
                    className={cn(
                      'absolute inset-0 transition-opacity duration-500',
                      selectedIndex !== index
                        ? 'bg-black/50 group-hover:bg-black/30'
                        : 'bg-transparent'
                    )}
                  />

                  {/* Live Badge */}
                  {item.live && (
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-600 rounded-full px-2 py-0.5 z-10">
                      <Radio className="w-3 h-3 animate-pulse" />
                      <span className="text-[10px] font-bold uppercase">Live</span>
                    </div>
                  )}

                  {/* Sport Icon */}
                  <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5 z-10">
                    <span className="text-sm">{itemSportIcon}</span>
                  </div>

                  {/* Title overlay on non-selected items */}
                  {selectedIndex !== index && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white font-semibold text-sm line-clamp-2">
                        {item.title}
                      </p>
                    </div>
                  )}
                </m.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// Skeleton loader matching the spotlight style
export function SportsHeroSkeleton() {
  return (
    <section className="relative h-[60vh] w-full bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
      <div className="h-full flex">
        {/* Left Panel Skeleton */}
        <div className="w-[30%] min-w-[380px] flex-shrink-0 py-8 pl-12 pr-8 lg:pl-16 lg:pr-12 flex flex-col justify-center">
          <div className="space-y-5">
            <div className="h-12 w-3/4 rounded-lg skeleton" />
            <div className="flex gap-3">
              <div className="h-8 w-24 rounded-lg skeleton" />
              <div className="h-8 w-32 rounded-lg skeleton" />
              <div className="h-8 w-20 rounded-lg skeleton" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full rounded skeleton" />
              <div className="h-4 w-4/5 rounded skeleton" />
            </div>
            <div className="h-12 w-40 rounded-full skeleton" />
          </div>
        </div>

        {/* Right Panel Skeleton */}
        <div className="flex-1 flex items-center gap-6 px-8 overflow-hidden">
          <div className="h-[180px] w-[320px] rounded-xl skeleton flex-shrink-0" />
          <div className="h-[180px] w-[320px] rounded-xl skeleton flex-shrink-0" />
          <div className="h-[180px] w-[320px] rounded-xl skeleton flex-shrink-0" />
          <div className="h-[180px] w-[320px] rounded-xl skeleton flex-shrink-0" />
        </div>
      </div>
    </section>
  );
}

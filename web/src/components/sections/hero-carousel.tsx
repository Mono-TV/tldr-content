'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, ChevronLeft, ChevronRight, Star, Heart } from 'lucide-react';
import { cn, getBackdropUrl, formatRating, truncateText } from '@/lib/utils';
import type { Content } from '@/types';

interface HeroCarouselProps {
  items: Content[];
  autoPlayInterval?: number;
}

export function HeroCarousel({ items, autoPlayInterval = 6000 }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (isHovered || items.length <= 1) return;

    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isHovered, items.length, autoPlayInterval, goToNext]);

  if (items.length === 0) return null;

  const currentItem = items[currentIndex];

  return (
    <section
      className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem._id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <Image
            src={getBackdropUrl(currentItem.backdrop_url || currentItem.poster_url, 'lg')}
            alt={currentItem.title}
            fill
            className="object-cover"
            priority
          />
          {/* Enhanced Gradient Overlays for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative h-full flex items-center px-12 lg:px-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem._id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            {/* Title with enhanced text shadow */}
            <h1
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
              style={{
                textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 4px 16px rgba(0,0,0,0.6)',
              }}
            >
              {currentItem.title}
            </h1>

            {/* Enhanced Meta Info */}
            <div className="flex items-center gap-5 mb-6 text-base md:text-lg">
              {currentItem.imdb_rating && (
                <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                  <Star className="w-5 h-5 text-gold fill-gold" />
                  <span className="font-bold text-white">{formatRating(currentItem.imdb_rating)}</span>
                </div>
              )}
              {currentItem.year && (
                <span className="font-semibold text-white/90">{currentItem.year}</span>
              )}
              {currentItem.runtime && (
                <span className="font-medium text-white/70">{currentItem.runtime} min</span>
              )}
              {currentItem.genres?.[0] && (
                <span className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg text-sm font-medium border border-white/20">
                  {currentItem.genres[0].name}
                </span>
              )}
            </div>

            {/* Description with better readability */}
            <p
              className="text-white/80 text-base md:text-lg mb-8 line-clamp-3 leading-relaxed max-w-xl"
              style={{
                textShadow: '0 1px 4px rgba(0,0,0,0.8)',
              }}
            >
              {truncateText(currentItem.overview || currentItem.plot || '', 250)}
            </p>

            {/* Large Prominent CTA Buttons - Apple TV+ style */}
            <div className="flex items-center gap-4 flex-wrap">
              <Link
                href={`/content/${currentItem.imdb_id}`}
                className={cn(
                  'flex items-center gap-3 px-10 py-4 rounded-full font-bold text-lg',
                  'bg-white text-black hover:bg-white/90 transition-all duration-300',
                  'shadow-2xl hover:shadow-white/20 hover:scale-105'
                )}
              >
                <Play className="w-6 h-6 fill-black" />
                Watch Now
              </Link>
              <button
                className={cn(
                  'flex items-center justify-center w-14 h-14 rounded-full',
                  'bg-black/40 backdrop-blur-md border border-white/30 text-white',
                  'hover:bg-white/30 hover:border-white/50 transition-all duration-300',
                  'hover:scale-110'
                )}
                aria-label="Add to watchlist"
              >
                <Heart className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      {items.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className={cn(
              'absolute left-4 top-1/2 -translate-y-1/2 z-10',
              'p-2 rounded-full bg-background/50 backdrop-blur-sm',
              'opacity-0 hover:opacity-100 transition-opacity',
              isHovered && 'opacity-70'
            )}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className={cn(
              'absolute right-4 top-1/2 -translate-y-1/2 z-10',
              'p-2 rounded-full bg-background/50 backdrop-blur-sm',
              'opacity-0 hover:opacity-100 transition-opacity',
              isHovered && 'opacity-70'
            )}
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {items.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                index === currentIndex
                  ? 'w-8 bg-accent'
                  : 'w-1.5 bg-muted-foreground/50 hover:bg-muted-foreground'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// Skeleton loader
export function HeroCarouselSkeleton() {
  return (
    <section className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden">
      <div className="absolute inset-0 skeleton" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
      <div className="relative h-full flex items-center">
        <div className="max-w-2xl space-y-4">
          <div className="h-12 w-3/4 rounded skeleton" />
          <div className="h-6 w-1/2 rounded skeleton" />
          <div className="h-20 w-full rounded skeleton" />
          <div className="flex gap-4">
            <div className="h-12 w-32 rounded-lg skeleton" />
            <div className="h-12 w-32 rounded-lg skeleton" />
          </div>
        </div>
      </div>
    </section>
  );
}

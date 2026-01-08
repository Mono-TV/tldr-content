'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, ChevronLeft, ChevronRight, Star } from 'lucide-react';
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
            src={getBackdropUrl(currentItem.backdrop_url || currentItem.poster_url)}
            alt={currentItem.title}
            fill
            className="object-cover"
            priority
          />
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem._id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              {currentItem.title}
            </h1>

            {/* Meta Info */}
            <div className="flex items-center gap-4 mb-4 text-sm md:text-base">
              {currentItem.imdb_rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-gold fill-gold" />
                  <span className="font-semibold">{formatRating(currentItem.imdb_rating)}</span>
                </div>
              )}
              {currentItem.year && (
                <span className="text-muted-foreground">{currentItem.year}</span>
              )}
              {currentItem.runtime && (
                <span className="text-muted-foreground">{currentItem.runtime} min</span>
              )}
              {currentItem.genres?.[0] && (
                <span className="px-2 py-0.5 bg-card rounded text-xs">
                  {currentItem.genres[0].name}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-sm md:text-base mb-6 line-clamp-3">
              {truncateText(currentItem.overview || currentItem.plot || '', 200)}
            </p>

            {/* Buttons */}
            <div className="flex items-center gap-4">
              <Link
                href={`/content/${currentItem.imdb_id}`}
                className={cn(
                  'flex items-center gap-2 px-6 py-3 rounded-lg font-semibold',
                  'bg-accent hover:bg-accent-hover transition-colors'
                )}
              >
                <Play className="w-5 h-5 fill-white" />
                Watch Now
              </Link>
              <Link
                href={`/content/${currentItem.imdb_id}`}
                className={cn(
                  'flex items-center gap-2 px-6 py-3 rounded-lg font-semibold',
                  'bg-card/80 hover:bg-card transition-colors'
                )}
              >
                <Info className="w-5 h-5" />
                More Info
              </Link>
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

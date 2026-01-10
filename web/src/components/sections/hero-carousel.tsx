'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Star } from 'lucide-react';
import { cn, getImageUrl, formatRating } from '@/lib/utils';
import type { Content } from '@/types';
import { FastAverageColor } from 'fast-average-color';

interface HeroCarouselProps {
  items: Content[];
}

export function HeroCarousel({ items }: HeroCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dominantColor, setDominantColor] = useState('0, 0, 0'); // RGB format

  if (items.length === 0) return null;

  const selectedItem = items[selectedIndex];

  // Extract dominant color from selected poster
  useEffect(() => {
    const extractColor = async () => {
      const fac = new FastAverageColor();
      const img = new window.Image();
      img.crossOrigin = 'Anonymous';
      img.src = getImageUrl(selectedItem.poster_url, 'sm');

      img.onload = () => {
        try {
          const color = fac.getColor(img);
          // Convert to RGB string for use in gradients
          setDominantColor(`${color.value[0]}, ${color.value[1]}, ${color.value[2]}`);
        } catch (e) {
          console.error('Error extracting color:', e);
          setDominantColor('0, 0, 0'); // Fallback to black
        }
      };

      img.onerror = () => {
        setDominantColor('0, 0, 0'); // Fallback to black on error
      };
    };

    extractColor();
  }, [selectedIndex, selectedItem.poster_url]);

  return (
    <section
      className="relative h-[60vh] w-full overflow-hidden transition-colors duration-700"
      style={{
        background: `radial-gradient(ellipse at left, rgba(${dominantColor}, 0.3) 0%, rgba(${dominantColor}, 0.15) 40%, rgba(0, 0, 0, 0.95) 100%), linear-gradient(to right, rgb(10, 10, 10) 0%, rgb(15, 15, 20) 100%)`
      }}
    >
      <div className="h-full flex">
        {/* Left Panel - 30% - Content Info (Fixed) */}
        <div className="w-[30%] min-w-[380px] flex-shrink-0 py-8 pl-12 pr-8 lg:pl-16 lg:pr-12 flex flex-col justify-center">
          <motion.div
            key={selectedItem._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="space-y-6"
          >
            {/* Title */}
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-white drop-shadow-lg">
              {selectedItem.title}
            </h1>

            {/* Meta Info */}
            <div className="flex items-center gap-3 flex-wrap">
              {selectedItem.imdb_rating && (
                <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-yellow-500/30">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-bold text-yellow-300 text-sm">
                    {formatRating(selectedItem.imdb_rating)}
                  </span>
                </div>
              )}
              {selectedItem.year && (
                <span className="text-white/70 text-sm font-medium px-3 py-1.5 bg-white/5 rounded-lg">
                  {selectedItem.year}
                </span>
              )}
              {selectedItem.genres?.[0] && (
                <span className="px-3 py-1.5 bg-accent/20 backdrop-blur-sm rounded-lg text-xs font-semibold border border-accent/40 text-accent">
                  {selectedItem.genres[0].name}
                </span>
              )}
            </div>

            {/* Description - 2 lines */}
            <p className="text-white/60 text-base leading-relaxed line-clamp-2">
              {selectedItem.overview || selectedItem.plot || 'No description available.'}
            </p>

            {/* Play Button */}
            <Link
              href={`/content/${selectedItem.imdb_id}`}
              className={cn(
                'flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-base',
                'bg-accent text-white hover:bg-accent/90 transition-all duration-300',
                'shadow-lg hover:shadow-accent/30 hover:scale-105 w-fit mt-2'
              )}
            >
              <Play className="w-5 h-5 fill-white" />
              Watch Now
            </Link>
          </motion.div>
        </div>

        {/* Right Panel - 70% - Poster Carousel */}
        <div className="flex-1 relative overflow-hidden">
          {/* Only fade on right edge to indicate more content */}
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black/80 via-black/40 to-transparent z-10 pointer-events-none" />

          {/* Scroll Container */}
          <div className="h-full flex items-center gap-10 px-16 overflow-x-scroll hide-scrollbar scroll-smooth">
            {items.map((item, index) => (
              <motion.div
                key={item._id}
                onMouseEnter={() => setSelectedIndex(index)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'relative flex-shrink-0 cursor-pointer transition-all duration-500 ease-out',
                  'h-[350px] w-[233px] rounded-2xl overflow-hidden group',
                  selectedIndex === index
                    ? 'ring-4 ring-accent scale-110 shadow-2xl shadow-accent/40 z-20'
                    : 'hover:scale-105 hover:ring-2 hover:ring-white/40 hover:shadow-xl'
                )}
              >
                <Image
                  src={getImageUrl(item.poster_url, 'md')}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="233px"
                />
                {/* Overlay on non-selected items */}
                <div
                  className={cn(
                    'absolute inset-0 transition-opacity duration-500',
                    selectedIndex !== index
                      ? 'bg-black/50 group-hover:bg-black/30'
                      : 'bg-transparent'
                  )}
                />
                {/* Title overlay on hover (non-selected items) */}
                {selectedIndex !== index && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white font-semibold text-sm line-clamp-2">
                      {item.title}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Skeleton loader
export function HeroCarouselSkeleton() {
  return (
    <section className="relative h-[60vh] w-full bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
      <div className="h-full flex">
        {/* Left Panel Skeleton */}
        <div className="w-[30%] min-w-[380px] flex-shrink-0 py-8 pl-12 pr-8 lg:pl-16 lg:pr-12 flex flex-col justify-center">
          <div className="space-y-6">
            <div className="h-14 w-3/4 rounded-lg skeleton" />
            <div className="flex gap-3">
              <div className="h-8 w-20 rounded-lg skeleton" />
              <div className="h-8 w-16 rounded-lg skeleton" />
              <div className="h-8 w-24 rounded-lg skeleton" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full rounded skeleton" />
              <div className="h-4 w-4/5 rounded skeleton" />
            </div>
            <div className="h-12 w-40 rounded-full skeleton" />
          </div>
        </div>

        {/* Right Panel Skeleton */}
        <div className="flex-1 flex items-center gap-10 px-16 overflow-hidden">
          <div className="h-[350px] w-[233px] rounded-2xl skeleton flex-shrink-0" />
          <div className="h-[350px] w-[233px] rounded-2xl skeleton flex-shrink-0" />
          <div className="h-[350px] w-[233px] rounded-2xl skeleton flex-shrink-0" />
          <div className="h-[350px] w-[233px] rounded-2xl skeleton flex-shrink-0" />
        </div>
      </div>
    </section>
  );
}

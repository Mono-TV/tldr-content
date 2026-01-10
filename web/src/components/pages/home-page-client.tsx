'use client';

import { HeroCarousel } from '@/components/sections/hero-carousel';
import { ContentRow } from '@/components/sections/content-row';
import type { HomepageData } from '@/lib/fetch-homepage-data';
import Link from 'next/link';
import { Film, Tv } from 'lucide-react';

interface HomePageClientProps {
  data: HomepageData;
}

export function HomePageClient({ data }: HomePageClientProps) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroCarousel items={data.featured?.items || []} />

      {/* Content Rows */}
      <div className="pb-20 space-y-12">
        {/* Trending Now - Mix of Movies & Shows */}
        {data.trending?.items && data.trending.items.length > 0 && (
          <ContentRow
            title="Trending Now"
            contents={data.trending.items}
            href="/search?sort=popularity&order=desc"
          />
        )}

        {/* Top Rated - Mix */}
        {data.topRated?.items && data.topRated.items.length > 0 && (
          <ContentRow
            title="Top Rated"
            contents={data.topRated.items}
            href="/search?sort=rating&order=desc&min_rating=8"
          />
        )}

        {/* Movies Section */}
        <div className="relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-4">
              <Film className="w-6 h-6 text-accent" />
              <h2 className="text-2xl md:text-3xl font-bold">Movies</h2>
            </div>
          </div>

          {/* Trending Movies */}
          {data.trendingMovies?.items && data.trendingMovies.items.length > 0 && (
            <ContentRow
              title="Trending Movies"
              contents={data.trendingMovies.items}
              href="/movies"
            />
          )}

          {/* Top Rated Movies */}
          {data.topMovies?.items && data.topMovies.items.length > 0 && (
            <ContentRow
              title="Top Rated Movies"
              contents={data.topMovies.items}
              href="/movies"
            />
          )}
        </div>

        {/* Shows Section */}
        <div className="relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-4">
              <Tv className="w-6 h-6 text-accent" />
              <h2 className="text-2xl md:text-3xl font-bold">TV Shows</h2>
            </div>
          </div>

          {/* Trending Shows */}
          {data.trendingShows?.items && data.trendingShows.items.length > 0 && (
            <ContentRow
              title="Trending TV Shows"
              contents={data.trendingShows.items}
              href="/shows"
            />
          )}

          {/* Top Rated Shows */}
          {data.topShows?.items && data.topShows.items.length > 0 && (
            <ContentRow
              title="Top Rated TV Shows"
              contents={data.topShows.items}
              href="/shows"
            />
          )}
        </div>
      </div>
    </div>
  );
}

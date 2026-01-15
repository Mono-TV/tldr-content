'use client';

import { useQuery } from '@tanstack/react-query';
import { HeroCarousel } from '@/components/sections/hero-carousel';
import { ContentRow, Top10Row } from '@/components/sections/content-row';
import { LazyContentRow } from '@/components/sections/lazy-content-row';
import type { CriticalMoviesData, RemainingMoviesData } from '@/lib/fetch-movies-data';
import type { Content } from '@/types';

interface MoviesPageClientProps {
  criticalData: CriticalMoviesData;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://content-api-401132033262.asia-south1.run.app';

// Helper to fetch content from API
async function fetchContent(params: Record<string, string | number>): Promise<{ items: Content[]; total: number }> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });

  const response = await fetch(`${API_BASE_URL}/api/content?${searchParams.toString()}`);
  if (!response.ok) {
    return { items: [], total: 0 };
  }

  const data = await response.json();
  return {
    items: data.content || data.items || [],
    total: data.pagination?.total || data.total || 0,
  };
}

// Helper to search content from API
async function searchContent(query: string, params: Record<string, string | number>): Promise<{ items: Content[]; total: number }> {
  const searchParams = new URLSearchParams({ q: query });
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });

  const response = await fetch(`${API_BASE_URL}/api/search?${searchParams.toString()}`);
  if (!response.ok) {
    return { items: [], total: 0 };
  }

  const data = await response.json();
  return {
    items: data.items || [],
    total: data.total || 0,
  };
}

// Helper to merge star movie results
async function fetchStarMovies(stars: string[]): Promise<{ items: Content[]; total: number }> {
  const fiveYearsAgo = new Date().getFullYear() - 5;

  const results = await Promise.all(
    stars.map(star =>
      searchContent(star, {
        type: 'movie',
        year_from: fiveYearsAgo,
        sort: 'rating',
        order: 'desc',
        limit: 8,
      })
    )
  );

  const allContent = results.flatMap(r => r.items || []);
  const uniqueContent = Array.from(
    new Map(allContent.map(item => [item.imdb_id, item])).values()
  );

  const sortedContent = uniqueContent.sort((a, b) => {
    const ratingA = a.imdb_rating ?? 0;
    const ratingB = b.imdb_rating ?? 0;
    if (ratingB !== ratingA) return ratingB - ratingA;
    return 0;
  });

  return {
    items: sortedContent.slice(0, 15),
    total: sortedContent.length,
  };
}

// Year helpers
const currentYear = new Date().getFullYear();
const tenYearsAgo = currentYear - 10;
const fifteenYearsAgo = currentYear - 15;
const twentyYearsAgo = currentYear - 20;
const twentyFiveYearsAgo = currentYear - 25;

/**
 * Client-side movies page component with progressive loading
 *
 * Receives CRITICAL data from server (10 rows - renders immediately)
 * Lazy-loads REMAINING data client-side (38 rows - loads in background)
 */
export function MoviesPageClient({ criticalData }: MoviesPageClientProps) {
  // Fetch remaining data in ONE batch query after initial render
  const { data: remainingData, isLoading: isLoadingRemaining } = useQuery<RemainingMoviesData>({
    queryKey: ['movies-remaining-data'],
    queryFn: async () => {
      // Fetch all remaining rows in parallel batches
      const [
        // Remaining Action rows (7)
        topActionEnglish,
        topActionHindi,
        topActionTamil,
        topActionTelugu,
        topActionMalayalam,
        topActionKannada,
        topActionBengali,

        // Top Comedy Movies (8)
        topComedy,
        topComedyEnglish,
        topComedyHindi,
        topComedyTamil,
        topComedyTelugu,
        topComedyMalayalam,
        topComedyKannada,
        topComedyBengali,

        // Top Drama Movies (8)
        topDrama,
        topDramaEnglish,
        topDramaHindi,
        topDramaTamil,
        topDramaTelugu,
        topDramaMalayalam,
        topDramaKannada,
        topDramaBengali,

        // Top Thriller Movies (8)
        topThriller,
        topThrillerEnglish,
        topThrillerHindi,
        topThrillerTamil,
        topThrillerTelugu,
        topThrillerMalayalam,
        topThrillerKannada,
        topThrillerBengali,

        // Latest Star Movies (7)
        hindiStar,
        englishStar,
        tamilStar,
        teluguStar,
        malayalamStar,
        kannadaStar,
        bengaliStar,

        // Top 10 (1)
        topRated,
      ] = await Promise.all([
        // Remaining Action rows
        fetchContent({ min_rating: 7.0, min_votes: 20000, type: 'movie', genre: 'Action', original_language: 'en', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 6.5, min_votes: 5000, type: 'movie', genre: 'Action', original_language: 'hi', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 6.5, min_votes: 3000, type: 'movie', genre: 'Action', original_language: 'ta', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 6.5, min_votes: 2000, type: 'movie', genre: 'Action', original_language: 'te', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 6.0, min_votes: 1500, type: 'movie', genre: 'Action', original_language: 'ml', year_from: twentyYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 6.0, min_votes: 1000, type: 'movie', genre: 'Action', original_language: 'kn', year_from: twentyYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 6.0, min_votes: 800, type: 'movie', genre: 'Action', original_language: 'bn', year_from: twentyYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),

        // Top Comedy Movies rows
        fetchContent({ min_rating: 7.0, min_votes: 20000, type: 'movie', genre: 'Comedy', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 7.0, min_votes: 20000, type: 'movie', genre: 'Comedy', original_language: 'en', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 6.5, min_votes: 5000, type: 'movie', genre: 'Comedy', original_language: 'hi', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 6.5, min_votes: 2000, type: 'movie', genre: 'Comedy', original_language: 'ta', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 6.0, min_votes: 1500, type: 'movie', genre: 'Comedy', original_language: 'te', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 6.0, min_votes: 1000, type: 'movie', genre: 'Comedy', original_language: 'ml', year_from: twentyYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 6.0, min_votes: 800, type: 'movie', genre: 'Comedy', original_language: 'kn', year_from: twentyFiveYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 6.0, min_votes: 600, type: 'movie', genre: 'Comedy', original_language: 'bn', year_from: twentyFiveYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),

        // Top Drama Movies rows
        fetchContent({ min_rating: 7.5, min_votes: 20000, type: 'movie', genre: 'Drama', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 7.5, min_votes: 20000, type: 'movie', genre: 'Drama', original_language: 'en', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 7.0, min_votes: 5000, type: 'movie', genre: 'Drama', original_language: 'hi', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 7.0, min_votes: 3000, type: 'movie', genre: 'Drama', original_language: 'ta', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 6.5, min_votes: 2000, type: 'movie', genre: 'Drama', original_language: 'te', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 6.5, min_votes: 1500, type: 'movie', genre: 'Drama', original_language: 'ml', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 6.5, min_votes: 1000, type: 'movie', genre: 'Drama', original_language: 'kn', year_from: twentyYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 6.5, min_votes: 800, type: 'movie', genre: 'Drama', original_language: 'bn', year_from: twentyYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),

        // Top Thriller Movies rows
        fetchContent({ min_rating: 7.0, min_votes: 20000, type: 'movie', genre: 'Thriller', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 7.0, min_votes: 20000, type: 'movie', genre: 'Thriller', original_language: 'en', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 6.5, min_votes: 5000, type: 'movie', genre: 'Thriller', original_language: 'hi', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 6.5, min_votes: 3000, type: 'movie', genre: 'Thriller', original_language: 'ta', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 6.5, min_votes: 2000, type: 'movie', genre: 'Thriller', original_language: 'te', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 6.0, min_votes: 1500, type: 'movie', genre: 'Thriller', original_language: 'ml', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 6.0, min_votes: 1000, type: 'movie', genre: 'Thriller', original_language: 'kn', year_from: twentyYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 6.0, min_votes: 800, type: 'movie', genre: 'Thriller', original_language: 'bn', year_from: twentyYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),

        // Latest Star Movies
        fetchStarMovies(['Rajkummar Rao', 'Varun Dhawan', 'Vicky Kaushal', 'Kartik Aaryan']),
        fetchStarMovies(['Dwayne Johnson', 'Chris Hemsworth', 'Tom Cruise', 'Brad Pitt']),
        fetchStarMovies(['Dhanush', 'Ajith Kumar', 'Sivakarthikeyan', 'Rajinikanth']),
        fetchStarMovies(['Ravi Teja', 'Mahesh Babu', 'Vijay Deverakonda', 'Ram Charan']),
        fetchStarMovies(['Mohanlal', 'Mammootty', 'Fahadh Faasil', 'Tovino Thomas']),
        fetchStarMovies(['Sudeep', 'Shiva Rajkumar', 'Rishab Shetty', 'Upendra']),
        fetchStarMovies(['Jisshu Sengupta', 'Prosenjit Chatterjee', 'Abir Chatterjee']),

        // Top 10
        fetchContent({ min_rating: 8, min_votes: 50000, type: 'movie', sort: 'rating', order: 'desc', limit: 10 }),
      ]);

      return {
        topActionEnglish,
        topActionHindi,
        topActionTamil,
        topActionTelugu,
        topActionMalayalam,
        topActionKannada,
        topActionBengali,

        topComedy,
        topComedyEnglish,
        topComedyHindi,
        topComedyTamil,
        topComedyTelugu,
        topComedyMalayalam,
        topComedyKannada,
        topComedyBengali,

        topDrama,
        topDramaEnglish,
        topDramaHindi,
        topDramaTamil,
        topDramaTelugu,
        topDramaMalayalam,
        topDramaKannada,
        topDramaBengali,

        topThriller,
        topThrillerEnglish,
        topThrillerHindi,
        topThrillerTamil,
        topThrillerTelugu,
        topThrillerMalayalam,
        topThrillerKannada,
        topThrillerBengali,

        hindiStar,
        englishStar,
        tamilStar,
        teluguStar,
        malayalamStar,
        kannadaStar,
        bengaliStar,

        topRated,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Carousel - CRITICAL (pre-rendered) */}
      <HeroCarousel items={criticalData.featured?.items || []} />

      {/* Content Sections */}
      <div className="-mt-20 relative z-10 space-y-8 pl-12 lg:pl-16">
        {/* ========================================
            CRITICAL ROWS (10) - Pre-rendered by server
            ======================================== */}

        {/* Top Rated Movies */}
        <ContentRow
          title="Top Rated Movies"
          contents={criticalData.topRatedRecent?.items || []}
          href="/browse?type=movie&min_rating=7.5&sort=rating"
          priorityCount={5}
        />

        <ContentRow
          title="Top Rated English Movies"
          contents={criticalData.topRatedEnglish?.items || []}
          href="/browse?type=movie&language=English&min_rating=7.5&sort=rating"
          priorityCount={5}
        />

        <ContentRow
          title="Top Rated Hindi Movies"
          contents={criticalData.topRatedHindi?.items || []}
          href="/browse?type=movie&language=Hindi&min_rating=7.5&sort=rating"
        />

        <ContentRow
          title="Top Rated Bengali Movies"
          contents={criticalData.topRatedBengali?.items || []}
          href="/browse?type=movie&language=Bengali&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Rated Tamil Movies"
          contents={criticalData.topRatedTamil?.items || []}
          href="/browse?type=movie&language=Tamil&min_rating=7.5&sort=rating"
        />

        <ContentRow
          title="Top Rated Telugu Movies"
          contents={criticalData.topRatedTelugu?.items || []}
          href="/browse?type=movie&language=Telugu&min_rating=7.5&sort=rating"
        />

        <ContentRow
          title="Top Rated Malayalam Movies"
          contents={criticalData.topRatedMalayalam?.items || []}
          href="/browse?type=movie&language=Malayalam&min_rating=7.5&sort=rating"
        />

        <ContentRow
          title="Top Rated Kannada Movies"
          contents={criticalData.topRatedKannada?.items || []}
          href="/browse?type=movie&language=Kannada&min_rating=7.5&sort=rating"
        />

        {/* Top Action Movies - First row is critical */}
        <ContentRow
          title="Top Action Movies"
          contents={criticalData.topAction?.items || []}
          href="/browse?type=movie&genre=Action&min_rating=7.5&sort=rating"
        />

        {/* ========================================
            LAZY-LOADED ROWS (38) - Loaded client-side
            ======================================== */}

        {/* Remaining Action Rows */}
        <ContentRow
          title="Top English Action Movies"
          contents={remainingData?.topActionEnglish?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&language=English&genre=Action&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Hindi Action Movies"
          contents={remainingData?.topActionHindi?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&language=Hindi&genre=Action&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Tamil Action Movies"
          contents={remainingData?.topActionTamil?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&language=Tamil&genre=Action&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Telugu Action Movies"
          contents={remainingData?.topActionTelugu?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&language=Telugu&genre=Action&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Malayalam Action Movies"
          contents={remainingData?.topActionMalayalam?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&language=Malayalam&genre=Action&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Kannada Action Movies"
          contents={remainingData?.topActionKannada?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&language=Kannada&genre=Action&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Bengali Action Movies"
          contents={remainingData?.topActionBengali?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&language=Bengali&genre=Action&min_rating=6&sort=rating"
        />

        {/* Top Comedy Movies Rows */}
        <ContentRow
          title="Top Comedy Movies"
          contents={remainingData?.topComedy?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&genre=Comedy&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top English Comedy Movies"
          contents={remainingData?.topComedyEnglish?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&language=English&genre=Comedy&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Hindi Comedy Movies"
          contents={remainingData?.topComedyHindi?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&language=Hindi&genre=Comedy&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Tamil Comedy Movies"
          contents={remainingData?.topComedyTamil?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&language=Tamil&genre=Comedy&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Telugu Comedy Movies"
          contents={remainingData?.topComedyTelugu?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&language=Telugu&genre=Comedy&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Malayalam Comedy Movies"
          contents={remainingData?.topComedyMalayalam?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&language=Malayalam&genre=Comedy&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Kannada Comedy Movies"
          contents={remainingData?.topComedyKannada?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&language=Kannada&genre=Comedy&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Bengali Comedy Movies"
          contents={remainingData?.topComedyBengali?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&language=Bengali&genre=Comedy&min_rating=6&sort=rating"
        />

        {/* Top Drama Movies Rows */}
        <ContentRow
          title="Top Drama Movies"
          contents={remainingData?.topDrama?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&genre=Drama&min_rating=7.5&sort=rating"
        />

        <ContentRow
          title="Top English Drama Movies"
          contents={remainingData?.topDramaEnglish?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&language=English&genre=Drama&min_rating=7.5&sort=rating"
        />

        <ContentRow
          title="Top Hindi Drama Movies"
          contents={remainingData?.topDramaHindi?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&language=Hindi&genre=Drama&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Tamil Drama Movies"
          contents={remainingData?.topDramaTamil?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&language=Tamil&genre=Drama&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Telugu Drama Movies"
          contents={remainingData?.topDramaTelugu?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&language=Telugu&genre=Drama&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Malayalam Drama Movies"
          contents={remainingData?.topDramaMalayalam?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&language=Malayalam&genre=Drama&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Kannada Drama Movies"
          contents={remainingData?.topDramaKannada?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&language=Kannada&genre=Drama&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Bengali Drama Movies"
          contents={remainingData?.topDramaBengali?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&language=Bengali&genre=Drama&min_rating=6&sort=rating"
        />

        {/* Top Thriller Movies Rows */}
        <ContentRow
          title="Top Thriller Movies"
          contents={remainingData?.topThriller?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&genre=Thriller&min_rating=7.5&sort=rating"
        />

        <ContentRow
          title="Top English Thriller Movies"
          contents={remainingData?.topThrillerEnglish?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&language=English&genre=Thriller&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Hindi Thriller Movies"
          contents={remainingData?.topThrillerHindi?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&language=Hindi&genre=Thriller&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Tamil Thriller Movies"
          contents={remainingData?.topThrillerTamil?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&language=Tamil&genre=Thriller&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Telugu Thriller Movies"
          contents={remainingData?.topThrillerTelugu?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&language=Telugu&genre=Thriller&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Malayalam Thriller Movies"
          contents={remainingData?.topThrillerMalayalam?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&language=Malayalam&genre=Thriller&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Kannada Thriller Movies"
          contents={remainingData?.topThrillerKannada?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&language=Kannada&genre=Thriller&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Bengali Thriller Movies"
          contents={remainingData?.topThrillerBengali?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&language=Bengali&genre=Thriller&min_rating=6&sort=rating"
        />

        {/* Latest Star Movies Rows */}
        <ContentRow
          title="Latest Hindi Star Movies"
          subtitle="Popular Hindi movies from top actors"
          contents={remainingData?.hindiStar?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&language=Hindi&min_rating=7"
        />

        <ContentRow
          title="Latest English Star Movies"
          subtitle="Featuring Dwayne Johnson, Chris Hemsworth, Tom Cruise & more"
          contents={remainingData?.englishStar?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&language=English&min_rating=7"
        />

        <ContentRow
          title="Latest Tamil Star Movies"
          subtitle="Popular Tamil movies from top actors"
          contents={remainingData?.tamilStar?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&language=Tamil&min_rating=7"
        />

        <ContentRow
          title="Latest Telugu Star Movies"
          subtitle="Popular Telugu movies from top actors"
          contents={remainingData?.teluguStar?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&language=Telugu&min_rating=7"
        />

        <ContentRow
          title="Latest Malayalam Star Movies"
          subtitle="Popular Malayalam movies from top actors"
          contents={remainingData?.malayalamStar?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&language=Malayalam&min_rating=7"
        />

        <ContentRow
          title="Latest Kannada Star Movies"
          subtitle="Popular Kannada movies from top actors"
          contents={remainingData?.kannadaStar?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&language=Kannada&min_rating=7"
        />

        <ContentRow
          title="Latest Bengali Star Movies"
          subtitle="Popular Bengali movies from top actors"
          contents={remainingData?.bengaliStar?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=movie&language=Bengali&min_rating=7"
        />

        {/* Top 10 */}
        <Top10Row
          title="Top 10 Movies This Week"
          contents={remainingData?.topRated?.items || []}
          isLoading={isLoadingRemaining}
        />
      </div>
    </div>
  );
}

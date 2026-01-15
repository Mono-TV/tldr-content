'use client';

import { useQuery } from '@tanstack/react-query';
import { HeroCarousel } from '@/components/sections/hero-carousel';
import { ContentRow, Top10Row } from '@/components/sections/content-row';
import type { CriticalShowsData, RemainingShowsData } from '@/lib/fetch-shows-data';
import type { Content } from '@/types';

interface ShowsPageClientProps {
  criticalData: CriticalShowsData;
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

// Helper to merge star show results
async function fetchStarShows(stars: string[]): Promise<{ items: Content[]; total: number }> {
  const fiveYearsAgo = new Date().getFullYear() - 5;

  const results = await Promise.all(
    stars.map(star =>
      searchContent(star, {
        type: 'show',
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
 * Client-side shows page component with progressive loading
 *
 * Receives CRITICAL data from server (10 rows - renders immediately)
 * Lazy-loads REMAINING data client-side (38 rows - loads in background)
 */
export function ShowsPageClient({ criticalData }: ShowsPageClientProps) {
  // Fetch remaining data in ONE batch query after initial render
  const { data: remainingData, isLoading: isLoadingRemaining } = useQuery<RemainingShowsData>({
    queryKey: ['shows-remaining-data'],
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

        // Top Comedy Shows (8)
        topComedy,
        topComedyEnglish,
        topComedyHindi,
        topComedyTamil,
        topComedyTelugu,
        topComedyMalayalam,
        topComedyKannada,
        topComedyBengali,

        // Top Drama Shows (8)
        topDrama,
        topDramaEnglish,
        topDramaHindi,
        topDramaTamil,
        topDramaTelugu,
        topDramaMalayalam,
        topDramaKannada,
        topDramaBengali,

        // Top Thriller Shows (8)
        topThriller,
        topThrillerEnglish,
        topThrillerHindi,
        topThrillerTamil,
        topThrillerTelugu,
        topThrillerMalayalam,
        topThrillerKannada,
        topThrillerBengali,

        // Latest Star Shows (7)
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
        fetchContent({ min_rating: 7.0, min_votes: 20000, type: 'show', genre: 'Action', original_language: 'en', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 6.5, min_votes: 3000, type: 'show', genre: 'Action', original_language: 'hi', sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 6.0, min_votes: 500, type: 'show', genre: 'Action', original_language: 'ta', sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 6.0, min_votes: 300, type: 'show', genre: 'Action', original_language: 'te', sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 5.5, min_votes: 200, type: 'show', genre: 'Action', original_language: 'ml', sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 5.5, min_votes: 100, type: 'show', genre: 'Action', original_language: 'kn', sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 5.5, min_votes: 100, type: 'show', genre: 'Action', original_language: 'bn', sort: 'rating', order: 'desc', limit: 15 }),

        // Top Comedy Shows rows
        fetchContent({ min_rating: 7.0, min_votes: 20000, type: 'show', genre: 'Comedy', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 7.0, min_votes: 20000, type: 'show', genre: 'Comedy', original_language: 'en', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 6.5, min_votes: 3000, type: 'show', genre: 'Comedy', original_language: 'hi', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 6.0, min_votes: 400, type: 'show', genre: 'Comedy', original_language: 'ta', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 6.0, min_votes: 300, type: 'show', genre: 'Comedy', original_language: 'te', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 5.5, min_votes: 200, type: 'show', genre: 'Comedy', original_language: 'ml', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 5.5, min_votes: 100, type: 'show', genre: 'Comedy', original_language: 'kn', year_from: twentyYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 5.5, min_votes: 100, type: 'show', genre: 'Comedy', original_language: 'bn', year_from: twentyFiveYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),

        // Top Drama Shows rows
        fetchContent({ min_rating: 7.5, min_votes: 20000, type: 'show', genre: 'Drama', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 7.5, min_votes: 20000, type: 'show', genre: 'Drama', original_language: 'en', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 6.5, min_votes: 5000, type: 'show', genre: 'Drama', original_language: 'hi', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 6.0, min_votes: 500, type: 'show', genre: 'Drama', original_language: 'ta', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 6.0, min_votes: 400, type: 'show', genre: 'Drama', original_language: 'te', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 5.5, min_votes: 300, type: 'show', genre: 'Drama', original_language: 'ml', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 5.5, min_votes: 150, type: 'show', genre: 'Drama', original_language: 'kn', year_from: twentyYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 5.5, min_votes: 150, type: 'show', genre: 'Drama', original_language: 'bn', year_from: twentyFiveYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),

        // Top Thriller Shows rows
        fetchContent({ min_rating: 6.5, min_votes: 10000, type: 'show', genre: 'Thriller', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 7.0, min_votes: 20000, type: 'show', genre: 'Thriller', original_language: 'en', year_from: tenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 6.5, min_votes: 4000, type: 'show', genre: 'Thriller', original_language: 'hi', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 6.0, min_votes: 600, type: 'show', genre: 'Thriller', original_language: 'ta', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 6.0, min_votes: 500, type: 'show', genre: 'Thriller', original_language: 'te', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 5.5, min_votes: 300, type: 'show', genre: 'Thriller', original_language: 'ml', year_from: fifteenYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 5.5, min_votes: 150, type: 'show', genre: 'Thriller', original_language: 'kn', year_from: twentyYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),
        fetchContent({ min_rating: 5.5, min_votes: 150, type: 'show', genre: 'Thriller', original_language: 'bn', year_from: twentyFiveYearsAgo, sort: 'rating', order: 'desc', limit: 15 }),

        // Latest Star Shows
        fetchStarShows(['Rajkummar Rao', 'Varun Dhawan', 'Vicky Kaushal', 'Kartik Aaryan']),
        fetchStarShows(['Bryan Cranston', 'Pedro Pascal', 'Millie Bobby Brown', 'Henry Cavill']),
        fetchStarShows(['Dhanush', 'Ajith Kumar', 'Sivakarthikeyan', 'Rajinikanth']),
        fetchStarShows(['Ravi Teja', 'Mahesh Babu', 'Vijay Deverakonda', 'Ram Charan']),
        fetchStarShows(['Mohanlal', 'Mammootty', 'Fahadh Faasil', 'Tovino Thomas']),
        fetchStarShows(['Sudeep', 'Shiva Rajkumar', 'Rishab Shetty', 'Upendra']),
        fetchStarShows(['Jisshu Sengupta', 'Prosenjit Chatterjee', 'Abir Chatterjee']),

        // Top 10
        fetchContent({ min_rating: 8, min_votes: 50000, type: 'show', sort: 'rating', order: 'desc', limit: 10 }),
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

        {/* Top Rated Shows */}
        <ContentRow
          title="Top Rated Shows"
          contents={criticalData.topRatedRecent?.items || []}
          href="/browse?type=show&min_rating=7.5&sort=rating"
          priorityCount={5}
        />

        <ContentRow
          title="Top Rated English Shows"
          contents={criticalData.topRatedEnglish?.items || []}
          href="/browse?type=show&language=English&min_rating=7.5&sort=rating"
          priorityCount={5}
        />

        <ContentRow
          title="Top Rated Hindi Shows"
          contents={criticalData.topRatedHindi?.items || []}
          href="/browse?type=show&language=Hindi&min_rating=7.5&sort=rating"
        />

        <ContentRow
          title="Top Rated Bengali Shows"
          contents={criticalData.topRatedBengali?.items || []}
          href="/browse?type=show&language=Bengali&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Rated Tamil Shows"
          contents={criticalData.topRatedTamil?.items || []}
          href="/browse?type=show&language=Tamil&min_rating=7.5&sort=rating"
        />

        <ContentRow
          title="Top Rated Telugu Shows"
          contents={criticalData.topRatedTelugu?.items || []}
          href="/browse?type=show&language=Telugu&min_rating=7.5&sort=rating"
        />

        <ContentRow
          title="Top Rated Malayalam Shows"
          contents={criticalData.topRatedMalayalam?.items || []}
          href="/browse?type=show&language=Malayalam&min_rating=7.5&sort=rating"
        />

        <ContentRow
          title="Top Rated Kannada Shows"
          contents={criticalData.topRatedKannada?.items || []}
          href="/browse?type=show&language=Kannada&min_rating=7.5&sort=rating"
        />

        {/* Top Action Shows - First row is critical */}
        <ContentRow
          title="Top Action Shows"
          contents={criticalData.topAction?.items || []}
          href="/browse?type=show&genre=Action&min_rating=7.5&sort=rating"
        />

        {/* ========================================
            LAZY-LOADED ROWS (38) - Loaded client-side
            ======================================== */}

        {/* Remaining Action Rows */}
        <ContentRow
          title="Top English Action Shows"
          contents={remainingData?.topActionEnglish?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&language=English&genre=Action&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Hindi Action Shows"
          contents={remainingData?.topActionHindi?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&language=Hindi&genre=Action&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Tamil Action Shows"
          contents={remainingData?.topActionTamil?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&language=Tamil&genre=Action&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Telugu Action Shows"
          contents={remainingData?.topActionTelugu?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&language=Telugu&genre=Action&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Malayalam Action Shows"
          contents={remainingData?.topActionMalayalam?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&language=Malayalam&genre=Action&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Kannada Action Shows"
          contents={remainingData?.topActionKannada?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&language=Kannada&genre=Action&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Bengali Action Shows"
          contents={remainingData?.topActionBengali?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&language=Bengali&genre=Action&min_rating=6&sort=rating"
        />

        {/* Top Comedy Shows Rows */}
        <ContentRow
          title="Top Comedy Shows"
          contents={remainingData?.topComedy?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&genre=Comedy&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top English Comedy Shows"
          contents={remainingData?.topComedyEnglish?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&language=English&genre=Comedy&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Hindi Comedy Shows"
          contents={remainingData?.topComedyHindi?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&language=Hindi&genre=Comedy&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Tamil Comedy Shows"
          contents={remainingData?.topComedyTamil?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&language=Tamil&genre=Comedy&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Telugu Comedy Shows"
          contents={remainingData?.topComedyTelugu?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&language=Telugu&genre=Comedy&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Malayalam Comedy Shows"
          contents={remainingData?.topComedyMalayalam?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&language=Malayalam&genre=Comedy&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Kannada Comedy Shows"
          contents={remainingData?.topComedyKannada?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&language=Kannada&genre=Comedy&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Bengali Comedy Shows"
          contents={remainingData?.topComedyBengali?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&language=Bengali&genre=Comedy&min_rating=6&sort=rating"
        />

        {/* Top Drama Shows Rows */}
        <ContentRow
          title="Top Drama Shows"
          contents={remainingData?.topDrama?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&genre=Drama&min_rating=7.5&sort=rating"
        />

        <ContentRow
          title="Top English Drama Shows"
          contents={remainingData?.topDramaEnglish?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&language=English&genre=Drama&min_rating=7.5&sort=rating"
        />

        <ContentRow
          title="Top Hindi Drama Shows"
          contents={remainingData?.topDramaHindi?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&language=Hindi&genre=Drama&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Tamil Drama Shows"
          contents={remainingData?.topDramaTamil?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&language=Tamil&genre=Drama&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Telugu Drama Shows"
          contents={remainingData?.topDramaTelugu?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&language=Telugu&genre=Drama&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Malayalam Drama Shows"
          contents={remainingData?.topDramaMalayalam?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&language=Malayalam&genre=Drama&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Kannada Drama Shows"
          contents={remainingData?.topDramaKannada?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&language=Kannada&genre=Drama&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Bengali Drama Shows"
          contents={remainingData?.topDramaBengali?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&language=Bengali&genre=Drama&min_rating=6&sort=rating"
        />

        {/* Top Thriller Shows Rows */}
        <ContentRow
          title="Top Thriller Shows"
          contents={remainingData?.topThriller?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&genre=Thriller&min_rating=7.5&sort=rating"
        />

        <ContentRow
          title="Top English Thriller Shows"
          contents={remainingData?.topThrillerEnglish?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&language=English&genre=Thriller&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Hindi Thriller Shows"
          contents={remainingData?.topThrillerHindi?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&language=Hindi&genre=Thriller&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Tamil Thriller Shows"
          contents={remainingData?.topThrillerTamil?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&language=Tamil&genre=Thriller&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Telugu Thriller Shows"
          contents={remainingData?.topThrillerTelugu?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&language=Telugu&genre=Thriller&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Malayalam Thriller Shows"
          contents={remainingData?.topThrillerMalayalam?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&language=Malayalam&genre=Thriller&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Kannada Thriller Shows"
          contents={remainingData?.topThrillerKannada?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&language=Kannada&genre=Thriller&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Bengali Thriller Shows"
          contents={remainingData?.topThrillerBengali?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&language=Bengali&genre=Thriller&min_rating=6&sort=rating"
        />

        {/* Latest Star Shows Rows */}
        <ContentRow
          title="Latest Hindi Star Shows"
          subtitle="Popular Hindi series from top actors"
          contents={remainingData?.hindiStar?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&language=Hindi&min_rating=7"
        />

        <ContentRow
          title="Latest English Star Shows"
          subtitle="Featuring Bryan Cranston, Pedro Pascal, Henry Cavill & more"
          contents={remainingData?.englishStar?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&language=English&min_rating=7"
        />

        <ContentRow
          title="Latest Tamil Star Shows"
          subtitle="Popular Tamil series from top actors"
          contents={remainingData?.tamilStar?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&language=Tamil&min_rating=7"
        />

        <ContentRow
          title="Latest Telugu Star Shows"
          subtitle="Popular Telugu series from top actors"
          contents={remainingData?.teluguStar?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&language=Telugu&min_rating=7"
        />

        <ContentRow
          title="Latest Malayalam Star Shows"
          subtitle="Popular Malayalam series from top actors"
          contents={remainingData?.malayalamStar?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&language=Malayalam&min_rating=7"
        />

        <ContentRow
          title="Latest Kannada Star Shows"
          subtitle="Popular Kannada series from top actors"
          contents={remainingData?.kannadaStar?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&language=Kannada&min_rating=7"
        />

        <ContentRow
          title="Latest Bengali Star Shows"
          subtitle="Popular Bengali series from top actors"
          contents={remainingData?.bengaliStar?.items || []}
          isLoading={isLoadingRemaining}
          href="/browse?type=show&language=Bengali&min_rating=7"
        />

        {/* Top 10 */}
        <Top10Row
          title="Top 10 Shows This Week"
          contents={remainingData?.topRated?.items || []}
          isLoading={isLoadingRemaining}
        />
      </div>
    </div>
  );
}

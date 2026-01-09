'use client';

import { useQuery } from '@tanstack/react-query';
import { HeroCarousel, HeroCarouselSkeleton } from '@/components/sections/hero-carousel';
import { ContentRow, Top10Row } from '@/components/sections/content-row';
import api from '@/services/api';

export default function HomePage() {
  // Fetch featured content for hero
  const { data: featuredData, isLoading: featuredLoading } = useQuery({
    queryKey: ['featured'],
    queryFn: () => api.getContent({ min_rating: 8, sort: 'popularity', order: 'desc', limit: 5 }),
  });

  // Fetch top rated movies from last year (IMDb > 8, 50K+ votes, released in last 1 year)
  const { data: topRatedRecentData, isLoading: topRatedRecentLoading } = useQuery({
    queryKey: ['topRatedRecent'],
    queryFn: () => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const yearFrom = oneYearAgo.getFullYear();

      return api.getContent({
        min_rating: 8,
        min_votes: 50000,
        year_from: yearFrom,
        sort: 'rating',
        order: 'desc',
        limit: 15
      });
    },
  });

  // Fetch trending content
  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ['trending'],
    queryFn: () => api.getTrending(15),
  });

  // Fetch top rated for Top 10
  const { data: topRatedData, isLoading: topRatedLoading } = useQuery({
    queryKey: ['topRated'],
    queryFn: () => api.getTopRated(10),
  });

  // Fetch new releases
  const { data: newReleasesData, isLoading: newReleasesLoading } = useQuery({
    queryKey: ['newReleases'],
    queryFn: () => api.getNewReleases(15),
  });

  // Fetch by genre - Action
  const { data: actionData, isLoading: actionLoading } = useQuery({
    queryKey: ['genre', 'Action'],
    queryFn: () => api.getByGenre('Action', 15),
  });

  // Fetch by genre - Comedy
  const { data: comedyData, isLoading: comedyLoading } = useQuery({
    queryKey: ['genre', 'Comedy'],
    queryFn: () => api.getByGenre('Comedy', 15),
  });

  // Fetch by genre - Drama
  const { data: dramaData, isLoading: dramaLoading } = useQuery({
    queryKey: ['genre', 'Drama'],
    queryFn: () => api.getByGenre('Drama', 15),
  });

  // Fetch by genre - Thriller
  const { data: thrillerData, isLoading: thrillerLoading } = useQuery({
    queryKey: ['genre', 'Thriller'],
    queryFn: () => api.getByGenre('Thriller', 15),
  });

  // Fetch Hindi content
  const { data: hindiData, isLoading: hindiLoading } = useQuery({
    queryKey: ['language', 'Hindi'],
    queryFn: () => api.getByLanguage('Hindi', 15),
  });

  // Fetch Tamil content
  const { data: tamilData, isLoading: tamilLoading } = useQuery({
    queryKey: ['language', 'Tamil'],
    queryFn: () => api.getByLanguage('Tamil', 15),
  });

  // Fetch Telugu content
  const { data: teluguData, isLoading: teluguLoading } = useQuery({
    queryKey: ['language', 'Telugu'],
    queryFn: () => api.getByLanguage('Telugu', 15),
  });

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Carousel */}
      {featuredLoading ? (
        <HeroCarouselSkeleton />
      ) : (
        <HeroCarousel items={featuredData?.items || []} />
      )}

      {/* Content Sections */}
      <div className="-mt-20 relative z-10 space-y-8 pl-12 lg:pl-16">
        {/* Top Rated Movies (IMDb > 8, Last Year) */}
        <ContentRow
          title="Top Rated Movies"
          contents={topRatedRecentData?.items || []}
          isLoading={topRatedRecentLoading}
          href="/browse?min_rating=8&sort=rating"
        />

        {/* Trending Now */}
        <ContentRow
          title="Trending Now"
          contents={trendingData?.items || []}
          isLoading={trendingLoading}
          href="/browse?sort=popularity"
        />

        {/* Top 10 */}
        <Top10Row
          title="Top 10 This Week"
          contents={topRatedData?.items || []}
          isLoading={topRatedLoading}
        />

        {/* New Releases */}
        <ContentRow
          title="New Releases"
          contents={newReleasesData?.items || []}
          isLoading={newReleasesLoading}
          href="/browse?sort=release_date"
        />

        {/* Action Movies */}
        <ContentRow
          title="Action & Adventure"
          contents={actionData?.items || []}
          isLoading={actionLoading}
          href="/browse?genre=Action"
        />

        {/* Hindi Content */}
        <ContentRow
          title="Hindi Movies & Shows"
          contents={hindiData?.items || []}
          isLoading={hindiLoading}
          href="/browse?language=Hindi"
        />

        {/* Comedy */}
        <ContentRow
          title="Comedy"
          contents={comedyData?.items || []}
          isLoading={comedyLoading}
          href="/browse?genre=Comedy"
        />

        {/* Tamil Content */}
        <ContentRow
          title="Tamil Cinema"
          contents={tamilData?.items || []}
          isLoading={tamilLoading}
          href="/browse?language=Tamil"
        />

        {/* Drama */}
        <ContentRow
          title="Drama"
          contents={dramaData?.items || []}
          isLoading={dramaLoading}
          href="/browse?genre=Drama"
        />

        {/* Telugu Content */}
        <ContentRow
          title="Telugu Movies"
          contents={teluguData?.items || []}
          isLoading={teluguLoading}
          href="/browse?language=Telugu"
        />

        {/* Thriller */}
        <ContentRow
          title="Thriller & Suspense"
          contents={thrillerData?.items || []}
          isLoading={thrillerLoading}
          href="/browse?genre=Thriller"
        />
      </div>
    </div>
  );
}

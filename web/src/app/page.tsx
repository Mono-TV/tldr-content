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

  // Fetch top rated movies from last 5 years (IMDb > 8, 50K+ votes, movies only, released in last 5 years)
  const { data: topRatedRecentData, isLoading: topRatedRecentLoading } = useQuery({
    queryKey: ['topRatedRecent'],
    queryFn: () => {
      const fiveYearsAgo = new Date();
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
      const yearFrom = fiveYearsAgo.getFullYear();

      return api.getContent({
        min_rating: 8,
        min_votes: 50000,
        type: 'movie',
        year_from: yearFrom,
        sort: 'rating',
        order: 'desc',
        limit: 15
      });
    },
  });

  // Helper for language-specific top rated movies
  const tenYearsAgo = new Date().getFullYear() - 10;
  const fifteenYearsAgo = new Date().getFullYear() - 15;

  // Fetch top rated English movies
  const { data: topRatedEnglishData, isLoading: topRatedEnglishLoading } = useQuery({
    queryKey: ['topRatedEnglish'],
    queryFn: () => api.getContent({
      min_rating: 8,
      min_votes: 50000,
      type: 'movie',
      original_language: 'en',
      year_from: tenYearsAgo,
      sort: 'rating',
      order: 'desc',
      limit: 15
    }),
  });

  // Fetch top rated Hindi movies
  const { data: topRatedHindiData, isLoading: topRatedHindiLoading } = useQuery({
    queryKey: ['topRatedHindi'],
    queryFn: () => api.getContent({
      min_rating: 8,
      min_votes: 50000,
      type: 'movie',
      original_language: 'hi',
      year_from: tenYearsAgo,
      sort: 'rating',
      order: 'desc',
      limit: 15
    }),
  });

  // Fetch top rated Bengali movies (lower threshold due to smaller industry)
  const { data: topRatedBengaliData, isLoading: topRatedBengaliLoading } = useQuery({
    queryKey: ['topRatedBengali'],
    queryFn: () => api.getContent({
      min_rating: 7.5,
      min_votes: 2000,
      type: 'movie',
      original_language: 'bn',
      year_from: fifteenYearsAgo,
      sort: 'rating',
      order: 'desc',
      limit: 15
    }),
  });

  // Fetch top rated Tamil movies
  const { data: topRatedTamilData, isLoading: topRatedTamilLoading } = useQuery({
    queryKey: ['topRatedTamil'],
    queryFn: () => api.getContent({
      min_rating: 8,
      min_votes: 15000,
      type: 'movie',
      original_language: 'ta',
      year_from: tenYearsAgo,
      sort: 'rating',
      order: 'desc',
      limit: 15
    }),
  });

  // Fetch top rated Telugu movies
  const { data: topRatedTeluguData, isLoading: topRatedTeluguLoading } = useQuery({
    queryKey: ['topRatedTelugu'],
    queryFn: () => api.getContent({
      min_rating: 8,
      min_votes: 5000,
      type: 'movie',
      original_language: 'te',
      year_from: tenYearsAgo,
      sort: 'rating',
      order: 'desc',
      limit: 15
    }),
  });

  // Fetch top rated Malayalam movies
  const { data: topRatedMalayalamData, isLoading: topRatedMalayalamLoading } = useQuery({
    queryKey: ['topRatedMalayalam'],
    queryFn: () => api.getContent({
      min_rating: 8,
      min_votes: 5000,
      type: 'movie',
      original_language: 'ml',
      year_from: tenYearsAgo,
      sort: 'rating',
      order: 'desc',
      limit: 15
    }),
  });

  // Fetch top rated Kannada movies (extended year range for more results)
  const { data: topRatedKannadaData, isLoading: topRatedKannadaLoading } = useQuery({
    queryKey: ['topRatedKannada'],
    queryFn: () => api.getContent({
      min_rating: 8,
      min_votes: 5000,
      type: 'movie',
      original_language: 'kn',
      year_from: fifteenYearsAgo,
      sort: 'rating',
      order: 'desc',
      limit: 15
    }),
  });

  // Fetch top rated for Top 10
  const { data: topRatedData, isLoading: topRatedLoading } = useQuery({
    queryKey: ['topRated'],
    queryFn: () => api.getTopRated(10),
  });

  // Latest Star Movies rows - featuring active stars from last 5 years
  const fiveYearsAgoYear = new Date().getFullYear() - 5;

  // Latest Hindi Star Movies (Rajkummar Rao - 20 recent movies)
  const { data: hindiStarData, isLoading: hindiStarLoading } = useQuery({
    queryKey: ['hindiStarMovies'],
    queryFn: () => api.searchWithFilters('Rajkummar Rao', {
      type: 'movie',
      year_from: fiveYearsAgoYear,
      sort: 'rating',
      order: 'desc',
      limit: 15
    }),
  });

  // Latest Tamil Star Movies (Dhanush - 33 recent movies)
  const { data: tamilStarData, isLoading: tamilStarLoading } = useQuery({
    queryKey: ['tamilStarMovies'],
    queryFn: () => api.searchWithFilters('Dhanush', {
      type: 'movie',
      year_from: fiveYearsAgoYear,
      sort: 'rating',
      order: 'desc',
      limit: 15
    }),
  });

  // Latest Telugu Star Movies (Ravi Teja - 32 recent movies)
  const { data: teluguStarData, isLoading: teluguStarLoading } = useQuery({
    queryKey: ['teluguStarMovies'],
    queryFn: () => api.searchWithFilters('Ravi Teja', {
      type: 'movie',
      year_from: fiveYearsAgoYear,
      sort: 'rating',
      order: 'desc',
      limit: 15
    }),
  });

  // Latest Malayalam Star Movies (Mohanlal - 28 recent movies)
  const { data: malayalamStarData, isLoading: malayalamStarLoading } = useQuery({
    queryKey: ['malayalamStarMovies'],
    queryFn: () => api.searchWithFilters('Mohanlal', {
      type: 'movie',
      year_from: fiveYearsAgoYear,
      sort: 'rating',
      order: 'desc',
      limit: 15
    }),
  });

  // Latest Kannada Star Movies (Sudeep - 24 recent movies)
  const { data: kannadaStarData, isLoading: kannadaStarLoading } = useQuery({
    queryKey: ['kannadaStarMovies'],
    queryFn: () => api.searchWithFilters('Sudeep', {
      type: 'movie',
      year_from: fiveYearsAgoYear,
      sort: 'rating',
      order: 'desc',
      limit: 15
    }),
  });

  // Latest Bengali Star Movies (Jisshu Sengupta - 31 recent movies)
  const { data: bengaliStarData, isLoading: bengaliStarLoading } = useQuery({
    queryKey: ['bengaliStarMovies'],
    queryFn: () => api.searchWithFilters('Jisshu Sengupta', {
      type: 'movie',
      year_from: fiveYearsAgoYear,
      sort: 'rating',
      order: 'desc',
      limit: 15
    }),
  });

  // Latest English Star Movies (Dwayne Johnson - 12 recent movies)
  const { data: englishStarData, isLoading: englishStarLoading } = useQuery({
    queryKey: ['englishStarMovies'],
    queryFn: () => api.searchWithFilters('Dwayne Johnson', {
      type: 'movie',
      year_from: fiveYearsAgoYear,
      sort: 'rating',
      order: 'desc',
      limit: 15
    }),
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
        {/* Top Rated Movies (IMDb > 8, Last 5 Years) */}
        <ContentRow
          title="Top Rated Movies"
          contents={topRatedRecentData?.items || []}
          isLoading={topRatedRecentLoading}
          href="/browse?min_rating=8&sort=rating"
        />

        {/* Top Rated English Movies */}
        <ContentRow
          title="Top Rated English Movies"
          contents={topRatedEnglishData?.items || []}
          isLoading={topRatedEnglishLoading}
          href="/browse?language=English&min_rating=8&sort=rating"
        />

        {/* Top Rated Hindi Movies */}
        <ContentRow
          title="Top Rated Hindi Movies"
          contents={topRatedHindiData?.items || []}
          isLoading={topRatedHindiLoading}
          href="/browse?language=Hindi&min_rating=8&sort=rating"
        />

        {/* Top Rated Bengali Movies */}
        <ContentRow
          title="Top Rated Bengali Movies"
          contents={topRatedBengaliData?.items || []}
          isLoading={topRatedBengaliLoading}
          href="/browse?language=Bengali&min_rating=8&sort=rating"
        />

        {/* Top Rated Tamil Movies */}
        <ContentRow
          title="Top Rated Tamil Movies"
          contents={topRatedTamilData?.items || []}
          isLoading={topRatedTamilLoading}
          href="/browse?language=Tamil&min_rating=8&sort=rating"
        />

        {/* Top Rated Telugu Movies */}
        <ContentRow
          title="Top Rated Telugu Movies"
          contents={topRatedTeluguData?.items || []}
          isLoading={topRatedTeluguLoading}
          href="/browse?language=Telugu&min_rating=8&sort=rating"
        />

        {/* Top Rated Malayalam Movies */}
        <ContentRow
          title="Top Rated Malayalam Movies"
          contents={topRatedMalayalamData?.items || []}
          isLoading={topRatedMalayalamLoading}
          href="/browse?language=Malayalam&min_rating=8&sort=rating"
        />

        {/* Top Rated Kannada Movies */}
        <ContentRow
          title="Top Rated Kannada Movies"
          contents={topRatedKannadaData?.items || []}
          isLoading={topRatedKannadaLoading}
          href="/browse?language=Kannada&min_rating=8&sort=rating"
        />

        {/* Latest Star Movies Rows */}
        <ContentRow
          title="Latest Hindi Star Movies"
          subtitle="Featuring Rajkummar Rao"
          contents={hindiStarData?.items || []}
          isLoading={hindiStarLoading}
          href="/search?q=Rajkummar+Rao"
        />

        <ContentRow
          title="Latest English Star Movies"
          subtitle="Featuring Dwayne Johnson"
          contents={englishStarData?.items || []}
          isLoading={englishStarLoading}
          href="/search?q=Dwayne+Johnson"
        />

        <ContentRow
          title="Latest Tamil Star Movies"
          subtitle="Featuring Dhanush"
          contents={tamilStarData?.items || []}
          isLoading={tamilStarLoading}
          href="/search?q=Dhanush"
        />

        <ContentRow
          title="Latest Telugu Star Movies"
          subtitle="Featuring Ravi Teja"
          contents={teluguStarData?.items || []}
          isLoading={teluguStarLoading}
          href="/search?q=Ravi+Teja"
        />

        <ContentRow
          title="Latest Malayalam Star Movies"
          subtitle="Featuring Mohanlal"
          contents={malayalamStarData?.items || []}
          isLoading={malayalamStarLoading}
          href="/search?q=Mohanlal"
        />

        <ContentRow
          title="Latest Kannada Star Movies"
          subtitle="Featuring Sudeep"
          contents={kannadaStarData?.items || []}
          isLoading={kannadaStarLoading}
          href="/search?q=Sudeep"
        />

        <ContentRow
          title="Latest Bengali Star Movies"
          subtitle="Featuring Jisshu Sengupta"
          contents={bengaliStarData?.items || []}
          isLoading={bengaliStarLoading}
          href="/search?q=Jisshu+Sengupta"
        />

        {/* Top 10 */}
        <Top10Row
          title="Top 10 This Week"
          contents={topRatedData?.items || []}
          isLoading={topRatedLoading}
        />
      </div>
    </div>
  );
}

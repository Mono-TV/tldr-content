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
  const twentyYearsAgo = new Date().getFullYear() - 20;
  const twentyFiveYearsAgo = new Date().getFullYear() - 25;

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

  // Top Action Movies rows - genre-specific filtering
  // Fetch top action movies (general, last 10 years)
  const { data: topActionData, isLoading: topActionLoading } = useQuery({
    queryKey: ['topAction'],
    queryFn: () => api.getContent({
      min_rating: 8,
      min_votes: 50000,
      type: 'movie',
      genre: 'Action',
      year_from: tenYearsAgo,
      sort: 'rating',
      order: 'desc',
      limit: 15
    }),
  });

  // Fetch top English action movies (lowered rating to 7.5 for more results)
  const { data: topActionEnglishData, isLoading: topActionEnglishLoading } = useQuery({
    queryKey: ['topActionEnglish'],
    queryFn: () => api.getContent({
      min_rating: 7.5,
      min_votes: 50000,
      type: 'movie',
      genre: 'Action',
      original_language: 'en',
      year_from: tenYearsAgo,
      sort: 'rating',
      order: 'desc',
      limit: 15
    }),
  });

  // Fetch top Hindi action movies (7.5+, 10k votes, 15 years for more results)
  const { data: topActionHindiData, isLoading: topActionHindiLoading } = useQuery({
    queryKey: ['topActionHindi'],
    queryFn: () => api.getContent({
      min_rating: 7.5,
      min_votes: 10000,
      type: 'movie',
      genre: 'Action',
      original_language: 'hi',
      year_from: fifteenYearsAgo,
      sort: 'rating',
      order: 'desc',
      limit: 15
    }),
  });

  // Fetch top Tamil action movies (lower threshold - 15k votes)
  const { data: topActionTamilData, isLoading: topActionTamilLoading } = useQuery({
    queryKey: ['topActionTamil'],
    queryFn: () => api.getContent({
      min_rating: 8,
      min_votes: 15000,
      type: 'movie',
      genre: 'Action',
      original_language: 'ta',
      year_from: tenYearsAgo,
      sort: 'rating',
      order: 'desc',
      limit: 15
    }),
  });

  // Fetch top Telugu action movies (7.5+, 2k votes, 15 years for more results)
  const { data: topActionTeluguData, isLoading: topActionTeluguLoading } = useQuery({
    queryKey: ['topActionTelugu'],
    queryFn: () => api.getContent({
      min_rating: 7.5,
      min_votes: 2000,
      type: 'movie',
      genre: 'Action',
      original_language: 'te',
      year_from: fifteenYearsAgo,
      sort: 'rating',
      order: 'desc',
      limit: 15
    }),
  });

  // Fetch top Malayalam action movies (7.0+, 2k votes, 15 years for more results)
  const { data: topActionMalayalamData, isLoading: topActionMalayalamLoading } = useQuery({
    queryKey: ['topActionMalayalam'],
    queryFn: () => api.getContent({
      min_rating: 7.0,
      min_votes: 2000,
      type: 'movie',
      genre: 'Action',
      original_language: 'ml',
      year_from: fifteenYearsAgo,
      sort: 'rating',
      order: 'desc',
      limit: 15
    }),
  });

  // Fetch top Kannada action movies (7.0+, 1k votes, 20 years for more results)
  const { data: topActionKannadaData, isLoading: topActionKannadaLoading } = useQuery({
    queryKey: ['topActionKannada'],
    queryFn: () => api.getContent({
      min_rating: 7.0,
      min_votes: 1000,
      type: 'movie',
      genre: 'Action',
      original_language: 'kn',
      year_from: twentyYearsAgo,
      sort: 'rating',
      order: 'desc',
      limit: 15
    }),
  });

  // Fetch top Bengali action movies (6.5+, 500 votes, 25 years for more results)
  const { data: topActionBengaliData, isLoading: topActionBengaliLoading } = useQuery({
    queryKey: ['topActionBengali'],
    queryFn: () => api.getContent({
      min_rating: 6.5,
      min_votes: 500,
      type: 'movie',
      genre: 'Action',
      original_language: 'bn',
      year_from: twentyFiveYearsAgo,
      sort: 'rating',
      order: 'desc',
      limit: 15
    }),
  });

  // Latest Star Movies rows - featuring multiple active stars from last 5 years
  const fiveYearsAgoYear = new Date().getFullYear() - 5;

  // Helper function to fetch and merge movies from multiple stars
  const fetchMultipleStarMovies = async (stars: string[]) => {
    const results = await Promise.all(
      stars.map(star =>
        api.searchWithFilters(star, {
          type: 'movie',
          year_from: fiveYearsAgoYear,
          sort: 'rating',
          order: 'desc',
          limit: 8
        })
      )
    );

    // Merge and deduplicate by imdb_id
    const allMovies = results.flatMap(r => r.items || []);
    const uniqueMovies = Array.from(
      new Map(allMovies.map(movie => [movie.imdb_id, movie])).values()
    );

    // Sort by rating and take top 15
    const sortedMovies = uniqueMovies.sort((a, b) => {
      const ratingA = a.imdb_rating ?? 0;
      const ratingB = b.imdb_rating ?? 0;
      const votesA = a.imdb_rating_count ?? 0;
      const votesB = b.imdb_rating_count ?? 0;

      if (ratingB !== ratingA) return ratingB - ratingA;
      if (votesB !== votesA) return votesB - votesA;

      const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
      const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
      return dateB - dateA;
    });

    return { items: sortedMovies.slice(0, 15), total: sortedMovies.length };
  };

  // Latest Hindi Star Movies (multiple stars)
  const { data: hindiStarData, isLoading: hindiStarLoading } = useQuery({
    queryKey: ['hindiStarMovies'],
    queryFn: () => fetchMultipleStarMovies(['Rajkummar Rao', 'Varun Dhawan', 'Vicky Kaushal', 'Kartik Aaryan']),
  });

  // Latest Tamil Star Movies (multiple stars)
  const { data: tamilStarData, isLoading: tamilStarLoading } = useQuery({
    queryKey: ['tamilStarMovies'],
    queryFn: () => fetchMultipleStarMovies(['Dhanush', 'Ajith Kumar', 'Sivakarthikeyan', 'Rajinikanth']),
  });

  // Latest Telugu Star Movies (multiple stars)
  const { data: teluguStarData, isLoading: teluguStarLoading } = useQuery({
    queryKey: ['teluguStarMovies'],
    queryFn: () => fetchMultipleStarMovies(['Ravi Teja', 'Mahesh Babu', 'Vijay Deverakonda', 'Ram Charan']),
  });

  // Latest Malayalam Star Movies (multiple stars)
  const { data: malayalamStarData, isLoading: malayalamStarLoading } = useQuery({
    queryKey: ['malayalamStarMovies'],
    queryFn: () => fetchMultipleStarMovies(['Mohanlal', 'Mammootty', 'Fahadh Faasil', 'Tovino Thomas']),
  });

  // Latest Kannada Star Movies (multiple stars)
  const { data: kannadaStarData, isLoading: kannadaStarLoading } = useQuery({
    queryKey: ['kannadaStarMovies'],
    queryFn: () => fetchMultipleStarMovies(['Sudeep', 'Shiva Rajkumar', 'Rishab Shetty', 'Upendra']),
  });

  // Latest Bengali Star Movies (multiple stars)
  const { data: bengaliStarData, isLoading: bengaliStarLoading } = useQuery({
    queryKey: ['bengaliStarMovies'],
    queryFn: () => fetchMultipleStarMovies(['Jisshu Sengupta', 'Prosenjit Chatterjee', 'Abir Chatterjee']),
  });

  // Latest English Star Movies (multiple stars)
  const { data: englishStarData, isLoading: englishStarLoading } = useQuery({
    queryKey: ['englishStarMovies'],
    queryFn: () => fetchMultipleStarMovies(['Dwayne Johnson', 'Chris Hemsworth', 'Tom Cruise', 'Brad Pitt']),
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

        {/* Top Action Movies Rows */}
        <ContentRow
          title="Top Action Movies"
          contents={topActionData?.items || []}
          isLoading={topActionLoading}
          href="/browse?genre=Action&min_rating=8&sort=rating"
        />

        <ContentRow
          title="Top English Action Movies"
          contents={topActionEnglishData?.items || []}
          isLoading={topActionEnglishLoading}
          href="/browse?language=English&genre=Action&min_rating=7.5&sort=rating"
        />

        <ContentRow
          title="Top Hindi Action Movies"
          contents={topActionHindiData?.items || []}
          isLoading={topActionHindiLoading}
          href="/browse?language=Hindi&genre=Action&min_rating=7.5&sort=rating"
        />

        <ContentRow
          title="Top Tamil Action Movies"
          contents={topActionTamilData?.items || []}
          isLoading={topActionTamilLoading}
          href="/browse?language=Tamil&genre=Action&min_rating=8&sort=rating"
        />

        <ContentRow
          title="Top Telugu Action Movies"
          contents={topActionTeluguData?.items || []}
          isLoading={topActionTeluguLoading}
          href="/browse?language=Telugu&genre=Action&min_rating=7.5&sort=rating"
        />

        <ContentRow
          title="Top Malayalam Action Movies"
          contents={topActionMalayalamData?.items || []}
          isLoading={topActionMalayalamLoading}
          href="/browse?language=Malayalam&genre=Action&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Kannada Action Movies"
          contents={topActionKannadaData?.items || []}
          isLoading={topActionKannadaLoading}
          href="/browse?language=Kannada&genre=Action&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Bengali Action Movies"
          contents={topActionBengaliData?.items || []}
          isLoading={topActionBengaliLoading}
          href="/browse?language=Bengali&genre=Action&min_rating=6.5&sort=rating"
        />

        {/* Latest Star Movies Rows */}
        <ContentRow
          title="Latest Hindi Star Movies"
          subtitle="Featuring Rajkummar Rao, Varun Dhawan, Vicky Kaushal & more"
          contents={hindiStarData?.items || []}
          isLoading={hindiStarLoading}
          href="/browse?language=Hindi&min_rating=7"
        />

        <ContentRow
          title="Latest English Star Movies"
          subtitle="Featuring Dwayne Johnson, Chris Hemsworth, Tom Cruise & more"
          contents={englishStarData?.items || []}
          isLoading={englishStarLoading}
          href="/browse?language=English&min_rating=7"
        />

        <ContentRow
          title="Latest Tamil Star Movies"
          subtitle="Featuring Dhanush, Ajith Kumar, Sivakarthikeyan & more"
          contents={tamilStarData?.items || []}
          isLoading={tamilStarLoading}
          href="/browse?language=Tamil&min_rating=7"
        />

        <ContentRow
          title="Latest Telugu Star Movies"
          subtitle="Featuring Ravi Teja, Mahesh Babu, Vijay Deverakonda & more"
          contents={teluguStarData?.items || []}
          isLoading={teluguStarLoading}
          href="/browse?language=Telugu&min_rating=7"
        />

        <ContentRow
          title="Latest Malayalam Star Movies"
          subtitle="Featuring Mohanlal, Mammootty, Fahadh Faasil & more"
          contents={malayalamStarData?.items || []}
          isLoading={malayalamStarLoading}
          href="/browse?language=Malayalam&min_rating=7"
        />

        <ContentRow
          title="Latest Kannada Star Movies"
          subtitle="Featuring Sudeep, Shiva Rajkumar, Rishab Shetty & more"
          contents={kannadaStarData?.items || []}
          isLoading={kannadaStarLoading}
          href="/browse?language=Kannada&min_rating=7"
        />

        <ContentRow
          title="Latest Bengali Star Movies"
          subtitle="Featuring Jisshu Sengupta, Prosenjit Chatterjee & more"
          contents={bengaliStarData?.items || []}
          isLoading={bengaliStarLoading}
          href="/browse?language=Bengali&min_rating=7"
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

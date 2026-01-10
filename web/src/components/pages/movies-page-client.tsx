'use client';

import { HeroCarousel } from '@/components/sections/hero-carousel';
import { ContentRow, Top10Row } from '@/components/sections/content-row';
import type { MoviesData } from '@/lib/fetch-movies-data';

interface MoviesPageClientProps {
  data: MoviesData;
}

/**
 * Client-side movies page component
 * Receives pre-fetched data from server component
 * All data is pre-rendered at build time via ISR
 */
export function MoviesPageClient({ data }: MoviesPageClientProps) {
  // Debug: Log what data the client receives
  console.log('[Client] Movies page data received:', {
    featured: data.featured?.items?.length || 0,
    topRatedRecent: data.topRatedRecent?.items?.length || 0,
    topRatedEnglish: data.topRatedEnglish?.items?.length || 0,
    topAction: data.topAction?.items?.length || 0,
    dataKeys: Object.keys(data).length
  });

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Carousel */}
      <HeroCarousel items={data.featured.items || []} />

      {/* Content Sections */}
      <div className="-mt-20 relative z-10 space-y-8 pl-12 lg:pl-16">
        {/* Top Rated Movies (IMDb > 7.5, Last 5 Years) */}
        <ContentRow
          title="Top Rated Movies"
          contents={data.topRatedRecent.items || []}
          href="/browse?type=show&min_rating=7.5&sort=rating"
        />

        {/* Top Rated English Movies */}
        <ContentRow
          title="Top Rated English Movies"
          contents={data.topRatedEnglish.items || []}
          href="/browse?type=show&language=English&min_rating=7.5&sort=rating"
        />

        {/* Top Rated Hindi Movies */}
        <ContentRow
          title="Top Rated Hindi Movies"
          contents={data.topRatedHindi.items || []}
          href="/browse?type=show&language=Hindi&min_rating=7.5&sort=rating"
        />

        {/* Top Rated Bengali Movies */}
        <ContentRow
          title="Top Rated Bengali Movies"
          contents={data.topRatedBengali.items || []}
          href="/browse?type=show&language=Bengali&min_rating=7&sort=rating"
        />

        {/* Top Rated Tamil Movies */}
        <ContentRow
          title="Top Rated Tamil Movies"
          contents={data.topRatedTamil.items || []}
          href="/browse?type=show&language=Tamil&min_rating=7.5&sort=rating"
        />

        {/* Top Rated Telugu Movies */}
        <ContentRow
          title="Top Rated Telugu Movies"
          contents={data.topRatedTelugu.items || []}
          href="/browse?type=show&language=Telugu&min_rating=7.5&sort=rating"
        />

        {/* Top Rated Malayalam Movies */}
        <ContentRow
          title="Top Rated Malayalam Movies"
          contents={data.topRatedMalayalam.items || []}
          href="/browse?type=show&language=Malayalam&min_rating=7.5&sort=rating"
        />

        {/* Top Rated Kannada Movies */}
        <ContentRow
          title="Top Rated Kannada Movies"
          contents={data.topRatedKannada.items || []}
          href="/browse?type=show&language=Kannada&min_rating=7.5&sort=rating"
        />

        {/* Top Action Movies Rows */}
        <ContentRow
          title="Top Action Movies"
          contents={data.topAction.items || []}
          href="/browse?type=show&genre=Action&min_rating=7.5&sort=rating"
        />

        <ContentRow
          title="Top English Action Movies"
          contents={data.topActionEnglish.items || []}
          href="/browse?type=show&language=English&genre=Action&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Hindi Action Movies"
          contents={data.topActionHindi.items || []}
          href="/browse?type=show&language=Hindi&genre=Action&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Tamil Action Movies"
          contents={data.topActionTamil.items || []}
          href="/browse?type=show&language=Tamil&genre=Action&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Telugu Action Movies"
          contents={data.topActionTelugu.items || []}
          href="/browse?type=show&language=Telugu&genre=Action&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Malayalam Action Movies"
          contents={data.topActionMalayalam.items || []}
          href="/browse?type=show&language=Malayalam&genre=Action&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Kannada Action Movies"
          contents={data.topActionKannada.items || []}
          href="/browse?type=show&language=Kannada&genre=Action&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Bengali Action Movies"
          contents={data.topActionBengali.items || []}
          href="/browse?type=show&language=Bengali&genre=Action&min_rating=6&sort=rating"
        />

        {/* Top Comedy Movies Rows */}
        <ContentRow
          title="Top Comedy Movies"
          contents={data.topComedy.items || []}
          href="/browse?type=show&genre=Comedy&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top English Comedy Movies"
          contents={data.topComedyEnglish.items || []}
          href="/browse?type=show&language=English&genre=Comedy&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Hindi Comedy Movies"
          contents={data.topComedyHindi.items || []}
          href="/browse?type=show&language=Hindi&genre=Comedy&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Tamil Comedy Movies"
          contents={data.topComedyTamil.items || []}
          href="/browse?type=show&language=Tamil&genre=Comedy&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Telugu Comedy Movies"
          contents={data.topComedyTelugu.items || []}
          href="/browse?type=show&language=Telugu&genre=Comedy&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Malayalam Comedy Movies"
          contents={data.topComedyMalayalam.items || []}
          href="/browse?type=show&language=Malayalam&genre=Comedy&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Kannada Comedy Movies"
          contents={data.topComedyKannada.items || []}
          href="/browse?type=show&language=Kannada&genre=Comedy&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Bengali Comedy Movies"
          contents={data.topComedyBengali.items || []}
          href="/browse?type=show&language=Bengali&genre=Comedy&min_rating=6&sort=rating"
        />

        {/* Top Drama Movies Rows */}
        <ContentRow
          title="Top Drama Movies"
          contents={data.topDrama.items || []}
          href="/browse?type=show&genre=Drama&min_rating=7.5&sort=rating"
        />

        <ContentRow
          title="Top English Drama Movies"
          contents={data.topDramaEnglish.items || []}
          href="/browse?type=show&language=English&genre=Drama&min_rating=7.5&sort=rating"
        />

        <ContentRow
          title="Top Hindi Drama Movies"
          contents={data.topDramaHindi.items || []}
          href="/browse?type=show&language=Hindi&genre=Drama&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Tamil Drama Movies"
          contents={data.topDramaTamil.items || []}
          href="/browse?type=show&language=Tamil&genre=Drama&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Telugu Drama Movies"
          contents={data.topDramaTelugu.items || []}
          href="/browse?type=show&language=Telugu&genre=Drama&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Malayalam Drama Movies"
          contents={data.topDramaMalayalam.items || []}
          href="/browse?type=show&language=Malayalam&genre=Drama&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Kannada Drama Movies"
          contents={data.topDramaKannada.items || []}
          href="/browse?type=show&language=Kannada&genre=Drama&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Bengali Drama Movies"
          contents={data.topDramaBengali.items || []}
          href="/browse?type=show&language=Bengali&genre=Drama&min_rating=6&sort=rating"
        />

        {/* Top Thriller Movies Rows */}
        <ContentRow
          title="Top Thriller Movies"
          contents={data.topThriller.items || []}
          href="/browse?type=show&genre=Thriller&min_rating=7.5&sort=rating"
        />

        <ContentRow
          title="Top English Thriller Movies"
          contents={data.topThrillerEnglish.items || []}
          href="/browse?type=show&language=English&genre=Thriller&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Hindi Thriller Movies"
          contents={data.topThrillerHindi.items || []}
          href="/browse?type=show&language=Hindi&genre=Thriller&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Tamil Thriller Movies"
          contents={data.topThrillerTamil.items || []}
          href="/browse?type=show&language=Tamil&genre=Thriller&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Telugu Thriller Movies"
          contents={data.topThrillerTelugu.items || []}
          href="/browse?type=show&language=Telugu&genre=Thriller&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Malayalam Thriller Movies"
          contents={data.topThrillerMalayalam.items || []}
          href="/browse?type=show&language=Malayalam&genre=Thriller&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Kannada Thriller Movies"
          contents={data.topThrillerKannada.items || []}
          href="/browse?type=show&language=Kannada&genre=Thriller&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Bengali Thriller Movies"
          contents={data.topThrillerBengali.items || []}
          href="/browse?type=show&language=Bengali&genre=Thriller&min_rating=6&sort=rating"
        />

        {/* Latest Star Movies Rows */}
        <ContentRow
          title="Latest Hindi Star Movies"
          subtitle="Popular Hindi series from top actors"
          contents={data.hindiStar.items || []}
          href="/browse?type=show&language=Hindi&min_rating=7"
        />

        <ContentRow
          title="Latest English Star Movies"
          subtitle="Featuring Bryan Cranston, Pedro Pascal, Henry Cavill & more"
          contents={data.englishStar.items || []}
          href="/browse?type=show&language=English&min_rating=7"
        />

        <ContentRow
          title="Latest Tamil Star Movies"
          subtitle="Popular Tamil series from top actors"
          contents={data.tamilStar.items || []}
          href="/browse?type=show&language=Tamil&min_rating=7"
        />

        <ContentRow
          title="Latest Telugu Star Movies"
          subtitle="Popular Telugu series from top actors"
          contents={data.teluguStar.items || []}
          href="/browse?type=show&language=Telugu&min_rating=7"
        />

        <ContentRow
          title="Latest Malayalam Star Movies"
          subtitle="Popular Malayalam series from top actors"
          contents={data.malayalamStar.items || []}
          href="/browse?type=show&language=Malayalam&min_rating=7"
        />

        <ContentRow
          title="Latest Kannada Star Movies"
          subtitle="Popular Kannada series from top actors"
          contents={data.kannadaStar.items || []}
          href="/browse?type=show&language=Kannada&min_rating=7"
        />

        <ContentRow
          title="Latest Bengali Star Movies"
          subtitle="Popular Bengali series from top actors"
          contents={data.bengaliStar.items || []}
          href="/browse?type=show&language=Bengali&min_rating=7"
        />

        {/* Top 10 */}
        <Top10Row
          title="Top 10 Movies This Week"
          contents={data.topRated.items || []}
        />
      </div>
    </div>
  );
}

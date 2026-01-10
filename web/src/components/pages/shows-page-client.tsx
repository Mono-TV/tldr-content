'use client';

import { HeroCarousel } from '@/components/sections/hero-carousel';
import { ContentRow, Top10Row } from '@/components/sections/content-row';
import type { ShowsData } from '@/lib/fetch-shows-data';

interface ShowsPageClientProps {
  data: ShowsData;
}

/**
 * Client-side shows page component
 * Receives pre-fetched data from server component
 * All data is pre-rendered at build time via ISR
 */
export function ShowsPageClient({ data }: ShowsPageClientProps) {
  return (
    <div className="min-h-screen pb-20">
      {/* Hero Carousel */}
      <HeroCarousel items={data.featured.items || []} />

      {/* Content Sections */}
      <div className="-mt-20 relative z-10 space-y-8 pl-12 lg:pl-16">
        {/* Top Rated Shows (IMDb > 7.5, Last 5 Years) */}
        <ContentRow
          title="Top Rated Shows"
          contents={data.topRatedRecent.items || []}
          href="/browse?type=show&min_rating=7.5&sort=rating"
        />

        {/* Top Rated English Shows */}
        <ContentRow
          title="Top Rated English Shows"
          contents={data.topRatedEnglish.items || []}
          href="/browse?type=show&language=English&min_rating=7.5&sort=rating"
        />

        {/* Top Rated Hindi Shows */}
        <ContentRow
          title="Top Rated Hindi Shows"
          contents={data.topRatedHindi.items || []}
          href="/browse?type=show&language=Hindi&min_rating=7.5&sort=rating"
        />

        {/* Top Rated Bengali Shows */}
        <ContentRow
          title="Top Rated Bengali Shows"
          contents={data.topRatedBengali.items || []}
          href="/browse?type=show&language=Bengali&min_rating=7&sort=rating"
        />

        {/* Top Rated Tamil Shows */}
        <ContentRow
          title="Top Rated Tamil Shows"
          contents={data.topRatedTamil.items || []}
          href="/browse?type=show&language=Tamil&min_rating=7.5&sort=rating"
        />

        {/* Top Rated Telugu Shows */}
        <ContentRow
          title="Top Rated Telugu Shows"
          contents={data.topRatedTelugu.items || []}
          href="/browse?type=show&language=Telugu&min_rating=7.5&sort=rating"
        />

        {/* Top Rated Malayalam Shows */}
        <ContentRow
          title="Top Rated Malayalam Shows"
          contents={data.topRatedMalayalam.items || []}
          href="/browse?type=show&language=Malayalam&min_rating=7.5&sort=rating"
        />

        {/* Top Rated Kannada Shows */}
        <ContentRow
          title="Top Rated Kannada Shows"
          contents={data.topRatedKannada.items || []}
          href="/browse?type=show&language=Kannada&min_rating=7.5&sort=rating"
        />

        {/* Top Action Shows Rows */}
        <ContentRow
          title="Top Action Shows"
          contents={data.topAction.items || []}
          href="/browse?type=show&genre=Action&min_rating=7.5&sort=rating"
        />

        <ContentRow
          title="Top English Action Shows"
          contents={data.topActionEnglish.items || []}
          href="/browse?type=show&language=English&genre=Action&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Hindi Action Shows"
          contents={data.topActionHindi.items || []}
          href="/browse?type=show&language=Hindi&genre=Action&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Tamil Action Shows"
          contents={data.topActionTamil.items || []}
          href="/browse?type=show&language=Tamil&genre=Action&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Telugu Action Shows"
          contents={data.topActionTelugu.items || []}
          href="/browse?type=show&language=Telugu&genre=Action&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Malayalam Action Shows"
          contents={data.topActionMalayalam.items || []}
          href="/browse?type=show&language=Malayalam&genre=Action&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Kannada Action Shows"
          contents={data.topActionKannada.items || []}
          href="/browse?type=show&language=Kannada&genre=Action&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Bengali Action Shows"
          contents={data.topActionBengali.items || []}
          href="/browse?type=show&language=Bengali&genre=Action&min_rating=6&sort=rating"
        />

        {/* Top Comedy Shows Rows */}
        <ContentRow
          title="Top Comedy Shows"
          contents={data.topComedy.items || []}
          href="/browse?type=show&genre=Comedy&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top English Comedy Shows"
          contents={data.topComedyEnglish.items || []}
          href="/browse?type=show&language=English&genre=Comedy&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Hindi Comedy Shows"
          contents={data.topComedyHindi.items || []}
          href="/browse?type=show&language=Hindi&genre=Comedy&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Tamil Comedy Shows"
          contents={data.topComedyTamil.items || []}
          href="/browse?type=show&language=Tamil&genre=Comedy&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Telugu Comedy Shows"
          contents={data.topComedyTelugu.items || []}
          href="/browse?type=show&language=Telugu&genre=Comedy&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Malayalam Comedy Shows"
          contents={data.topComedyMalayalam.items || []}
          href="/browse?type=show&language=Malayalam&genre=Comedy&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Kannada Comedy Shows"
          contents={data.topComedyKannada.items || []}
          href="/browse?type=show&language=Kannada&genre=Comedy&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Bengali Comedy Shows"
          contents={data.topComedyBengali.items || []}
          href="/browse?type=show&language=Bengali&genre=Comedy&min_rating=6&sort=rating"
        />

        {/* Top Drama Shows Rows */}
        <ContentRow
          title="Top Drama Shows"
          contents={data.topDrama.items || []}
          href="/browse?type=show&genre=Drama&min_rating=7.5&sort=rating"
        />

        <ContentRow
          title="Top English Drama Shows"
          contents={data.topDramaEnglish.items || []}
          href="/browse?type=show&language=English&genre=Drama&min_rating=7.5&sort=rating"
        />

        <ContentRow
          title="Top Hindi Drama Shows"
          contents={data.topDramaHindi.items || []}
          href="/browse?type=show&language=Hindi&genre=Drama&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Tamil Drama Shows"
          contents={data.topDramaTamil.items || []}
          href="/browse?type=show&language=Tamil&genre=Drama&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Telugu Drama Shows"
          contents={data.topDramaTelugu.items || []}
          href="/browse?type=show&language=Telugu&genre=Drama&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Malayalam Drama Shows"
          contents={data.topDramaMalayalam.items || []}
          href="/browse?type=show&language=Malayalam&genre=Drama&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Kannada Drama Shows"
          contents={data.topDramaKannada.items || []}
          href="/browse?type=show&language=Kannada&genre=Drama&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Bengali Drama Shows"
          contents={data.topDramaBengali.items || []}
          href="/browse?type=show&language=Bengali&genre=Drama&min_rating=6&sort=rating"
        />

        {/* Top Thriller Shows Rows */}
        <ContentRow
          title="Top Thriller Shows"
          contents={data.topThriller.items || []}
          href="/browse?type=show&genre=Thriller&min_rating=7.5&sort=rating"
        />

        <ContentRow
          title="Top English Thriller Shows"
          contents={data.topThrillerEnglish.items || []}
          href="/browse?type=show&language=English&genre=Thriller&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Hindi Thriller Shows"
          contents={data.topThrillerHindi.items || []}
          href="/browse?type=show&language=Hindi&genre=Thriller&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Tamil Thriller Shows"
          contents={data.topThrillerTamil.items || []}
          href="/browse?type=show&language=Tamil&genre=Thriller&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Telugu Thriller Shows"
          contents={data.topThrillerTelugu.items || []}
          href="/browse?type=show&language=Telugu&genre=Thriller&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Malayalam Thriller Shows"
          contents={data.topThrillerMalayalam.items || []}
          href="/browse?type=show&language=Malayalam&genre=Thriller&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Kannada Thriller Shows"
          contents={data.topThrillerKannada.items || []}
          href="/browse?type=show&language=Kannada&genre=Thriller&min_rating=6.5&sort=rating"
        />

        <ContentRow
          title="Top Bengali Thriller Shows"
          contents={data.topThrillerBengali.items || []}
          href="/browse?type=show&language=Bengali&genre=Thriller&min_rating=6&sort=rating"
        />

        {/* Latest Star Shows Rows */}
        <ContentRow
          title="Latest Hindi Star Shows"
          subtitle="Popular Hindi series from top actors"
          contents={data.hindiStar.items || []}
          href="/browse?type=show&language=Hindi&min_rating=7"
        />

        <ContentRow
          title="Latest English Star Shows"
          subtitle="Featuring Bryan Cranston, Pedro Pascal, Henry Cavill & more"
          contents={data.englishStar.items || []}
          href="/browse?type=show&language=English&min_rating=7"
        />

        <ContentRow
          title="Latest Tamil Star Shows"
          subtitle="Popular Tamil series from top actors"
          contents={data.tamilStar.items || []}
          href="/browse?type=show&language=Tamil&min_rating=7"
        />

        <ContentRow
          title="Latest Telugu Star Shows"
          subtitle="Popular Telugu series from top actors"
          contents={data.teluguStar.items || []}
          href="/browse?type=show&language=Telugu&min_rating=7"
        />

        <ContentRow
          title="Latest Malayalam Star Shows"
          subtitle="Popular Malayalam series from top actors"
          contents={data.malayalamStar.items || []}
          href="/browse?type=show&language=Malayalam&min_rating=7"
        />

        <ContentRow
          title="Latest Kannada Star Shows"
          subtitle="Popular Kannada series from top actors"
          contents={data.kannadaStar.items || []}
          href="/browse?type=show&language=Kannada&min_rating=7"
        />

        <ContentRow
          title="Latest Bengali Star Shows"
          subtitle="Popular Bengali series from top actors"
          contents={data.bengaliStar.items || []}
          href="/browse?type=show&language=Bengali&min_rating=7"
        />

        {/* Top 10 */}
        <Top10Row
          title="Top 10 Shows This Week"
          contents={data.topRated.items || []}
        />
      </div>
    </div>
  );
}

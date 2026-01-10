'use client';

import { useEffect, useState } from 'react';
import { HeroCarousel } from '@/components/sections/hero-carousel';
import { ContentRow, Top10Row } from '@/components/sections/content-row';
import type { ShowsData } from '@/lib/fetch-shows-data';

interface ShowsPageClientProps {
  initialData: Partial<ShowsData>;
}

/**
 * Client-side shows page component with progressive loading
 * - Receives first 10 rows from server (fast initial render)
 * - Lazy-loads remaining 38 rows after mount
 */
// Helper to create empty data structure
const createEmptyData = (): ShowsData => ({
  featured: { items: [], total: 0 },
  topRatedRecent: { items: [], total: 0 },
  topRatedEnglish: { items: [], total: 0 },
  topRatedHindi: { items: [], total: 0 },
  topRatedBengali: { items: [], total: 0 },
  topRatedTamil: { items: [], total: 0 },
  topRatedTelugu: { items: [], total: 0 },
  topRatedMalayalam: { items: [], total: 0 },
  topRatedKannada: { items: [], total: 0 },
  topAction: { items: [], total: 0 },
  topActionEnglish: { items: [], total: 0 },
  topActionHindi: { items: [], total: 0 },
  topActionTamil: { items: [], total: 0 },
  topActionTelugu: { items: [], total: 0 },
  topActionMalayalam: { items: [], total: 0 },
  topActionKannada: { items: [], total: 0 },
  topActionBengali: { items: [], total: 0 },
  topComedy: { items: [], total: 0 },
  topComedyEnglish: { items: [], total: 0 },
  topComedyHindi: { items: [], total: 0 },
  topComedyTamil: { items: [], total: 0 },
  topComedyTelugu: { items: [], total: 0 },
  topComedyMalayalam: { items: [], total: 0 },
  topComedyKannada: { items: [], total: 0 },
  topComedyBengali: { items: [], total: 0 },
  topDrama: { items: [], total: 0 },
  topDramaEnglish: { items: [], total: 0 },
  topDramaHindi: { items: [], total: 0 },
  topDramaTamil: { items: [], total: 0 },
  topDramaTelugu: { items: [], total: 0 },
  topDramaMalayalam: { items: [], total: 0 },
  topDramaKannada: { items: [], total: 0 },
  topDramaBengali: { items: [], total: 0 },
  topThriller: { items: [], total: 0 },
  topThrillerEnglish: { items: [], total: 0 },
  topThrillerHindi: { items: [], total: 0 },
  topThrillerTamil: { items: [], total: 0 },
  topThrillerTelugu: { items: [], total: 0 },
  topThrillerMalayalam: { items: [], total: 0 },
  topThrillerKannada: { items: [], total: 0 },
  topThrillerBengali: { items: [], total: 0 },
  hindiStar: { items: [], total: 0 },
  englishStar: { items: [], total: 0 },
  tamilStar: { items: [], total: 0 },
  teluguStar: { items: [], total: 0 },
  malayalamStar: { items: [], total: 0 },
  kannadaStar: { items: [], total: 0 },
  bengaliStar: { items: [], total: 0 },
  topRated: { items: [], total: 0 },
});

export function ShowsPageClient({ initialData }: ShowsPageClientProps) {
  const [remainingData, setRemainingData] = useState<Partial<ShowsData> | null>(null);
  const [isLoadingRemaining, setIsLoadingRemaining] = useState(true);

  // Merge initial and remaining data with defaults
  const data = { ...createEmptyData(), ...initialData, ...remainingData };

  // Fetch remaining data after initial render
  useEffect(() => {
    async function loadRemainingData() {
      try {
        console.log('[Client] Loading remaining shows data...');
        const response = await fetch('/api/shows/remaining');
        if (!response.ok) throw new Error('Failed to fetch remaining data');

        const remaining = await response.json();
        setRemainingData(remaining);
        console.log('[Client] Remaining shows data loaded');
      } catch (error) {
        console.error('[Client] Error loading remaining data:', error);
      } finally {
        setIsLoadingRemaining(false);
      }
    }

    // Start loading after a brief delay to prioritize initial render
    const timer = setTimeout(loadRemainingData, 100);
    return () => clearTimeout(timer);
  }, []);

  // Debug: Log what data the client has
  console.log('[Client] Shows page data:', {
    initial: Object.keys(initialData).length,
    remaining: remainingData ? Object.keys(remainingData).length : 0,
    isLoadingRemaining
  });

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

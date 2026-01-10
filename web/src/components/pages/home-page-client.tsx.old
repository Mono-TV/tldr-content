'use client';

import { HeroCarousel } from '@/components/sections/hero-carousel';
import { ContentRow, Top10Row } from '@/components/sections/content-row';
import type { HomepageData } from '@/lib/fetch-homepage-data';

interface HomePageClientProps {
  data: HomepageData;
}

/**
 * Client-side homepage component
 * Receives pre-fetched data from server component
 * All data is pre-rendered at build time via ISR
 */
export function HomePageClient({ data }: HomePageClientProps) {
  return (
    <div className="min-h-screen pb-20">
      {/* Hero Carousel */}
      <HeroCarousel items={data.featured.items || []} />

      {/* Content Sections */}
      <div className="-mt-20 relative z-10 space-y-8 pl-12 lg:pl-16">
        {/* Top Rated Movies (IMDb > 8, Last 5 Years) */}
        <ContentRow
          title="Top Rated Movies"
          contents={data.topRatedRecent.items || []}
          href="/browse?min_rating=8&sort=rating"
        />

        {/* Top Rated English Movies */}
        <ContentRow
          title="Top Rated English Movies"
          contents={data.topRatedEnglish.items || []}
          href="/browse?language=English&min_rating=8&sort=rating"
        />

        {/* Top Rated Hindi Movies */}
        <ContentRow
          title="Top Rated Hindi Movies"
          contents={data.topRatedHindi.items || []}
          href="/browse?language=Hindi&min_rating=8&sort=rating"
        />

        {/* Top Rated Bengali Movies */}
        <ContentRow
          title="Top Rated Bengali Movies"
          contents={data.topRatedBengali.items || []}
          href="/browse?language=Bengali&min_rating=8&sort=rating"
        />

        {/* Top Rated Tamil Movies */}
        <ContentRow
          title="Top Rated Tamil Movies"
          contents={data.topRatedTamil.items || []}
          href="/browse?language=Tamil&min_rating=8&sort=rating"
        />

        {/* Top Rated Telugu Movies */}
        <ContentRow
          title="Top Rated Telugu Movies"
          contents={data.topRatedTelugu.items || []}
          href="/browse?language=Telugu&min_rating=8&sort=rating"
        />

        {/* Top Rated Malayalam Movies */}
        <ContentRow
          title="Top Rated Malayalam Movies"
          contents={data.topRatedMalayalam.items || []}
          href="/browse?language=Malayalam&min_rating=8&sort=rating"
        />

        {/* Top Rated Kannada Movies */}
        <ContentRow
          title="Top Rated Kannada Movies"
          contents={data.topRatedKannada.items || []}
          href="/browse?language=Kannada&min_rating=8&sort=rating"
        />

        {/* Top Action Movies Rows */}
        <ContentRow
          title="Top Action Movies"
          contents={data.topAction.items || []}
          href="/browse?genre=Action&min_rating=8&sort=rating"
        />

        <ContentRow
          title="Top English Action Movies"
          contents={data.topActionEnglish.items || []}
          href="/browse?language=English&genre=Action&min_rating=7.5&sort=rating"
        />

        <ContentRow
          title="Top Hindi Action Movies"
          contents={data.topActionHindi.items || []}
          href="/browse?language=Hindi&genre=Action&min_rating=7.5&sort=rating"
        />

        <ContentRow
          title="Top Tamil Action Movies"
          contents={data.topActionTamil.items || []}
          href="/browse?language=Tamil&genre=Action&min_rating=8&sort=rating"
        />

        <ContentRow
          title="Top Telugu Action Movies"
          contents={data.topActionTelugu.items || []}
          href="/browse?language=Telugu&genre=Action&min_rating=7.5&sort=rating"
        />

        <ContentRow
          title="Top Malayalam Action Movies"
          contents={data.topActionMalayalam.items || []}
          href="/browse?language=Malayalam&genre=Action&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Kannada Action Movies"
          contents={data.topActionKannada.items || []}
          href="/browse?language=Kannada&genre=Action&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Bengali Action Movies"
          contents={data.topActionBengali.items || []}
          href="/browse?language=Bengali&genre=Action&min_rating=6.5&sort=rating"
        />

        {/* Top Comedy Movies Rows */}
        <ContentRow
          title="Top Comedy Movies"
          contents={data.topComedy.items || []}
          href="/browse?genre=Comedy&min_rating=7.5&sort=rating"
        />

        <ContentRow
          title="Top English Comedy Movies"
          contents={data.topComedyEnglish.items || []}
          href="/browse?language=English&genre=Comedy&min_rating=7.5&sort=rating"
        />

        <ContentRow
          title="Top Hindi Comedy Movies"
          contents={data.topComedyHindi.items || []}
          href="/browse?language=Hindi&genre=Comedy&min_rating=7.5&sort=rating"
        />

        <ContentRow
          title="Top Tamil Comedy Movies"
          contents={data.topComedyTamil.items || []}
          href="/browse?language=Tamil&genre=Comedy&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Telugu Comedy Movies"
          contents={data.topComedyTelugu.items || []}
          href="/browse?language=Telugu&genre=Comedy&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Malayalam Comedy Movies"
          contents={data.topComedyMalayalam.items || []}
          href="/browse?language=Malayalam&genre=Comedy&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Kannada Comedy Movies"
          contents={data.topComedyKannada.items || []}
          href="/browse?language=Kannada&genre=Comedy&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Bengali Comedy Movies"
          contents={data.topComedyBengali.items || []}
          href="/browse?language=Bengali&genre=Comedy&min_rating=6.5&sort=rating"
        />

        {/* Top Drama Movies Rows */}
        <ContentRow
          title="Top Drama Movies"
          contents={data.topDrama.items || []}
          href="/browse?genre=Drama&min_rating=8&sort=rating"
        />

        <ContentRow
          title="Top English Drama Movies"
          contents={data.topDramaEnglish.items || []}
          href="/browse?language=English&genre=Drama&min_rating=8&sort=rating"
        />

        <ContentRow
          title="Top Hindi Drama Movies"
          contents={data.topDramaHindi.items || []}
          href="/browse?language=Hindi&genre=Drama&min_rating=7.5&sort=rating"
        />

        <ContentRow
          title="Top Tamil Drama Movies"
          contents={data.topDramaTamil.items || []}
          href="/browse?language=Tamil&genre=Drama&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Telugu Drama Movies"
          contents={data.topDramaTelugu.items || []}
          href="/browse?language=Telugu&genre=Drama&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Malayalam Drama Movies"
          contents={data.topDramaMalayalam.items || []}
          href="/browse?language=Malayalam&genre=Drama&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Kannada Drama Movies"
          contents={data.topDramaKannada.items || []}
          href="/browse?language=Kannada&genre=Drama&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Bengali Drama Movies"
          contents={data.topDramaBengali.items || []}
          href="/browse?language=Bengali&genre=Drama&min_rating=6.5&sort=rating"
        />

        {/* Top Thriller Movies Rows */}
        <ContentRow
          title="Top Thriller Movies"
          contents={data.topThriller.items || []}
          href="/browse?genre=Thriller&min_rating=8&sort=rating"
        />

        <ContentRow
          title="Top English Thriller Movies"
          contents={data.topThrillerEnglish.items || []}
          href="/browse?language=English&genre=Thriller&min_rating=7.5&sort=rating"
        />

        <ContentRow
          title="Top Hindi Thriller Movies"
          contents={data.topThrillerHindi.items || []}
          href="/browse?language=Hindi&genre=Thriller&min_rating=7.5&sort=rating"
        />

        <ContentRow
          title="Top Tamil Thriller Movies"
          contents={data.topThrillerTamil.items || []}
          href="/browse?language=Tamil&genre=Thriller&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Telugu Thriller Movies"
          contents={data.topThrillerTelugu.items || []}
          href="/browse?language=Telugu&genre=Thriller&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Malayalam Thriller Movies"
          contents={data.topThrillerMalayalam.items || []}
          href="/browse?language=Malayalam&genre=Thriller&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Kannada Thriller Movies"
          contents={data.topThrillerKannada.items || []}
          href="/browse?language=Kannada&genre=Thriller&min_rating=7&sort=rating"
        />

        <ContentRow
          title="Top Bengali Thriller Movies"
          contents={data.topThrillerBengali.items || []}
          href="/browse?language=Bengali&genre=Thriller&min_rating=6.5&sort=rating"
        />

        {/* Latest Star Movies Rows */}
        <ContentRow
          title="Latest Hindi Star Movies"
          subtitle="Featuring Rajkummar Rao, Varun Dhawan, Vicky Kaushal & more"
          contents={data.hindiStar.items || []}
          href="/browse?language=Hindi&min_rating=7"
        />

        <ContentRow
          title="Latest English Star Movies"
          subtitle="Featuring Dwayne Johnson, Chris Hemsworth, Tom Cruise & more"
          contents={data.englishStar.items || []}
          href="/browse?language=English&min_rating=7"
        />

        <ContentRow
          title="Latest Tamil Star Movies"
          subtitle="Featuring Dhanush, Ajith Kumar, Sivakarthikeyan & more"
          contents={data.tamilStar.items || []}
          href="/browse?language=Tamil&min_rating=7"
        />

        <ContentRow
          title="Latest Telugu Star Movies"
          subtitle="Featuring Ravi Teja, Mahesh Babu, Vijay Deverakonda & more"
          contents={data.teluguStar.items || []}
          href="/browse?language=Telugu&min_rating=7"
        />

        <ContentRow
          title="Latest Malayalam Star Movies"
          subtitle="Featuring Mohanlal, Mammootty, Fahadh Faasil & more"
          contents={data.malayalamStar.items || []}
          href="/browse?language=Malayalam&min_rating=7"
        />

        <ContentRow
          title="Latest Kannada Star Movies"
          subtitle="Featuring Sudeep, Shiva Rajkumar, Rishab Shetty & more"
          contents={data.kannadaStar.items || []}
          href="/browse?language=Kannada&min_rating=7"
        />

        <ContentRow
          title="Latest Bengali Star Movies"
          subtitle="Featuring Jisshu Sengupta, Prosenjit Chatterjee & more"
          contents={data.bengaliStar.items || []}
          href="/browse?language=Bengali&min_rating=7"
        />

        {/* Top 10 */}
        <Top10Row
          title="Top 10 This Week"
          contents={data.topRated.items || []}
        />
      </div>
    </div>
  );
}

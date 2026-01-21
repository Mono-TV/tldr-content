'use client';

import { SportsHero } from '@/components/sports/sports-hero';
import { SportsRow } from '@/components/sports/sports-row';
import { SportsCollectionsGrid } from '@/components/sports/sports-collections-grid';
import type { SportsHomepageData } from '@/lib/fetch-sports-data';
import { SPORT_ICONS, sportToSlug } from '@/types/sports';

interface SportsHomepageProps {
  data: SportsHomepageData;
}

export function SportsHomepage({ data }: SportsHomepageProps) {
  // Use live content for hero, fallback to featured/upcoming
  const heroContent = data.live.items.length > 0
    ? data.live.items
    : data.featured.items.length > 0
      ? data.featured.items
      : data.cricket.items; // Ultimate fallback to cricket

  const hasLive = data.live.items.length > 0;
  const hasUpcoming = data.upcoming.items.length > 0;

  return (
    <div className="min-h-screen">
      {/* Hero Section - Live or Featured */}
      <SportsHero
        items={heroContent}
        isLive={hasLive}
        title={hasLive ? 'Live Now' : 'Featured Sports'}
      />

      {/* Content Rows Container */}
      <div className="-mt-20 relative z-10 pb-20 space-y-2">

        {/* Starting Soon Row - Only show if upcoming content exists */}
        {hasUpcoming && (
          <SportsRow
            title="Starting Soon"
            subtitle="Next 24 hours"
            contents={data.upcoming.items}
            showCountdown={true}
            priorityCount={5}
          />
        )}

        {/* Cricket Row */}
        {data.cricket.items.length > 0 && (
          <SportsRow
            title={`${SPORT_ICONS['Cricket']} Cricket`}
            contents={data.cricket.items}
            sportType="Cricket"
            href={`/sports/${sportToSlug('Cricket')}`}
            priorityCount={3}
          />
        )}

        {/* Football Row */}
        {data.football.items.length > 0 && (
          <SportsRow
            title={`${SPORT_ICONS['Football']} Football`}
            contents={data.football.items}
            sportType="Football"
            href={`/sports/${sportToSlug('Football')}`}
          />
        )}

        {/* Kabaddi Row */}
        {data.kabaddi.items.length > 0 && (
          <SportsRow
            title={`${SPORT_ICONS['Kabaddi']} Kabaddi`}
            contents={data.kabaddi.items}
            sportType="Kabaddi"
            href={`/sports/${sportToSlug('Kabaddi')}`}
          />
        )}

        {/* Tennis Row */}
        {data.tennis.items.length > 0 && (
          <SportsRow
            title={`${SPORT_ICONS['Tennis']} Tennis`}
            contents={data.tennis.items}
            sportType="Tennis"
            href={`/sports/${sportToSlug('Tennis')}`}
          />
        )}

        {/* Badminton Row */}
        {data.badminton.items.length > 0 && (
          <SportsRow
            title={`${SPORT_ICONS['Badminton']} Badminton`}
            contents={data.badminton.items}
            sportType="Badminton"
            href={`/sports/${sportToSlug('Badminton')}`}
          />
        )}

        {/* All Sports Grid Section */}
        <section className="pt-8 px-12 lg:px-16">
          <h2 className="text-2xl font-bold text-white mb-6">
            All Sports
          </h2>
          <SportsCollectionsGrid collections={data.collections} />
        </section>
      </div>
    </div>
  );
}

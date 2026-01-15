'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { m } from 'framer-motion';
import {
  Star,
  Play,
  Plus,
  Share2,
  Calendar,
  Clock,
  Globe,
  Film,
  Tv,
  ChevronLeft,
  ExternalLink,
} from 'lucide-react';
import { cn, formatRating, formatDuration, getImageUrl, getBackdropUrl, getRatingColor, extractYouTubeId, getPlatformLogoUrl } from '@/lib/utils';
import { BLUR_DATA_URLS, IMAGE_SIZES } from '@/lib/image-utils';
import { ContentRow } from '@/components/sections/content-row';
import api from '@/services/api';

interface ContentDetailProps {
  id: string;
}

export function ContentDetail({ id }: ContentDetailProps) {
  const { data: content, isLoading, error } = useQuery({
    queryKey: ['content', id],
    queryFn: () => api.getContentById(id),
  });

  // Fetch similar content
  const { data: similarData } = useQuery({
    queryKey: ['similar', content?.genres?.[0]?.name],
    queryFn: () => api.getByGenre(content?.genres?.[0]?.name || 'Action', 12),
    enabled: !!content?.genres?.[0]?.name,
  });

  if (isLoading) {
    return <ContentDetailSkeleton />;
  }

  if (error || !content) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Content not found</h1>
          <p className="text-muted-foreground mb-6">The content you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent rounded-lg hover:bg-accent-hover transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  const isShow = content.type === 'show';
  const languages = content.languages?.join(', ') || content.original_language || 'Unknown';

  return (
    <div className="min-h-screen">
      {/* Backdrop */}
      <div className="relative h-[60vh] md:h-[70vh]">
        <Image
          src={getBackdropUrl(content.backdrop_url || content.poster_url, 'lg')}
          alt={content.title}
          fill
          className="object-cover"
          priority
          placeholder="blur"
          blurDataURL={BLUR_DATA_URLS.backdrop}
          sizes={IMAGE_SIZES.backdrop}
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

        {/* Back Button */}
        <Link
          href="/browse"
          className="absolute top-20 left-4 md:left-8 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </Link>
      </div>

      {/* Content Details */}
      <div className="container mx-auto px-4 -mt-40 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-shrink-0"
          >
            <div className="relative w-48 md:w-64 aspect-[2/3] rounded-lg overflow-hidden shadow-2xl mx-auto md:mx-0">
              <Image
                src={getImageUrl(content.poster_url, 'md')}
                alt={content.title}
                fill
                className="object-cover"
                priority
                placeholder="blur"
                blurDataURL={BLUR_DATA_URLS.poster}
                sizes={IMAGE_SIZES.detailPoster}
              />
            </div>
          </m.div>

          {/* Info */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 text-center md:text-left"
          >
            {/* Type Badge */}
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              {isShow ? (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
                  <Tv className="w-3 h-3" />
                  TV Show
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-accent/20 text-accent rounded text-xs">
                  <Film className="w-3 h-3" />
                  Movie
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{content.title}</h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6 text-sm">
              {content.imdb_rating && (
                <div className="flex items-center gap-1.5">
                  <Star className="w-5 h-5 text-gold fill-gold" />
                  <span className={cn('text-lg font-bold', getRatingColor(content.imdb_rating))}>
                    {formatRating(content.imdb_rating)}
                  </span>
                  <span className="text-muted-foreground">/10</span>
                </div>
              )}
              {content.year && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {content.year}
                </div>
              )}
              {content.runtime && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {formatDuration(content.runtime)}
                </div>
              )}
              {isShow && content.seasons && (
                <span className="text-muted-foreground">
                  {content.seasons} Season{content.seasons > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-6">
              {content.genres?.map((genre) => (
                <Link
                  key={genre.id}
                  href={`/browse?genre=${genre.name}`}
                  className="px-3 py-1 bg-card rounded-full text-sm hover:bg-card-hover transition-colors"
                >
                  {genre.name}
                </Link>
              ))}
            </div>

            {/* Streaming Platforms */}
            {content.streaming_platforms && content.streaming_platforms.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3 text-center md:text-left">Available On</h3>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  {content.streaming_platforms.map((platform, index) => (
                    <a
                      key={platform.id || index}
                      href={platform.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-card-hover rounded-lg border border-white/10 transition-colors"
                    >
                      {platform.logo_path && (
                        <Image
                          src={getPlatformLogoUrl(platform.logo_path)}
                          alt={platform.name || platform.platform}
                          width={24}
                          height={24}
                          className="rounded"
                        />
                      )}
                      <span className="text-sm font-medium">{platform.name || platform.platform}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-8">
              <button className="flex items-center gap-2 px-6 py-3 bg-accent rounded-lg font-semibold hover:bg-accent-hover transition-colors">
                <Play className="w-5 h-5 fill-white" />
                Watch Trailer
              </button>
              <button className="flex items-center gap-2 px-4 py-3 bg-card rounded-lg font-semibold hover:bg-card-hover transition-colors">
                <Plus className="w-5 h-5" />
                Add to Watchlist
              </button>
              <button className="p-3 bg-card rounded-lg hover:bg-card-hover transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Overview */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2">Overview</h2>
              <p className="text-muted-foreground leading-relaxed">
                {content.overview || content.plot || 'No overview available.'}
              </p>
            </div>

            {/* Trailer */}
            {(content.trailer_url || content.trailer_key) && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Watch Trailer</h2>
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${content.trailer_key || extractYouTubeId(content.trailer_url)}`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={`${content.title} Trailer`}
                  />
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block mb-1">Language</span>
                <span className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  {languages}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Status</span>
                <span>{content.status || 'Released'}</span>
              </div>
              {content.imdb_id && (
                <div>
                  <span className="text-muted-foreground block mb-1">IMDb</span>
                  <a
                    href={`https://www.imdb.com/title/${content.imdb_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-gold hover:underline"
                  >
                    {content.imdb_id}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              {content.vote_count && (
                <div>
                  <span className="text-muted-foreground block mb-1">Votes</span>
                  <span>{content.vote_count.toLocaleString()}</span>
                </div>
              )}
            </div>
          </m.div>
        </div>

        {/* Cast Section */}
        {content.cast && content.cast.length > 0 && (
          <m.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12"
          >
            <h2 className="text-xl font-semibold mb-4">Cast</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {content.cast.slice(0, 10).map((member, index) => (
                <div key={member.id || index} className="flex-shrink-0 text-center w-24">
                  <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-card mb-2">
                    {member.profile_path ? (
                      <Image
                        src={getImageUrl(member.profile_path, 'sm')}
                        alt={member.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                        placeholder="blur"
                        blurDataURL={BLUR_DATA_URLS.profile}
                        sizes={IMAGE_SIZES.profile}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-card-hover text-2xl font-bold text-muted-foreground">
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium truncate">{member.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{member.character}</p>
                </div>
              ))}
            </div>
          </m.section>
        )}

        {/* Similar Content */}
        {similarData?.items && similarData.items.length > 0 && (
          <m.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 pb-12"
          >
            <ContentRow
              title="You May Also Like"
              contents={similarData.items.filter((c) => c.imdb_id !== content.imdb_id)}
              href={`/browse?genre=${content.genres?.[0]?.name || 'Action'}`}
            />
          </m.section>
        )}
      </div>
    </div>
  );
}

export function ContentDetailSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="relative h-[60vh] md:h-[70vh] skeleton" />
      <div className="container mx-auto px-4 -mt-40 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-48 md:w-64 aspect-[2/3] rounded-lg skeleton mx-auto md:mx-0" />
          <div className="flex-1 space-y-4">
            <div className="h-8 w-24 rounded skeleton mx-auto md:mx-0" />
            <div className="h-12 w-3/4 rounded skeleton mx-auto md:mx-0" />
            <div className="h-6 w-1/2 rounded skeleton mx-auto md:mx-0" />
            <div className="flex gap-2 justify-center md:justify-start">
              <div className="h-8 w-20 rounded-full skeleton" />
              <div className="h-8 w-20 rounded-full skeleton" />
            </div>
            <div className="flex gap-3 justify-center md:justify-start">
              <div className="h-12 w-36 rounded-lg skeleton" />
              <div className="h-12 w-40 rounded-lg skeleton" />
            </div>
            <div className="h-32 rounded skeleton" />
          </div>
        </div>
      </div>
    </div>
  );
}

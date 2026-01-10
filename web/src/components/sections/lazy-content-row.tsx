'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ContentRow, Top10Row } from './content-row';
import type { Content } from '@/types';

interface LazyContentRowProps {
  title: string;
  subtitle?: string;
  queryKey: string[];
  queryFn: () => Promise<{ items?: Content[]; content?: Content[]; total?: number }>;
  showRank?: boolean;
  href?: string;
  cardSize?: 'sm' | 'md' | 'lg';
  isTop10?: boolean;
}

/**
 * LazyContentRow - Loads row data only when it enters the viewport
 * Uses Intersection Observer to defer API calls until row is near viewport
 * Significantly improves initial page load performance
 */
export function LazyContentRow({
  title,
  subtitle,
  queryKey,
  queryFn,
  showRank = false,
  href,
  cardSize = 'md',
  isTop10 = false,
}: LazyContentRowProps) {
  const [isVisible, setIsVisible] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Stop observing once visible
        }
      },
      {
        rootMargin: '400px', // Load 400px before entering viewport for smooth experience
        threshold: 0.01,     // Trigger as soon as 1% is visible
      }
    );

    if (rowRef.current) {
      observer.observe(rowRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Only fetch data when row becomes visible
  const { data, isLoading } = useQuery({
    queryKey,
    queryFn,
    enabled: isVisible, // Critical: only fetch when row is visible
  });

  const contents = data?.items || data?.content || [];

  return (
    <div ref={rowRef} className="min-h-[300px]">
      {isTop10 ? (
        <Top10Row
          title={title}
          contents={contents}
          isLoading={!isVisible || isLoading}
        />
      ) : (
        <ContentRow
          title={title}
          subtitle={subtitle}
          contents={contents}
          isLoading={!isVisible || isLoading}
          showRank={showRank}
          href={href}
          cardSize={cardSize}
        />
      )}
    </div>
  );
}

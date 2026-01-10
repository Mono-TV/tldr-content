'use client';

import { useEffect, useRef } from 'react';
import { useDPadNavigation } from '@/contexts/dpad-navigation-context';

interface UseFocusableOptions {
  id: string;
  section: 'spotlight';
  index?: number;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
}

/**
 * Hook to make an element focusable with D-Pad navigation
 *
 * @example
 * const ref = useFocusable({
 *   id: 'movie-card-1',
 *   section: 'content-row',
 *   row: 0,
 *   index: 1,
 *   href: '/content/tt0111161'
 * });
 *
 * return <div ref={ref}>Content</div>;
 */
export function useFocusable<T extends HTMLElement = HTMLDivElement>(
  options: UseFocusableOptions
) {
  const ref = useRef<T>(null);
  const { registerElement, unregisterElement, focusedId, isDPadMode } = useDPadNavigation();

  useEffect(() => {
    if (!ref.current || options.disabled) return;

    registerElement({
      id: options.id,
      element: ref.current,
      section: options.section,
      index: options.index,
      href: options.href,
      onClick: options.onClick,
    });

    return () => {
      unregisterElement(options.id);
    };
  }, [
    options.id,
    options.section,
    options.index,
    options.href,
    options.disabled,
    registerElement,
    unregisterElement,
  ]);

  const isFocused = focusedId === options.id && isDPadMode;

  return { ref, isFocused };
}

'use client';

import { forwardRef, type ComponentProps } from 'react';
import { LazyMotion, domAnimation, m, AnimatePresence as FramerAnimatePresence } from 'framer-motion';

/**
 * Optimized motion components using Framer Motion's LazyMotion
 *
 * LazyMotion with domAnimation loads only essential animation features
 * reducing the bundle size by ~50% compared to full framer-motion import.
 *
 * Features included with domAnimation:
 * - animate prop
 * - exit animations
 * - AnimatePresence
 * - whileHover, whileTap, whileFocus
 * - layout animations
 *
 * Features NOT included (require domMax):
 * - Drag gestures
 * - Pan gestures
 * - SVG path animations
 */

// Wrapper component that provides LazyMotion context
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}

// Re-export m as motion for drop-in replacement
export const motion = m;

// Re-export AnimatePresence
export const AnimatePresence = FramerAnimatePresence;

// Type-safe motion.div
type MotionDivProps = ComponentProps<typeof m.div>;

export const MotionDiv = forwardRef<HTMLDivElement, MotionDivProps>(
  function MotionDiv(props, ref) {
    return <m.div ref={ref} {...props} />;
  }
);

// Type-safe motion.section
type MotionSectionProps = ComponentProps<typeof m.section>;

export const MotionSection = forwardRef<HTMLElement, MotionSectionProps>(
  function MotionSection(props, ref) {
    return <m.section ref={ref} {...props} />;
  }
);

// Type-safe motion.span
type MotionSpanProps = ComponentProps<typeof m.span>;

export const MotionSpan = forwardRef<HTMLSpanElement, MotionSpanProps>(
  function MotionSpan(props, ref) {
    return <m.span ref={ref} {...props} />;
  }
);

// Type-safe motion.p
type MotionParagraphProps = ComponentProps<typeof m.p>;

export const MotionParagraph = forwardRef<HTMLParagraphElement, MotionParagraphProps>(
  function MotionParagraph(props, ref) {
    return <m.p ref={ref} {...props} />;
  }
);

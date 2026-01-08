# TLDR Content - UI Design Guidelines

This document outlines the key design decisions, UI patterns, and implementation details for the TLDR streaming platform interface.

## Design Philosophy

- **Premium minimalism**: Inspired by Apple TV+ and Netflix
- **Content-first**: Clean layouts that prioritize artwork and readability
- **Subtle transparency**: Glassmorphism with high transparency for immersive blending
- **Smooth interactions**: GPU-accelerated animations with thoughtful hover states

---

## Navigation Bar

### Structure
- **Height**: `h-16` (64px) - Compact and unobtrusive
- **Layout**: 3-column grid with centered navigation pill
  - Left: TLDR logo with gold gradient
  - Center: Navigation pill (absolutely centered)
  - Right: Profile/auth controls

### Transparency & Blur
- **Default state**: `from-black/40 via-black/20 to-transparent` gradient
- **Scrolled state**: `bg-black/20 backdrop-blur-xl`
- **Result**: Highly transparent navbar that blends with hero content

### Navigation Pill
- **Style**: `rounded-full` with glassmorphism
- **Background**: `rgba(255, 255, 255, 0.08)` with `blur(24px)`
- **Border**: `border-white/20`
- **Padding**: `px-8 py-1` - Slim profile
- **Items**: Search icon, Home, Movies, Shows, Sports, Music
- **Spacing**: `gap-12` between items
- **Alignment**: Perfect vertical centering with logo and profile

### Logo Styling
```css
font-family: var(--font-gia-variable), serif
background: linear-gradient(135deg, #D4AF37 0%, #F4E4BA 30%, #D4AF37 60%, #B8860B 100%)
-webkit-background-clip: text
-webkit-text-fill-color: transparent
```

---

## Hero Section (Spotlight Banner)

### Layout
- **Height**: `h-[70vh] md:h-[85vh]` - Prominent but not overwhelming
- **Content padding**: `px-12 lg:px-16` - Matches site left padding
- **Position**: Edge-to-edge background, padded content

### Gradient Overlays
Three-layer gradient system for text readability:
```tsx
// Layer 1: Left to right (dark left for text)
bg-gradient-to-r from-black/90 via-black/50 to-transparent

// Layer 2: Top to bottom center
bg-gradient-to-t from-black via-black/20 to-black/40

// Layer 3: Bottom fade
bg-gradient-to-b from-transparent via-transparent to-black/80
```

### Typography
- **Title**: `text-5xl md:text-7xl font-bold` with text shadows
- **Meta info**: Premium glassmorphism badges for ratings
- **Description**: `line-clamp-3` with 250 char truncation

### CTA Buttons
- **Primary (Watch Now)**: White `rounded-full` button with play icon
  - `px-10 py-4` for large touch target
  - `hover:scale-105` subtle lift effect
- **Secondary (Watchlist)**: Circular heart icon button
  - `w-14 h-14 rounded-full`
  - Glassmorphism background

---

## Movie Cards

### Sizing
- **sm**: `w-32 md:w-36 lg:w-40` (128-160px)
- **md**: `w-36 md:w-40 lg:w-48` (144-192px)
- **lg**: `w-36 md:w-40 lg:w-48` (same as md for Top 10 consistency)

### Hover Effects (Premium Animation)
```tsx
// Card container
group-hover:scale-[1.02]        // Subtle 2% scale
group-hover:-translate-y-2      // 8px upward lift
group-hover:shadow-2xl          // Dramatic shadow with accent glow

// Poster image
group-hover:scale-110           // 10% zoom (reduced from 125%)
transition: duration-700        // Slower for elegance

// Info section
opacity-0                       // Hidden by default
group-hover:opacity-100         // Fade in on hover
group-hover:translate-y-1       // Subtle downward slide
```

### Play Button Overlay
- **Size**: `w-7 h-7` play icon
- **Container**: `p-4 rounded-full bg-white/95`
- **Animation**: Scale from 50% to 100% with 100ms delay
- **Timing**: `duration-500 ease-out`

### Info Display
- **Default**: Hidden (`opacity-0`)
- **On hover**: Visible with fade-in
- **Content**: Title, year, genre
- **Styling**: White title, muted metadata

---

## Content Rows

### Standard Rows
- **Gap**: `gap-8` (32px) between cards
- **Cards visible**: ~9-10 cards on 1920px viewport
- **Padding**: No left padding for regular rows

### Top 10 Rows
- **Gap**: `gap-36` (144px) for number visibility
- **Cards visible**: 6 cards on 1920px viewport
- **Card size**: Same as regular rows (`lg` → 192px)
- **Left padding**: `pl-8 md:pl-16` for rank number space

### Rank Numbers
- **Font size**: `8rem` mobile, `12rem` desktop
- **Stroke**: `4px` mobile, `6px` desktop gold outline
- **Color**: Transparent fill with gold stroke (`--gold: #d4a853`)
- **Position**: `absolute -left-8 md:-left-14 lg:-left-20`
- **Vertical alignment**: `bottom-10 md:bottom-12` (aligned with poster baseline)
- **Line height**: `0.85` for tighter spacing
- **Hover effect**: `group-hover:opacity-70`

### Navigation Arrows
- **Visibility**: `opacity-0 group-hover/carousel:opacity-100`
- **Background**: Gradient fade (`from-background to-transparent`)
- **Size**: `w-12 h-24`
- **Icons**: `w-8 h-8` chevrons

---

## Color System

### CSS Variables
```css
--background: #0a0a0a        /* Near black */
--foreground: #ededed        /* Off white */
--card: #141414              /* Card background */
--border: #262626            /* Subtle borders */
--muted-foreground: #a3a3a3  /* Secondary text */
--accent: #dc2626            /* Red accent */
--gold: #d4a853              /* Gold highlights */
```

### Transparency Patterns
- **Navbar**: 20-40% black with heavy blur
- **Overlays**: 60-90% black gradients
- **Glassmorphism**: 8% white with 24px blur
- **Borders**: 20-30% white

---

## Typography

### Font Stack
- **Primary**: Red Hat Display (300-900 weights)
- **Logo**: Gia Variable (serif)
- **Fallback**: system-ui, sans-serif

### Scale
- **Navbar items**: `text-lg` (18px)
- **Section titles**: `text-xl md:text-2xl` (20-24px)
- **Hero title**: `text-5xl md:text-7xl` (48-72px)
- **Card titles**: `text-sm` (14px)
- **Metadata**: `text-xs` (12px)

---

## Animation Guidelines

### Timing Functions
- **Default**: `ease-out` for natural deceleration
- **Duration standards**:
  - Quick: 150-300ms (UI feedback)
  - Standard: 300-500ms (cards, overlays)
  - Slow: 500-700ms (images, hero content)

### GPU Acceleration
- Use `transform-gpu` on animated elements
- Prefer `transform` over position properties
- Batch related animations

### Hover State Best Practices
1. Scale should be subtle (102-105%)
2. Combine with translate for depth
3. Add shadow for lift illusion
4. Stagger child animations with delays

---

## Layout System

### Container Widths
- **Full width**: No max-width constraints
- **Content padding**: `pl-12 lg:pl-16` (left only)
- **Right edge**: `pr-0` for edge-to-edge scrolling

### Grid & Spacing
- **Hero height**: 70vh mobile, 85vh desktop
- **Section gaps**: `py-6` vertical spacing
- **Card gaps**: 8-36px depending on row type

### Responsive Breakpoints
- **md**: 768px (tablet)
- **lg**: 1024px (desktop)
- **Target**: Optimized for 1920px viewports

---

## Component File Reference

### Key Files
- `/web/src/components/layout/navbar.tsx` - Navigation bar
- `/web/src/components/sections/hero-carousel.tsx` - Spotlight banner
- `/web/src/components/movie/movie-card.tsx` - Movie/show cards
- `/web/src/components/sections/content-row.tsx` - Horizontal scrolling rows
- `/web/src/app/globals.css` - Global styles and CSS variables

### Utility Files
- `/web/src/lib/utils.ts` - Helper functions (cn, formatRating, etc.)
- `/web/tailwind.config.ts` - Tailwind configuration

---

## Development Commands

### Start Development Server
```bash
cd web
npm run dev
# Server runs on http://localhost:3000
```

### Stop Server
```bash
pkill -f "next dev"
```

### Build for Production
```bash
npm run build
npm run start
```

---

## Design Principles Summary

1. **Minimize visual clutter**: Hide non-essential info until hover
2. **Maximize content**: Edge-to-edge layouts with strategic padding
3. **Subtle interactions**: Gentle animations that feel responsive
4. **Consistent spacing**: Use Tailwind spacing scale religiously
5. **Premium materials**: Glassmorphism, gradients, and blur effects
6. **Typography hierarchy**: Bold for emphasis, regular for readability
7. **Performance first**: GPU acceleration, optimized images, smooth 60fps

---

## Future Considerations

- Dark/light mode toggle (currently dark-only)
- Accessibility improvements (keyboard navigation, screen readers)
- Mobile-optimized card sizes and touch interactions
- Vertical scrolling mode for content discovery
- Advanced search with filters
- User preferences for card density and info display

---

**Last Updated**: January 8, 2026
**Design System Version**: 1.0
**Framework**: Next.js 14 with Tailwind CSS v4

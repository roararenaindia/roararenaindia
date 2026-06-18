# Roar Arena - Enhanced Landing Page

## Overview
This is a premium, motion-driven sports fan experience landing page for **Roar Arena** built with Next.js, React, Tailwind CSS, and Framer Motion animations.

## Key Features

### 1. **Enhanced Header**
- Sticky navigation with smooth hover animations
- Mobile hamburger menu with animated transitions
- Logo placeholder (replace with your actual logo file)
- "Join WhatsApp" CTA button with glow effects

### 2. **Hero Section** (`components/home/hero-enhanced.tsx`)
- **Massive headline**: "WATCH THE GAME. FEEL THE ROAR." with orange glow
- **Animated background**: Orange glow pulse + diagonal light streaks
- **Live Match Center card** (right side on desktop, below on mobile)
  - Shows upcoming NBA Finals Game 5
  - Scoreboard-style team display
  - Real-time status badge with pulse animation
- **Sport badges**: FIFA, NBA, IPL, F1, Basketball, Olympics
- **Live ticker**: Scrolling marquee with sports updates
- **CTA buttons**: Join WhatsApp Channel + Follow Instagram

### 3. **Latest from the Arena** (`components/home/latest-from-arena.tsx`)
- 3 social post-style cards with emoji icons
- Gradient backgrounds with hover lift animations
- Engagement stats (likes, comments, shares)
- Card hover effects with orange glow
- Fully responsive grid layout

### 4. **Featured Match** (`components/home/featured-match.tsx`)
- Premium broadcast-style match card
- Large team displays with gradient backgrounds
- Match details: game number, date, time, channel
- Dual CTAs: Set Reminder + Join Watch Chat
- Animated background glow effect
- Pulsing status indicator

### 5. **Match Center** (`components/home/match-pulse-board.tsx`)
- 4 premium match cards in 2x2 grid (responsive)
- Status pills (UPCOMING, RESULT, WATCH PARTY)
- Team displays with gradient backgrounds
- Date and time with icons
- Animated "View Details" buttons
- Hover animations with orange glow

### 6. **What We Do** (Original)
- 4 feature cards: Watch Parties, Live Screenings, Fan Meetups, Tournaments
- Orange accent lines
- Hover animations

### 7. **Sports We Cover** (Original)
- 6 sport categories with icons
- Hover glow effects
- Clean card design

### 8. **WhatsApp Community** (`components/home/whatsapp-community.tsx`)
- **Left panel**: Community benefits with benefit cards
  - Match Updates, Watch Party Drops, Fan Community, Exclusive Content, Fan Moments, Live Chat
- **Right panel**: Phone mockup showing WhatsApp conversation
  - Animated messages appearing in sequence
  - Realistic chat interface with send button
  - Shows real-time fan engagement
- **Bottom section**: Instagram CTA
- Grid of community benefits cards
- Fully responsive layout

### 9. **Experience Flow** (Original)
- Horizontal flow: Discover Match → Join Community → Attend Screening → Live the Roar
- Icon-based visual journey

### 10. **Final CTA** (Original)
- "Your next match night should not be quiet."
- Dual action buttons

### 11. **Footer**
- Logo placeholder
- Tagline: "Where fans come alive"
- Social links: WhatsApp, Instagram, Contact
- Copyright

## Animation Features

### Framer Motion Animations
- ✅ Fade-up animations on scroll
- ✅ Staggered card reveal animations
- ✅ Orange glow pulse behind hero
- ✅ Diagonal light streaks animation
- ✅ Hover lift on event cards
- ✅ Animated orange border glow
- ✅ Button hover with orange glow scale
- ✅ Mobile menu slide-in animation
- ✅ Smooth section transitions
- ✅ WhatsApp message appear animations

### CSS Animations
- ✅ Live ticker marquee (40s continuous)
- ✅ Pulse effects on status badges
- ✅ Smooth transitions throughout

## Color System

```
Primary Colors:
- Roar Orange: #FF4B1F
- Deep Black: #050505
- Graphite: #111111
- Card Background: #181818
- White: #FFFFFF
- Muted Gray: #A7A7A7
- Border: rgba(255, 255, 255, 0.12)
```

## Typography

- **Headings**: Bebas Neue (bold, uppercase, sports poster feel)
- **Body**: Inter (clean, readable)
- Responsive sizing using Tailwind scale

## Responsive Design

### Mobile (375px)
- ✅ Stacked hero layout (Live Match Center below text)
- ✅ Single column grids for cards
- ✅ Hamburger menu for navigation
- ✅ Stacked CTA buttons
- ✅ Wrapped sport badges
- ✅ Full-width cards with proper padding
- ✅ No horizontal overflow

### Tablet (768px+)
- ✅ 2-column grids for cards
- ✅ Expanded navigation
- ✅ Optimal spacing and typography

### Desktop (1920px+)
- ✅ Full 2-column hero layout (text + Live Match Center side-by-side)
- ✅ 3-column and 4-column grids for cards
- ✅ Premium spacing and hover effects

## How to Add Your Logo

### Option 1: Replace the Placeholder Icon
1. The current header logo is a simple orange "R" box in `components/layout/header.tsx`
2. Replace it with an image tag:

```tsx
<Link href="/" className="flex items-center gap-2 flex-shrink-0">
  <img 
    src="/logo.png" 
    alt="Roar Arena" 
    className="w-8 h-8 md:w-10 md:h-10 object-contain"
  />
  {/* Optional: Keep ROAR text or remove */}
  <span className="font-heading text-base md:text-lg font-bold tracking-wider hidden sm:inline text-white">ROAR</span>
</Link>
```

### Option 2: Full Logo with Text
If your logo includes the "ROAR" text:

```tsx
<Link href="/" className="flex items-center gap-2 flex-shrink-0">
  <img 
    src="/logo-full.png" 
    alt="Roar Arena" 
    className="h-8 md:h-10 object-contain"
  />
</Link>
```

### Placement
The logo appears in:
1. **Header** - Left side (sticky navigation)
2. **Hero Section** - Above headline (optional)
3. **Footer** - Left side
4. **Mobile Menu** - Optional

### File Recommendations
- Format: PNG with transparent background
- Sizes: 
  - Small: 32px (mobile header)
  - Medium: 40px (tablet header)
  - Large: 48-64px (footer, hero)
- Keep the logo clean and premium
- Ensure it's visible on dark background

## Dependencies

```json
{
  "dependencies": {
    "next": "16.2.6",
    "react": "^19",
    "react-dom": "^19",
    "framer-motion": "12.40.0",
    "lucide-react": "^1.16.0",
    "tailwindcss": "^4.2.0",
    "shadcn": "^4.8.0"
  }
}
```

## Running Locally

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

Then visit `http://localhost:3000`

## Customization

### Change Colors
Edit color values in `app/globals.css`:
```css
--color-roar-orange: #FF4B1F;
--color-roar-black: #050505;
/* etc */
```

### Adjust Animation Speed
Modify animation duration in individual components:
```tsx
animate={{
  scale: [1, 1.2, 1],
  opacity: [0.05, 0.15, 0.05],
}}
transition={{ duration: 8, repeat: Infinity }} // Change 8 to desired duration
```

### Add Hero Section Image
In `components/home/hero-enhanced.tsx`, after the glow effects, add:
```tsx
<motion.img 
  src="/hero-image.png" 
  alt="Stadium" 
  className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 opacity-20"
/>
```

## Performance

- ✅ Lightweight animations using CSS and Framer Motion
- ✅ No heavy videos or images
- ✅ Optimized for mobile (no horizontal overflow)
- ✅ Clean semantic HTML
- ✅ Proper use of flexbox and grid layouts
- ✅ Responsive image placeholders

## Deployment

### Vercel
```bash
vercel deploy
```

### Other Platforms
The project is built with Next.js and can be deployed to any Node.js hosting platform.

## Notes

- All team initials and match data are hardcoded for demo. Replace with real data from your backend.
- The WhatsApp phone mockup is a design representation. Connect to actual WhatsApp API for real integration.
- The marquee ticker uses CSS animation for smooth, performance-friendly scrolling.
- All animations respect `prefers-reduced-motion` when using Framer Motion's accessibility features.

## Support

For questions about customization, contact the development team or refer to:
- [Next.js Docs](https://nextjs.org/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev)

---

**Last Updated**: June 2026
**Version**: 2.0 (Enhanced with Framer Motion)

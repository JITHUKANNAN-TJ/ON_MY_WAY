---
name: frontend-designer
description: Use when building new UI components, modifying layouts, changing styles, or implementing visual designs in the frontend. Knows the full design system, component library, and CSS conventions.
---

# Frontend Designer — ON MY WAY Design System

## Tech Stack
- React 18 + TypeScript + Vite 5
- Tailwind CSS 3.4
- react-router-dom v6
- react-leaflet (map components)
- No CSS-in-JS; all styling via Tailwind utility classes

## Design Tokens (from tailwind.config.js)

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| `background` | `#0B1121` | Page bg |
| `surface` | `#1A2332` | Cards, nav, panels |
| `primary` | `#10B981` | CTAs, active states, success |
| `secondary` | `#38BDF8` | Info, alt accents |
| `warning` | `#F59E0B` | Warnings |
| `danger` | `#EF4444` | Destructive actions, errors |
| `text` | `#FFFFFF` | Primary text |
| `text-secondary` | `#94A3B8` | Secondary/helper text |

### Border colors
Use `border-white/[0.06]` as default. `border-white/[0.04]` for subtler. `ring-white/[0.06]` for card rings.

### Typography
- Font: `Inter` (sans), `JetBrains Mono` / `Fira Code` (mono)
- Page titles: `text-4xl font-bold`
- Section headers: `text-xs font-medium uppercase tracking-wider text-text-secondary`

### Spacing & Radius
- Cards: `rounded-2xl p-6`, inner sections `rounded-xl`
- Modals: `rounded-2xl p-8 max-w-md`
- Buttons: `rounded-xl px-6 py-3` (lg), `px-3 py-2` (sm)
- Inputs: `rounded-xl px-4 py-3`

### Shadows
- `shadow-card`: `0 0 0 1px rgba(255,255,255,0.03), 0 2px 4px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.1)`
- `shadow-card-hover`: with `rgba(16,185,129,0.1)` ring
- `shadow-glow`: green glow for primary buttons
- Use `ring-1 ring-white/[0.06]` for subtle card outlines

### Animations
- `animate-fade-in`: fade + translateY(10px) → 0
- `animate-slide-up`: fade + translateY(30px) → 0
- `animate-scale-in`: scale 0.95 → 1
- `animate-ping-slow`: for status dots
- `animate-float`: floating elements (hero)

## Component Library (shadcn-style, hand-rolled)

### Reusable Components in `src/components/ui/`
| Component | Props | Notes |
|-----------|-------|-------|
| `Button` | `variant: primary|secondary|ghost|danger`, `size: sm|md|lg`, `loading?`, `leftIcon?`, `rightIcon?` | Uses `btn-primary`/`btn-secondary`/`btn-ghost`/`btn-danger` CSS classes |
| `Input` | `label?`, `error?`, `leftIcon?`, plus standard input attrs | Always show label above. Error shown as red text below |
| `Modal` | `open: boolean`, `onClose`, `children` | Returns null when closed. Uses useEffect to lock body scroll. Has close button. |
| `Badge` | `variant: primary|secondary`, `size: sm` | Small pill badges for roles |
| `Avatar` | `name: string`, `size: sm|md|lg` | Colored circle with initials |
| `StatusDot` | `status: ONLINE|OFFLINE|GPS_LOST|LEFT`, `size?`, `pulse?` | Green/yellow/red/gray dot |
| `PingBadge` | `latency: number \| null` | Shows ms with color coding |

### Layout Components in `src/components/layout/`
- `Navbar` — fixed top bar with glass effect when scrolled, logo + Create + Join links
- `Footer` — bottom footer

### Room Components in `src/components/room/`
- `RoomInfo` — room code + name + meeting point display
- `MemberList` — list of MemberCards
- `MemberCard` — avatar + name + role badge + distance/ETA
- `RoomControls` — Copy Link, End Room (host only), Leave Room
- `LocationInfo` — GPS coordinates, speed, heading, accuracy rows
- `ConnectionBanner` — connection state indicator
- `MeetingPointSetup` — map-based meeting point picker
- `ChatBox` — message list + input

### Map Components in `src/components/map/`
- `LiveMap` — full-screen Leaflet map with member markers, trails, meeting point, tile switcher, fullscreen toggle
- `MeetingPointMarker` — click-to-place marker for create/join forms

## CSS Conventions (`src/index.css`)

### Component utility classes (defined in `@layer components`)
```css
.glass           /* bg-surface/60 backdrop-blur-xl border border-white/[0.04] shadow-card */
.glass-strong    /* bg-surface/80 backdrop-blur-xl border border-white/[0.06] shadow-card */
.btn-primary     /* bg-primary text-background font-semibold rounded-xl + glow hover + scale active */
.btn-secondary   /* bg-secondary/10 text-secondary + hover fill */
.btn-ghost       /* text-text-secondary hover:text-text hover:bg-white/[0.04] */
.btn-danger      /* bg-danger/10 text-danger border-danger/20 + hover fill */
.input-field     /* bg-white/[0.03] border-white/[0.06] rounded-xl + focus ring */
.card            /* glass + rounded-2xl p-6 + hover shadow */
.text-gradient   /* gradient from primary via secondary to primary, animated */
```

### Leaflet overrides
- Map container uses `#0B1121` background
- Zoom controls use glass surface styling
- Attribution uses glass surface
- Popups use surface glass with border
- All overrides are in `index.css` under `.leaflet-*` classes

## State Management
- No global state library. Component-local state with `useState` + `useCallback`.
- `localStorage` for: `omw_session_id`, `omw_member_id`, `omw_display_name`, `omw_role`, `omw_tile_style`
- `useRoom` hook manages all room state; returns `room`, `members`, `myId`, `connectionState`, `latency`, `gpsError`, `leaveRoom`, `reportGpsLost`, `sendChatMessage`, `chatMessages`

## Routing (from App.tsx)
| Path | Component | Layout |
|------|-----------|--------|
| `/` | `LandingPage` | Navbar + Footer |
| `/create` | `CreateRoomPage` | Navbar + Footer |
| `/join` | `JoinRoomPage` | Navbar + Footer |
| `/room/:code` | `LiveRoomPage` | No navbar (own top bar) |

## Responsive Patterns
- Mobile-first: base styles for mobile, `lg:` breakpoint for desktop sidebar
- Sidebar: fixed overlay on mobile (`right-0 top-16 bottom-0`), `lg:relative` on desktop
- Navbar: `max-w-7xl mx-auto` container
- Maps: full height/width with `h-screen w-screen`
- Use `max-w-lg mx-auto` for form pages

## Icons
- All icons use inline SVGs from Heroicons (outline, strokeWidth={2})
- Standard sizing: `w-4 h-4`, `w-5 h-5`, `w-8 h-8`

## When building UI
1. Check if a matching UI component exists in `src/components/ui/` first
2. Use Tailwind utility classes — never add custom CSS unless absolutely necessary
3. Follow the existing glassmorphism aesthetic: glass surfaces, subtle borders, green accent, dark theme
4. Add `animate-fade-in` or `animate-slide-up` for new content appearing
5. Use `text-text-secondary` for secondary text, `text-text` for primary
6. Match the spacing rhythm: multiples of 4 (p-4, p-6, p-8, gap-2, gap-3, space-y-5)
7. Icons should be Heroicons outline style

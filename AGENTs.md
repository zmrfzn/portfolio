# AGENTs.md — Zameer Fouzan Portfolio: Project Knowledge Base

> Complete record of architecture, design decisions, research, and conventions for AI agents and future contributors.

---

## 1. Project Identity

| Field | Value |
|-------|-------|
| **Name** | `zameer-fouzan-portfolio` |
| **Version** | `2.0.0` |
| **Owner** | Zameer Fouzan — Lead Developer Relations Engineer |
| **Domain** | OpenTelemetry, Observability, Cloud-Native, AI/LLM |
| **Live URL** | https://zameerfouzan.pages.dev |
| **Repository** | `git@github.com:zmrfzn/portfolio.git` |
| **Linktree** | https://linktr.ee/zmrfzn |

---

## 2. Tech Stack & Architecture

### 2.1 Core Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **SSG** | Astro 5.x (`^5.0.0`) | Static output mode, zero-JS by default |
| **Styling** | Native CSS Variables | No Tailwind/utility frameworks; 1,091-line `global.css` |
| **Typography** | Google Fonts | `Inter` (body), `JetBrains Mono` (code/tags) |
| **Hosting** | Cloudflare Pages | Auto-deploy on push to `main` |
| **Edge Worker** | Cloudflare Worker | YouTube stats caching (`workers/yt-stats/`) |
| **Runtime** | Node.js v22.22.0 | Via fnm |
| **TypeScript** | Extends `astro/tsconfigs/base` | JSX config: `react-jsx`, `jsxImportSource: astro` |

### 2.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   BUILD TIME (Astro SSG)                │
│                                                         │
│  talks.json ──┐                                         │
│  videos.json ─┤──▶ index.astro ──▶ dist/index.html      │
│  components/ ─┘    (pre-computes all data)              │
│                                                         │
│  Outputs: Static HTML + CSS + minimal client JS         │
└──────────────────────┬──────────────────────────────────┘
                       │ Deploy
                       ▼
┌─────────────────────────────────────────────────────────┐
│               CLOUDFLARE PAGES (CDN)                    │
│                                                         │
│  Static site served globally                            │
│  Client JS hydrates YouTube view counts dynamically     │
└──────────────────────┬──────────────────────────────────┘
                       │ Fetch API
                       ▼
┌─────────────────────────────────────────────────────────┐
│          CLOUDFLARE WORKER: yt-stats                    │
│                                                         │
│  Cron: Every Monday 9:00 UTC                            │
│  YouTube Data API v3 ──▶ KV Store (7-day TTL)           │
│  GET / ──▶ Returns cached view counts as JSON           │
│  Fallback: returnyoutubedislikeapi.com (client-side)    │
└─────────────────────────────────────────────────────────┘
```

### 2.3 Hybrid Rendering Strategy

**Decision**: All pages are pre-rendered at build time. The only client-side JavaScript handles:
1. **Talk filtering** — tag/topic-based filtering with live count updates
2. **Theme toggle** — dark/light mode via `localStorage` + system preference fallback
3. **YouTube stats** — dynamic hydration of view counts from Cloudflare Worker
4. **Mobile nav** — hamburger menu toggle
5. **Scroll reveals** — `IntersectionObserver` for `.reveal-on-scroll` elements

**Rationale**: Maximizes performance (zero JS by default from Astro), while hydrating only the interactive parts that genuinely need runtime behavior.

---

## 3. Project Structure

```
Portfolio/
├── astro.config.mjs          # Astro config (static output, site URL, Vite CSS minify)
├── tsconfig.json              # TypeScript config (extends astro/tsconfigs/base)
├── package.json               # Astro 5 — sole dependency
├── GEMINI.md                  # Design system rules (always-on)
├── AGENT_INSTRUCTIONS.md      # Project context for AI agents
├── AGENTs.md                  # This file — comprehensive knowledge base
├── scratch_update.cjs         # One-off CSS migration script (border/shadow removal)
│
├── public/                    # Static assets (copied verbatim to dist/)
│   └── assets/
│       ├── public_image.jpg   # Profile photo
│       └── icons/
│           ├── globe.svg      # Generic web link icon
│           ├── linkedin.svg   # LinkedIn icon
│           ├── slides.svg     # Slide deck icon
│           └── youtube.svg    # Video/recording icon
│
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro   # HTML shell, <head>, meta tags, spotlight overlay, scroll observer
│   ├── pages/
│   │   ├── index.astro        # Main page — sticky sidebar layout (production)
│   │   └── bento.astro        # Alternate bento-box layout (experimental)
│   ├── components/
│   │   ├── Nav.astro          # Top navigation bar + mobile toggle
│   │   ├── Hero.astro         # Profile hero section (avatar, name, role, status)
│   │   ├── Stats.astro        # Key metrics grid (talks, practitioners, countries, years)
│   │   ├── About.astro        # Bio section
│   │   ├── Timeline.astro     # Year-grouped <details> accordion for talks
│   │   ├── TalkCard.astro     # Individual talk card (title, event, badges, links)
│   │   ├── TopicCard.astro    # Expertise topic summary card (bento-style)
│   │   ├── VideoCard.astro    # YouTube video embed card
│   │   └── Footer.astro       # Site footer
│   ├── data/
│   │   ├── talks.json         # All talks/events — single source of truth (641 lines)
│   │   └── videos.json        # 8 featured YouTube recordings
│   ├── scripts/
│   │   └── main.js            # Client-side: theme, filters, YT stats, mobile nav
│   └── styles/
│       └── global.css         # Complete CSS — variables, components, responsive (1,091 lines)
│
├── workers/
│   └── yt-stats/              # Cloudflare Worker (separate project)
│       ├── wrangler.toml      # Worker config: cron, KV binding, CORS
│       ├── package.json       # Wrangler + TS dev dependencies
│       └── src/index.ts       # Worker logic: YouTube API → KV cache → JSON response
│
└── dist/                      # Build output (not committed)
```

---

## 4. Design System

> Codified in [`GEMINI.md`](file:///d:/workspace/Portfolio/GEMINI.md) — enforced as an always-on rule.

### 4.1 Color Palette — "Warm & Approachable"

#### Dark Mode (Default)

| Variable | Value | Purpose |
|----------|-------|---------|
| `--bg-primary` | `#0a0e10` | Deep Teal/Charcoal base |
| `--bg-secondary` | `#101619` | Secondary background |
| `--bg-card` | `#151d21` | Card surfaces (teal-tinted) |
| `--bg-card-hover` | `#1b252a` | Card hover state |
| `--text-primary` | `#f0f4f8` | Primary text (Ice) |
| `--text-secondary` | `#a3b8c2` | Secondary text (Slate) |
| `--text-muted` | `#6e848e` | Muted text |
| `--accent` | `#ff9e79` | Digital Peach (primary accent) |
| `--accent-hover` | `#ffb599` | Accent hover |
| `--accent-indigo` | `#5c67ff` | Indigo (CTAs, secondary accent) |

#### Light Mode ("Restorative Neutrals")

| Variable | Value | Purpose |
|----------|-------|---------|
| `--bg-primary` | `#fdfaf6` | Limestone/Bone White |
| `--bg-secondary` | `#f4efe8` | Secondary background |
| `--bg-card` | `#f8f4ed` | Warm card surface |
| `--bg-card-hover` | `#ffffff` | Card hover (pure white) |
| `--accent` | `#e56b3d` | Deeper Peach (higher contrast) |
| `--accent-indigo` | `#4f46e5` | Indigo (adjusted for light bg) |

### 4.2 Core Design Principles

1. **Borderless & Flat Architecture**
   - ❌ No `border: 1px solid var(--border)` on interactive elements
   - ❌ No `transform: translateY(-Xpx)` or pseudo-3D drop shadows on hover
   - ✅ Background contrast differentiation (`--bg-primary` vs `--bg-card`)
   - ✅ Clean opacity transitions (`opacity: 0.95`) or subtle background shifts

2. **Bento-Box Layouts**
   - Varied-size interlocking tiles preferred over uniform grids
   - Used for: Stats grid, Topic cards, Video cards

3. **Sticky Sidebar** (desktop ≥ 900px)
   - Left column (350px, `position: sticky`, `top: 100px`) holds: Hero, Stats, About
   - Right main column scrolls independently: Speaking, Topics, Videos, Contact CTA

4. **Spotlight Backdrop**
   - `#spotlight-overlay` — full-page dimming overlay
   - Activated when Timeline accordion groups expand
   - Click-to-dismiss: closes all open `<details>` groups

5. **Scroll Reveals**
   - `.reveal-on-scroll` class → `IntersectionObserver` → `.is-revealed`
   - Smooth fade + slide-up animation on viewport entry

6. **Massive CTAs**
   - Action-oriented language: "Let's Build Together"
   - Styled in bold Indigo (`--accent-indigo`)
   - Placed contextually at journey endpoints

---

## 5. Data Architecture

### 5.1 talks.json — Single Source of Truth

Each talk entry follows this schema:

```json
{
  "id": "unique-slug",
  "title": "Talk Title",
  "event": "Conference Name",
  "date": "Mon YYYY",
  "year": 2026,
  "location": "City, Country",
  "tags": ["talk", "keynote", "international", "workshop", "online", "panel"],
  "topics": ["opentelemetry", "aws", "adot", "kubernetes", "observability", "ai-llm", "security", "azure", "agentic"],
  "links": {
    "video": "https://youtube.com/...",
    "slides": "https://slides.com/...",
    "linkedin": "https://linkedin.com/...",
    "event": "https://event-url.com/..."
  }
}
```

**Build-time computations** from `talks.json`:
- **Tag counts**: Filter pill counts (All, Keynote, International, Workshop, Talk, Online, Panel)
- **Topic metrics per category**: talk count, event count, keynotes, workshops, start year, unique conferences
- **Geographic data**: Country extraction for the stats section
- **Year grouping**: For Timeline accordion

### 5.2 videos.json — Featured Recordings

```json
{
  "id": "youtubeVideoId",
  "title": "Video Title",
  "event": "Conference Name",
  "badge": "Keynote" | null
}
```

8 featured videos currently tracked. View counts hydrated client-side.

### 5.3 Link Icon Mapping Convention

| Icon File | Usage |
|-----------|-------|
| `youtube.svg` | Video/recording links |
| `linkedin.svg` | LinkedIn URLs |
| `globe.svg` | Generic web links |
| `slides.svg` | Slide deck links |

---

## 6. Cloudflare Worker: yt-stats

| Setting | Value |
|---------|-------|
| **Name** | `yt-stats` |
| **URL** | `https://yt-stats.zmrfzn.workers.dev` |
| **Cron** | `0 9 * * 1` (Monday 9:00 UTC) |
| **KV Binding** | `YT_CACHE` |
| **Secret** | `YT_API_KEY` (YouTube Data API v3) |
| **TTL** | 604,800 seconds (7 days) |
| **CORS** | `*` (open for dev; ideally restricted to `zameerfouzan.pages.dev`) |
| **Deploy** | `cd workers/yt-stats && npx wrangler deploy` |

**Flow**:
1. Cron fires weekly → fetches YouTube Data API v3 → stores in KV
2. Client `GET /` → returns cached KV data as JSON
3. Cache miss → live fetch → store → respond
4. If worker fails → client falls back to `returnyoutubedislikeapi.com` batch API

**Tracked Video IDs**: `gZtnKmbtecY`, `H4V107K-xTU`, `NkJefYSVxfE`, `a501tgQzc6Y`, `figFMgvOhdk`, `awTp7rF_1PE`, `fLptS-w0Tyk`, `78C7gujwGO8`

---

## 7. Component Architecture

### 7.1 Layout Hierarchy

```
BaseLayout.astro
├── <head> (meta, fonts, styles)
├── <body>
│   ├── #spotlight-overlay (dimming backdrop)
│   ├── <slot /> ← page content injected here
│   └── <script> IntersectionObserver for .reveal-on-scroll
│
index.astro (uses BaseLayout)
├── Nav
├── .layout-split (desktop ≥ 900px)
│   ├── .layout-sidebar (sticky)
│   │   ├── Hero (avatar, name, role, status badge)
│   │   ├── Stats (talks, practitioners, countries, years)
│   │   └── About (bio paragraph)
│   └── .layout-main
│       ├── #speaking → Tag Filters + Timeline
│       ├── #topics → TopicCard grid + Conference pills + YT chips
│       ├── #videos → VideoCard grid
│       └── #contact → CTA block → Linktree
└── Footer
```

### 7.2 Key Component Details

| Component | Purpose | Notes |
|-----------|---------|-------|
| **Timeline.astro** | Year-grouped talk accordion | Native `<details>`/`<summary>`, synced with spotlight overlay, first 2 years open by default |
| **TalkCard.astro** | Individual talk card | Title, event, date, location, tag badges, outbound links with SVG icons |
| **TopicCard.astro** | Expertise summary | Bento-style: talk count, events, highlights, start year. Clicking filters Timeline |
| **VideoCard.astro** | YouTube embed | Thumbnail + title + event badge, links to YouTube |
| **Stats.astro** | Key metrics | Dynamic count from talks.json: engagements, practitioners, countries, years |
| **Hero.astro** | Profile section | Avatar (100×100px in sidebar), name, role, green "Available" status dot |

### 7.3 Sidebar Layout Adaptations

When rendering inside the sticky sidebar (350px), several components required overrides:
- **Hero**: Flex direction → column, avatar shrunk to 100×100px
- **Stats**: Grid → 2 columns, 12px gap, compact 16px padding
- **About**: Body text → `0.85rem` to prevent excessive sidebar height
- **Main container**: Removed fixed max-width to expand naturally

---

## 8. Evolution History & Decisions

### Phase 1: Foundation (Feb 15, 2026)

| Commit | Decision |
|--------|----------|
| `f02dc78` | **Initial site** — minimalist speaker portfolio |
| `a0fad26` | **Data-driven approach**: Moved all talks to `talks.json`, added collapsible sections + tag filters |
| `0f354d8` | Added profile photo |
| `44000a2` | **Key decision**: Replaced self-claimed expertise bars with an evidence-based system computed from `talks.json` |
| `25efd97` | Fixed talk data, added proper link icons (globe, youtube, slides, linkedin SVGs) |

### Phase 2: Feature Expansion (Feb 16-17, 2026)

| Commit | Decision |
|--------|----------|
| `52e868c` | Added ADOT topic, colored icons, data-driven video section, UX enhancements |
| `0a6136b` | **Major refactor**: Migrated to Astro 5.x |
| `f570f57` | **Build fix**: Removed root Wrangler dependency to fix Cloudflare build detection |
| `12a3bb9` | Updated site URL to new Cloudflare Pages domain (`zameerfouzan.pages.dev`) |
| `27fcc01` | Configured yt-stats worker with real KV namespace ID |

### Phase 3: Content Update (Apr 2026)

| Commit | Decision |
|--------|----------|
| `b1ba730` | Added Experts Live India 2026 talk — Microsoft Agent Framework |

### Phase 4: Complete UI/UX Overhaul (Aug 25, 2026)

This was a major design system overhaul in a single day, with 10 commits refining the vision:

| Commit | Decision |
|--------|----------|
| `b23a7db` | Cleanup pass |
| `14e6f49` | **Major overhaul**: New warm color palette, Timeline component, Bento + Sticky layouts, massive CTAs. This established the current design system. |
| `9b967b3` | Refined bento layout: year-grouped timeline, all videos shown, sticky headers, compact cards |
| `898e2d4` | **Enforced flat design**: Resolved interaction bugs, stripped remaining 3D effects |
| `051ec50` | Simplified timeline interactions, dimmed videos on hover, styled custom scrollbars |
| `e624dc8` | Refined timeline styles, added talk card accent line |
| `aac90fd` | Fixed z-index overlap between timeline overlay and sticky headers |
| `d9c6c9c` | Resolved contact section redundancy and contrast issues |
| `b89352f` | Synced CTA block design to sticky layout |
| `96a13db` | **Final audit**: Timeline defaults (first 2 years open), scrollbar theming, topic card contrast, CTA colors, migrated `.fade-in` → `.reveal-on-scroll` |

---

## 9. Key Design Decisions & Rationale

### 9.1 Evidence-Based Expertise (not self-claimed)

**Decision**: Replace subjective skill-level progress bars with data computed from `talks.json`.

**Rationale**: Self-claimed "90% expert in Kubernetes" bars are meaningless. Instead, each topic card shows verifiable metrics: number of talks delivered, unique conferences, keynotes, workshops, and the year the speaker started presenting on that topic.

### 9.2 Sticky Sidebar over Full-Width Scroll

**Decision**: Desktop layout splits into a sticky left sidebar (profile, stats, about) and a scrollable right main area.

**Rationale**: Keeps the speaker's identity and key metrics always visible while users explore the talk history — critical for a portfolio where "who is this person?" context should never scroll away.

### 9.3 Native `<details>` for Timeline (not custom accordion JS)

**Decision**: Use semantic HTML5 `<details>`/`<summary>` elements for the year-grouped Timeline.

**Rationale**: Zero-JS accordion behavior. Native browser support. Accessible by default. Avoids framework-specific accordion libraries.

### 9.4 Borderless Flat Design

**Decision**: Strip all borders and 3D hover effects. Use background contrast and opacity transitions exclusively.

**Rationale**: Creates a modern, premium feel. Borders add visual noise on dark themes. The `scratch_update.cjs` migration script was written to programmatically remove all border and translateY patterns from the CSS.

### 9.5 Warm Color Palette over Cool Blue/Gray

**Decision**: Digital Peach (`#ff9e79`) + Indigo (`#5c67ff`) over typical developer blue/gray themes.

**Rationale**: A DevRel portfolio should feel warm and approachable, not cold and corporate. The warm tones create emotional resonance while still feeling technical through the dark teal base.

### 9.6 Cloudflare Worker for YouTube Stats

**Decision**: Cache YouTube view counts server-side via a Cloudflare Worker with KV store, rather than calling the YouTube API directly from the client.

**Rationale**: YouTube Data API has strict quotas and rate limits. A weekly cron refresh into KV provides instant responses without quota concerns. The client-side fallback to `returnyoutubedislikeapi.com` ensures graceful degradation.

### 9.7 No Resume on Site

**Decision**: The portfolio deliberately omits work history/resume content.

**Rationale**: LinkedIn handles professional history. This site is specifically for the speaking/community portfolio — a focused narrative rather than a generic resume dump. Linktree serves as the unified contact CTA.

### 9.8 Two Layout Variants

**Decision**: Maintain both `index.astro` (sticky sidebar) and `bento.astro` (bento box) layouts.

**Rationale**: The sticky sidebar layout (`index.astro`) is the production default. `bento.astro` exists as an experimental alternate layout for A/B testing or future design exploration.

---

## 10. Build & Deployment

### Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Astro dev server |
| `npm run build` | Build static site to `dist/` |
| `npm run preview` | Preview production build locally |

### Cloudflare Pages Settings

| Setting | Value |
|---------|-------|
| **Framework** | Astro |
| **Build command** | `npm run build` |
| **Output directory** | `dist` |
| **Branch** | `main` (auto-deploy on push) |
| **Backup branch** | `backup-main` (pre-Astro legacy) |

### Worker Deployment

```bash
cd workers/yt-stats && npx wrangler deploy
```

---

## 11. Known Gotchas & Conventions

### TypeScript in Astro Templates
❌ Do NOT use TypeScript type assertions (e.g., `as Array<...>`) inside Astro template expressions.
✅ Move complex typing to the frontmatter block. esbuild cannot parse inline TS casts in JSX.

### CSS Architecture
- All styles live in a single `global.css` file (no CSS modules or scoped styles)
- CSS variables power theming — changes to the palette propagate automatically
- `data-theme="dark"` is the default on `<html>`; toggled to `"light"` by JS

### Adding New Talks
1. Add entry to `src/data/talks.json` following the schema in §5.1
2. All stats, topics, and filters auto-compute at build time
3. If the talk has a recorded video, add to `src/data/videos.json` and update `VIDEO_IDS` array in `workers/yt-stats/src/index.ts`

### Adding New Topics
1. Add the topic slug to relevant talk entries in `talks.json`
2. The topic grid in `index.astro` auto-generates cards based on the `TOPIC_CONFIG` map
3. Ensure the topic has a matching label, icon, and color defined in `index.astro` frontmatter

---

## 12. Content Summary (as of Nov 2026)

| Metric | Value |
|--------|-------|
| **Total talks in data** | ~30 entries spanning 2023–2026 |
| **Featured videos** | 8 YouTube recordings |
| **Topic categories** | 7+ (OpenTelemetry, AWS, ADOT, Kubernetes, Observability, AI/LLM, Security, Azure, Agentic) |
| **Tag types** | 7 (talk, keynote, international, workshop, online, panel, all) |
| **Countries reached** | Multiple (India, Singapore, Malaysia, etc.) |
| **Git commits** | 21 total |
| **CSS lines** | 1,091 |
| **talks.json lines** | 641 |

---

## 13. File Quick Reference

| File | What to edit |
|------|-------------|
| [`src/data/talks.json`](file:///d:/workspace/Portfolio/src/data/talks.json) | Add/update talk entries |
| [`src/data/videos.json`](file:///d:/workspace/Portfolio/src/data/videos.json) | Add/update featured videos |
| [`src/styles/global.css`](file:///d:/workspace/Portfolio/src/styles/global.css) | All styling & theme variables |
| [`src/pages/index.astro`](file:///d:/workspace/Portfolio/src/pages/index.astro) | Main page layout & build-time logic |
| [`src/scripts/main.js`](file:///d:/workspace/Portfolio/src/scripts/main.js) | Client-side interactivity |
| [`GEMINI.md`](file:///d:/workspace/Portfolio/GEMINI.md) | Design system rules |
| [`AGENT_INSTRUCTIONS.md`](file:///d:/workspace/Portfolio/AGENT_INSTRUCTIONS.md) | Quick-start project context |
| [`workers/yt-stats/src/index.ts`](file:///d:/workspace/Portfolio/workers/yt-stats/src/index.ts) | YouTube stats worker logic |
| [`astro.config.mjs`](file:///d:/workspace/Portfolio/astro.config.mjs) | Astro build configuration |

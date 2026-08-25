---
description: UX/UI design system and rules for the Zameer Fouzan Portfolio
trigger: always_on
---

# Portfolio Design System & Guidelines

Follow these strict UI guidelines whenever adding or modifying components in this portfolio:

## 1. Color Palette (Warm & Approachable)
- **Dark Mode**: 
  - Backgrounds: Deep Teal/Charcoal (`--bg-primary`, `--bg-secondary`)
  - Cards: Deep Chocolate/Teal tinted (`--bg-card`, `--bg-card-hover`)
  - Accents: Digital Peach (`--accent`) and Indigo (`--accent-indigo`).
- **Light Mode**: 
  - Backgrounds: Limestone/Bone White (`--bg-primary`).

## 2. Borderless & Flat Architecture
- **NO BORDERS**: Do not use `border: 1px solid var(--border)` on interactive elements, cards, or buttons. Use subtle background contrast to differentiate elements (e.g., `--bg-primary` vs `--bg-card`).
- **FLAT HOVER STATES**: Do not use `transform: translateY(-Xpx)` or pseudo-3D drop shadows on hover. Instead, use clean opacity transitions (`opacity: 0.95`) or subtle background shifts.

## 3. Layouts & Grids
- **Bento-Box**: When building grids (like stats or videos), prefer varied-size interlocking tiles over uniform lists.
- **Sticky Sidebars**: Use sticky positioning for navigation or profile summaries to keep context visible during long scrolls.

## 4. Interactions
- **Spotlight Backdrop**: Use the `.spotlight-overlay` to dim the page when high-focus elements (like an expanded Timeline accordion) are active.
- **Scroll Reveals**: Use the `.reveal-on-scroll` class to smoothly fade and slide elements in as they enter the viewport.

## 5. CTAs
- Make CTAs massive, action-oriented (e.g., "Let's Build Together"), and placed contextually at the end of journeys.

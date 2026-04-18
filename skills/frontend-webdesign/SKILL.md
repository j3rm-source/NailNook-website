---
name: frontend-webdesign
description: Use when building any frontend UI — components, pages, landing pages, booking flows, admin panels, or full applications. Triggers when the user asks to create, redesign, or improve any visual interface.
---

# Frontend Web Design

## Overview

Build production-grade, visually distinctive frontend interfaces. The goal is intentional aesthetic execution — not decoration, not defaults. Every design decision must serve the context.

**The enemy is "AI slop":** generic fonts, purple gradients, predictable layouts, cookie-cutter components with no point-of-view.

## Design Thinking (do this before writing any code)

Commit to answers for all four before touching the keyboard:

1. **Purpose** — What problem does this solve? Who uses it?
2. **Tone** — Pick an extreme and own it. Options include:
   - Brutally minimal / Swiss grid
   - Maximalist / editorial / layered
   - Retro-futuristic / synthwave
   - Organic / natural / soft
   - Luxury / refined / high-end
   - Playful / toy-like / bouncy
   - Brutalist / raw / raw HTML vibes
   - Art deco / geometric / ornamental
   - Industrial / utilitarian / dashboard
3. **Differentiation** — One sentence: what will someone remember about this?
4. **Constraints** — Framework (HTML/React/Vue), performance requirements, accessibility needs

## Typography Rules

- **Never use:** Inter, Roboto, Arial, system-ui, system fonts as primary display typefaces
- **Always pair:** a distinctive display font + a refined body font
- Source from Google Fonts, Adobe Fonts, or self-hosted
- Good starting point categories: slab serifs, variable display fonts, geometric grotesques with personality, editorial serif/sans pairs
- The font choice should feel *designed for this context*, not the default

## Color & Theme

- Commit to a palette — don't hedge with neutral-everything
- Use CSS custom properties for every color, spacing, and radius value
- Dominant hue + sharp accent outperforms even distributions
- Background ≠ solid white or solid black by default — explore gradient meshes, tinted surfaces, noise textures

## Motion & Animation

- Prioritize CSS-only for HTML projects
- One well-orchestrated page load (staggered `animation-delay` reveals) > scattered micro-interactions everywhere
- Hover states should *surprise* — scale, clip-path, color shift, underline draw
- Scroll-triggered reveals for content sections
- Loading states should be beautiful, not just spinners

## Spatial Composition

Think beyond left-to-right, top-to-bottom grid:
- Asymmetric layouts
- Overlapping elements
- Grid-breaking hero text
- Diagonal dividers or clip-path sections
- Dense information design OR generous negative space — never both at once

## Visual Atmosphere

Go beyond solid backgrounds:
- Gradient meshes (multiple radial gradients layered)
- SVG noise/grain overlay at low opacity
- Geometric decorative patterns
- Layered transparencies and backdrop-filter blur
- Dramatic drop shadows or colored glows
- Decorative borders, ruled lines, ornamental separators
- Custom cursor for special-purpose UIs

## Implementation Guidance

**HTML/CSS/JS projects:**
- Use CSS custom properties for the entire design system
- Build mobile-first, test at 375px and 1440px minimums
- All animations via `@keyframes` or `transition`
- Fonts via `<link>` preconnect + Google Fonts or `@font-face`

**React projects:**
- Use the Motion library (`framer-motion`) for orchestrated animations
- CSS Modules or Tailwind with a custom config for design tokens
- Keep layout and typography in CSS, behavior in JS

**Both:**
- No inline styles except truly one-off values
- Semantic HTML elements (`<nav>`, `<main>`, `<section>`, `<article>`, `<figure>`)
- ARIA labels on interactive elements without visible text labels

## Quick Reference: What to Vary

Each design should make different choices across these axes — never converge:

| Axis | Options |
|------|---------|
| Theme | Light / Dark / Tinted |
| Display font | Serif / Sans / Slab / Display |
| Layout | Grid / Asymmetric / Magazine / Overlap |
| Motion | Subtle / Dramatic / None |
| Color | Monochromatic / High contrast / Muted / Vivid |
| Density | Spacious / Dense |
| Background | Solid / Gradient / Textured / Illustrated |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Using Inter/Roboto as display font | Pick a typeface with character |
| Purple-gradient-on-white hero | Commit to a non-default color story |
| Every section looks the same | Alternate background color, layout direction, or density per section |
| Animations on everything | One orchestrated entrance, targeted hover states only |
| Same font size for everything | Build a clear typographic scale (xs → 5xl) |
| Shadows look flat | Use multi-layer shadows or colored shadows |
| Mobile as afterthought | Build mobile-first, test at 375px |

## The Standard

Before shipping: would a senior designer who's never seen this codebase look at this and say *"someone made a deliberate creative choice here"*? If the answer is no — redesign.

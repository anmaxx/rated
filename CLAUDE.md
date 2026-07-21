# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page marketing site for **Rated Tattoo** (a Russian-language tattoo studio). It is built with **Vite** (React 18 + `@vitejs/plugin-react`) and deployed as a static site to GitHub Pages. There is no test suite.

> History: the site used to ship `@babel/standalone` and transpile JSX **in the browser** at load time (no build step). It was migrated to Vite to drop that ~644 KB per-visit cost and to get build-time error checking. If you see references to `text/babel` scripts or `python3 -m http.server`, they are stale.

## Running locally

```bash
npm install        # first time
npm run dev        # Vite dev server with HMR
npm run build      # production build → dist/
npm run preview    # serve the built dist/ locally
```

Vite's dev server handles module loading and HMR — no more `?nocache` dance, and JSX syntax errors surface at dev/build time, not only in the browser console.

## How the page is assembled

`index.html` (repo root) is the Vite entry. Its only script is `<script type="module" src="/src/main.jsx">`; the rest of the shell (SEO meta, JSON-LD, Yandex.Metrika, the inline `<style>` block, `<link rel="stylesheet" href="/styles.css">`) is preserved verbatim.

`src/main.jsx` is the entry module. **Load order is deliberate and must be preserved:**
1. `import React` + `import { createRoot }` — React is bundled from npm, not a CDN.
2. `window.React = React` — `_ds_bundle.js` calls a **global** `React.createElement`, so React must be on `window` before it runs.
3. `await import("../_ds_bundle.js")` (dynamic) — attaches components to `window.RatedTattooDesignSystem_04b525`.
4. `import("./app.jsx")` — `App()` composes the sections. `sections.jsx` reads the DS namespace at module-eval time, so it must load **after** step 3; the dynamic-import chain guarantees that.

`sections.jsx` (repo root) `import`s React and `export`s the 13 section components that `src/app.jsx` consumes.

## The design-system bundle (`_ds_bundle.js`) — read before editing

This file is **generated**, not hand-authored. Its header comment (`@ds-bundle: {...}`) lists the source components (`components/core/Button.jsx`, `components/forms/Accordion.jsx`, etc.) and their `sourceHashes`. Those source files are **not in this repo** — they live in an external design-system project and are bundled here. Treat `_ds_bundle.js` as a build artifact:

- Don't hand-edit components in it; changes will be lost when it's regenerated. Component fixes belong upstream.
- It attaches all components to a single global: `window.RatedTattooDesignSystem_04b525`. The `_04b525` suffix is part of the namespace. `sections.jsx` reads it via `const NS = window.RatedTattooDesignSystem_04b525`. **If the bundle is regenerated with a different namespace suffix, update that line in `sections.jsx` to match**, or the page renders nothing.
- Exposed components: `Button`, `Badge`, `Card`, `Input`, `Accordion`, `StarRating`, `PortfolioCard`, `ServiceCard`, `TestimonialCard`, `SectionHeading`.
- Under Vite it is pulled in by a dynamic `import()` in `src/main.jsx` (**after** `window.React` is set) and `exclude`d from `@vitejs/plugin-react` in `vite.config.js` — it's precompiled to `React.createElement`, so there's no JSX to transform and no Fast Refresh to inject.
- The bundle also inlines its own copy of an upstream `sections.jsx` that uses `../../assets/...` paths. The **repo-root `sections.jsx` is the one actually rendered**, and it uses `./assets/...` paths. Edit the root file.

## Where to make changes

- **Page content / layout / new sections** → `sections.jsx`. Each `function X()` is one full-viewport panel (`Hero`, `About`, `Works`, `Services`, `Benefits`, `Testimonials`, `Faq`, `Cta`, `Footer`, plus `Header`, `DotNav`, `BookingModal`). Panels are wired together in `App()` in `src/app.jsx` (moved out of `index.html` in the Vite migration). A new section must also be added to the `export {…}` list at the bottom of `sections.jsx` **and** imported in `src/app.jsx`.
- **Styling** → CSS custom properties in `public/tokens/`, aggregated by `public/styles.css` (an `@import` manifest, the only stylesheet `index.html` links). Files: `colors.css`, `typography.css`, `spacing.css`, `fonts.css`, `base.css`. CSS is served as a static passthrough from `public/` (Vite does not process it), so the `@import` chain and `url(../assets/fonts/…)` paths stay relative. Components and sections style almost exclusively via `var(--token)` inline styles — **change a design value at the token, not at the call site**.
- Section-specific behavior (scroll-snap, film grain, entrance reveals, responsive breakpoints) lives in the inline `<style>` block in `index.html`, keyed off `rt-` class names (`rt-snap`, `rt-grain`, `rt-reveal`/`rt-in`, `rt-reviews-grid`).
- The **Works** gallery is a custom drag/arrow carousel driven by a `requestAnimationFrame` loop in `sections.jsx` (CSS `transform` + modulo for seamless infinite looping), **not** a CSS marquee.
- The **booking form** (`BookingModal` in `sections.jsx`) submits to Formspree via the `FORMSPREE_ENDPOINT` constant. Change that constant to redirect where leads are delivered.

## Conventions and constraints

- **Russian (Cyrillic) is the content language.** Headings use **Oswald**, not Facon — `facon.otf` (the custom "RATED" logotype face) has no Cyrillic glyphs and is reserved for the Latin logotype via `--font-logo`.
- Single-screen scroll-snap experience: sections are `min-height: 100vh` with `class="rt-snap"` and section `id`s that `DotNav` and the header nav anchor to.
- Entrance animation: add `className="rt-reveal"`; an `IntersectionObserver` in `App()` adds `rt-in` when the element scrolls into view.

## Deployment

`.github/workflows/static.yml` runs on push to **`master`** (or `workflow_dispatch`): it does `npm ci`, `npm run build`, and deploys **`dist/`** to GitHub Pages. The live site is **ratedtattoo.ru** (custom domain via `public/CNAME`). Only `dist/` is published — `CLAUDE.md` and other dev files stay out of the artifact automatically (no more `rm -f CLAUDE.md` step).

Static passthrough files live in **`public/`** (`styles.css`, `tokens/`, `assets/`, `CNAME`, `robots.txt`, `sitemap.xml`, the Yandex-verification HTML, `.nojekyll`); Vite copies them into `dist/` verbatim. `_ds_bundle.js` is now bundled into a hashed `/assets/…` chunk, so the old Jekyll `_`-prefix problem is gone — `.nojekyll` is kept in `public/` only as a safeguard.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page marketing site for **Rated Tattoo** (a Russian-language tattoo studio). It is built with **Vite** (React 18 + `@vitejs/plugin-react`) and deployed as a static site to GitHub Pages. There is no test suite.

> History: the site used to ship `@babel/standalone` and transpile JSX **in the browser** at load time (no build step). It was migrated to Vite to drop that ~644 KB per-visit cost and to get build-time error checking. If you see references to `text/babel` scripts or `python3 -m http.server`, they are stale.

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
- Under Vite it is pulled in by a dynamic `import()` in `src/main.jsx` (**after** `window.React` is set) and `exclude`d from `@vitejs/plugin-react` in `vite.config.js` — it's precompiled to `React.createElement`, so there's no JSX to transform and no Fast Refresh to inject.
- The bundle also inlines its own copy of an upstream `sections.jsx` that uses `../../assets/...` paths. The **repo-root `sections.jsx` is the one actually rendered**, and it uses `./assets/...` paths. Edit the root file.

## Where to make changes

- **Page content / layout / new sections** → `sections.jsx`. Each `function X()` is one full-viewport panel. Panels are wired together in `App()` in `src/app.jsx` (moved out of `index.html` in the Vite migration). A new section must also be added to the `export {…}` list at the bottom of `sections.jsx` **and** imported in `src/app.jsx`.
- **Styling** → CSS custom properties in `public/tokens/`, aggregated by `public/styles.css` (an `@import` manifest, the only stylesheet `index.html` links). CSS is served as a static passthrough from `public/` (Vite does not process it), so the `@import` chain and `url(../assets/fonts/…)` paths stay relative. Components and sections style almost exclusively via `var(--token)` inline styles — **change a design value at the token, not at the call site**.
- Section-specific behavior (scroll-snap, film grain, responsive breakpoints) lives in the inline `<style>` block in `index.html`, keyed off `rt-` class names (`rt-snap`, `rt-grain`, `rt-reviews-grid`). **Animation belongs in `sections.jsx`, not here** — see *Animation* below.
- The **Works** gallery is a custom drag/arrow carousel in `sections.jsx`: a state machine over a `useRef` store, stepped by `useAnimationFrame` (Motion) and writing `track.style.transform` directly (`translate3d` + modulo for seamless infinite looping). **Not** a CSS marquee. Drag/wheel/inertia stay on native pointer events — Motion's `drag` can't do the seamless modulo without a regression.
- The **booking form** (`BookingModal` in `sections.jsx`) submits to Formspree via the `FORMSPREE_ENDPOINT` constant. Change that constant to redirect where leads are delivered.

## Conventions and constraints

- **Russian (Cyrillic) is the content language.** Headings use **Oswald**, not Facon — `facon.otf` (the custom "RATED" logotype face) has no Cyrillic glyphs and is reserved for the Latin logotype via `--font-logo`.
- Single-screen scroll-snap experience: sections are `min-height: 100vh` with `class="rt-snap"` and section `id`s that `DotNav` and the header nav anchor to.

## Animation — Motion for React

Animation runs on **Motion** (`motion@12`, imported from `motion/react`). The shared pieces live at the top of `sections.jsx`; use them instead of writing a CSS `transition` or a bare `requestAnimationFrame` loop.

- **Entrance reveal:** `<motion.div {...useReveal()} …>`. The hook supplies `initial`/`whileInView`/`viewport:{once:true,amount:0.15}`/`transition:{duration:1,ease:EASE_OUT}` — no wrapper element, so layout is unchanged, and any layout-bearing `className`/`style` on the element must be kept. There is **no** `rt-reveal` class and no `IntersectionObserver` in `App()` any more. Hero is a deliberate carve-out: a plain `<div>`, visible immediately (it's the LCP element).
- **Easing constants:** `EASE_OUT = [0.22,1,0.36,1]` (= `var(--ease-out)`) and `EASE_CSS = [0.25,0.1,0.25,1]` (= the CSS keyword `ease`). Motion's default curve is neither — when you port an existing CSS `transition`, pass the ease explicitly or the timing silently changes.
- **Reduced motion:** `usePrefersReducedMotion()` (own `useSyncExternalStore` + `matchMedia` subscription). **Do not use `useReducedMotion()` from `motion/react`** — in Motion 12 it reads the value once and never updates, so a live toggle stops working. Under reduced motion pass `initial: reduced ? false : {…}` as well as `duration: 0`: a zero duration kills the animation but still paints the start frame.
- **Modals** (`WorkLightbox`, `BookingModal`) animate through `AnimatePresence`, so they never `return null` — the conditional is the *child*. Shared props come from `useModalMotion()`. The scroll lock is released in `onExitComplete`, not at the start of the exit.
- **Hovers:** the three multi-element ones (work tile, service row, DotNav dot→label) use parent `variants` (`initial="rest" animate="rest" whileHover="hover"`) propagating to children. Colors must be resolved to literals (`C_ACCENT`/`C_FAINT`/`C_MUTED`/`C_BONE`) — Motion can't interpolate `var()`. Simple `<a>` colour hovers stay on CSS: the global `a{transition:color}` would fight Motion's per-frame writes.
- **Deliberately NOT on Motion:** Vaul's drawer (own animation), the REC dot and equalizer (`@keyframes rt-pulse`/`rt-eq` — infinite compositor loops, cheaper than a JS driver), carousel drag/wheel, scroll-snap, film grain, `:focus-visible`.
- No test runner: animation changes are verified in the browser via chrome-devtools MCP. Read `docs/animation-motion-migration.md` §10/§10.1 first — it has the acceptance tolerances and a list of measurement traps (WAAPI vs inline styles, rAF throttling in background tabs, React's synthesized `mouseenter`) that each cost a false regression.

## Deployment

Pushing to **`master`** deploys straight to the live site, **ratedtattoo.ru** (`.github/workflows/static.yml`: `npm ci` → `npm run build` → publish `dist/` on Node 22). Only `dist/` is published — `CLAUDE.md` and other dev files stay out of the artifact automatically (no more `rm -f CLAUDE.md` step).

Static passthrough files live in **`public/`**; Vite copies them into `dist/` verbatim. `_ds_bundle.js` is now bundled into a hashed `/assets/…` chunk, so the old Jekyll `_`-prefix problem is gone — `.nojekyll` is kept in `public/` only as a safeguard.

**Because master is production, ship through a PR.** The repo is squash-only (merge commits and rebase merges are disabled), so:
- Merging is the owner's action. Confirm on `vite preview` first.
- After a merge, wait for the deploy: `gh run watch $(gh run list --branch master --workflow static.yml -L1 --json databaseId -q '.[0].databaseId') --exit-status` — without `--exit-status` it returns 0 even on failure. Then verify the live site **by bundle hash**, not by refreshing: check that the served `index.html` points at the new `/assets/index-*.js`, since the edge cache may still hand out the old one.
- Rollback: the **Revert button on the PR** (it reverts the squash commit correctly and respects branch protection), or `git revert <squash-sha>` with no `-m` — the SHA only exists after the merge (`git fetch && git log -1 master`). Rollback is not instant: `concurrency: cancel-in-progress: false` queues the revert deploy behind the current one, so re-verify production afterwards.
- A red CI run on master is a backstop, not an outage: `deploy: needs: build` means a failed build never deploys and production stays on the last good version.

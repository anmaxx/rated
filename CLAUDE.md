# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page marketing site for **Rated Tattoo** (a Russian-language tattoo studio). It is a fully static site — no package.json, no build step, no test suite. React and JSX are transpiled **in the browser** at load time.

## Running locally

Serve the repo root over HTTP (not `file://`, or asset/script loading breaks):

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

There is nothing to build, lint, or test. Edit a file, refresh the browser.

## How the page is assembled

`index.html` is the shell. It loads, in order:
1. React 18 + ReactDOM + **`@babel/standalone`** from unpkg CDNs.
2. `styles.css` (design tokens — see below).
3. `_ds_bundle.js` — the design-system component library (plain pre-compiled JS).
4. `sections.jsx` — page sections, served as `type="text/babel"` and transpiled in-browser.
5. An inline `text/babel` `App()` that composes the sections and mounts to `#root`.

Because Babel runs client-side, **JSX files are never compiled by tooling** — a syntax error only surfaces in the browser console, not at any build step.

## The design-system bundle (`_ds_bundle.js`) — read before editing

This file is **generated**, not hand-authored. Its header comment (`@ds-bundle: {...}`) lists the source components (`components/core/Button.jsx`, `components/forms/Accordion.jsx`, etc.) and their `sourceHashes`. Those source files are **not in this repo** — they live in an external design-system project and are bundled here. Treat `_ds_bundle.js` as a build artifact:

- Don't hand-edit components in it; changes will be lost when it's regenerated. Component fixes belong upstream.
- It attaches all components to a single global: `window.RatedTattooDesignSystem_04b525`. The `_04b525` suffix is part of the namespace. `sections.jsx` reads it via `const NS = window.RatedTattooDesignSystem_04b525`. **If the bundle is regenerated with a different namespace suffix, update that line in `sections.jsx` to match**, or the page renders nothing.
- Exposed components: `Button`, `Badge`, `Card`, `Input`, `Accordion`, `StarRating`, `PortfolioCard`, `ServiceCard`, `TestimonialCard`, `SectionHeading`.
- The bundle also inlines its own copy of an upstream `sections.jsx` that uses `../../assets/...` paths. The **repo-root `sections.jsx` is the one actually rendered**, and it uses `./assets/...` paths. Edit the root file.

## Where to make changes

- **Page content / layout / new sections** → `sections.jsx`. Each `function X()` is one full-viewport panel (`Hero`, `About`, `Works`, `Services`, `Benefits`, `Testimonials`, `Faq`, `Cta`, `Footer`, plus `Header`, `DotNav`, `BookingModal`). Panels are wired together in the inline `App()` in `index.html`.
- **Styling** → CSS custom properties in `tokens/`, aggregated by `styles.css` (an `@import` manifest, the only stylesheet `index.html` links). Files: `colors.css`, `typography.css`, `spacing.css`, `fonts.css`, `base.css`. Components and sections style almost exclusively via `var(--token)` inline styles — **change a design value at the token, not at the call site**.
- Section-specific behavior (scroll-snap, film grain, marquee, entrance reveals, responsive breakpoints) lives in the inline `<style>` block in `index.html`, keyed off `rt-` class names (`rt-snap`, `rt-grain`, `rt-reveal`/`rt-in`, `rt-marquee`).

## Conventions and constraints

- **Russian (Cyrillic) is the content language.** Headings use **Oswald**, not Facon — `facon.otf` (the custom "RATED" logotype face) has no Cyrillic glyphs and is reserved for the Latin logotype via `--font-logo`.
- Single-screen scroll-snap experience: sections are `min-height: 100vh` with `class="rt-snap"` and section `id`s that `DotNav` and the header nav anchor to.
- Entrance animation: add `className="rt-reveal"`; an `IntersectionObserver` in `App()` adds `rt-in` when the element scrolls into view.

## Deployment

`.github/workflows/static.yml` deploys the whole repo to GitHub Pages on push to **`master`** (the default branch), or manually via `workflow_dispatch`.

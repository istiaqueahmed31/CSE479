# design.md — Reusable Design System & Motion Guidelines

> **For AI coding agents (Claude Code, etc.) and developers:** this file defines the design rules
> for the project it is placed in. It is **language- and framework-agnostic**. When you build or change
> any user interface in this project, **follow these rules** and translate them into the project's own
> stack (web, mobile, desktop; any language or framework).
>
> - Rules marked **MUST** are required. **SHOULD** is the default unless the project has a good reason not to.
> - If the project already has its own brand or design system, keep its brand colors and fonts, but still
>   apply the **principles, motion rules and patterns** from this file.
> - New patterns are added as new numbered sections under **Pattern library** (§4). Each pattern lists
>   the source it was derived from.

---

## Contents
1. [How to apply this file](#1-how-to-apply-this-file)
2. [Global design principles](#2-global-design-principles)
3. [Design tokens](#3-design-tokens)
4. [Pattern library](#4-pattern-library)
   - [4.1 Animated icons that morph](#41-animated-icons-that-morph)
5. [Accessibility rules](#5-accessibility-rules)
6. [Agent checklist](#6-agent-checklist)
7. [Sources](#7-sources)

---

## 1. How to apply this file

1. Before building UI, read §2 (principles) and §3 (tokens).
2. Define the tokens in §3 in the project's native way (CSS variables, Tailwind theme, SCSS variables,
   a theme object, Flutter `ThemeData`, SwiftUI/Compose theme, XAML resources, etc.). **Never** hard-code
   colors, durations or easings in components; reference the tokens.
3. When a UI element matches a pattern in §4 (e.g. a play button, theme toggle, search, send, download,
   lock), implement it **as described in that pattern**.
4. Use whatever animation tool fits the stack: CSS transitions/keyframes, a JS animation library,
   Lottie, SVG animation, or native platform animation APIs. Do not add a heavy dependency if the
   platform can do it natively.
5. Finish with the checklist in §6.

---

## 2. Global design principles

1. **Morph, don't swap.** (MUST) When an element changes state, animate continuously from the old state
   to the new one. Shared geometry is transformed, not hard-cut or cross-faded.
2. **Tell the whole story.** (MUST) Multi-step actions show every stage: start → in progress → done
   (or error). Never jump from "idle" straight to "done" without feedback.
3. **Short and purposeful motion.** (MUST) Toggles 300–600 ms; processes may run longer but must show
   progress. No animation exists just for decoration.
4. **Physical feel.** (SHOULD) "Release" actions (send, unlock, open) use a spring with slight overshoot.
5. **Glow means active.** (SHOULD) The active/accent state is shown with the accent color plus a soft
   outer glow; inactive elements are muted.
6. **Dark-first, high contrast.** (SHOULD) Deep navy backgrounds, raised dark surfaces, near-white
   foreground, a single bright accent.

---

## 3. Design tokens

### 3.1 Color

| Token              | Value      | Use |
|--------------------|------------|-----|
| `bg-deep`          | `#01060C`  | Outer background / bottom of vignette |
| `bg`               | `#050D1D`  | Main background |
| `bg-raised`        | `#081022`  | Subtle surfaces, sections |
| `surface`          | `#121A2C`  | Cards, tiles, buttons (up to `#131D31` at center) |
| `surface-border`   | `#1E2A40`  | 1 px border on surfaces (approx.) |
| `fg`               | `#FDFDFD`  | Primary text and icons |
| `fg-muted`         | `#9599A6`  | Secondary text, inactive icons |
| `accent`           | `#37BAF4`  | Highlights, active state, progress, links, focus |
| `accent-alt`       | `#2FBCF1` / `#42B9EC` | Accent gradient stops |
| `warm`             | `#F5BD4F`  | Warm highlight (e.g. sun/light state) (approx.) |
| `on-accent`        | `#05101F`  | Text on solid accent fills |

Backgrounds SHOULD use a radial vignette (lighter behind the focal element, darker at the edges) and
MAY use a very faint square grid texture.

### 3.2 Typography
- Family: geometric/grotesk sans. Default **Inter**, fallback to the platform system UI font.
- **Eyebrow / overline**: 10–11 px, bold, uppercase, letter-spacing ≈ 0.15em, `fg-muted`.
- **Headline**: 28–32 px mobile / 40–56 px desktop, bold, tight tracking. The key word of the headline
  MAY be colored `accent` (e.g. "Morph, don't **swap**.").
- **Pill / tag**: 9–10 px, bold uppercase, `on-accent` on solid `accent`, fully rounded.
- **Caption / spec label**: 13–14 px, semibold uppercase, `accent` text in an outlined accent pill with faint glow.
- **Body**: 15–16 px, regular, `fg` at ~85% opacity.

### 3.3 Shape, depth and glow
- Radius: large, soft corners ("squircle"). Tiles/cards ≈ 22–24% of their size; buttons ≈ 12–16 px; pills fully rounded.
- Surfaces: `surface` fill + 1 px `surface-border` + subtle top inner highlight + large soft drop shadow.
- Glow (active): `0 0 16–24px` of `accent` at ~35–50% opacity.

### 3.4 Motion

| Token              | Value | Use |
|--------------------|-------|-----|
| `duration-fast`    | 150 ms | Hover, press, reduced-motion fallback |
| `duration-toggle`  | 300 ms | Simple toggles (play/pause) |
| `duration-draw`    | 400 ms | Stroke draw/undraw, fly-out |
| `duration-morph`   | 600 ms | Complex shape morphs (sun → moon) |
| `duration-process` | ~1.2 s | Short multi-stage processes (minimum; real progress can be longer) |
| `ease-standard`    | `cubic-bezier(0.65, 0, 0.35, 1)` | Toggles, morphs |
| `ease-out`         | `cubic-bezier(0.22, 1, 0.36, 1)` | Entrances, completion pops |
| `ease-spring`      | `cubic-bezier(0.34, 1.56, 0.64, 1)` or spring (stiffness ≈ 300, damping ≈ 15) | Release actions, ~34% overshoot |
| `linear`           | `linear` | Progress sweeps |

---

## 4. Pattern library

### 4.1 Animated icons that morph

*Source: reference reel "Icons that feel alive" (see §7).*

**Rules**
- Icons that represent a **state** or **action with an outcome** MUST be animated vector icons (SVG or
  native vector paths), not static icon-font glyphs or bitmaps, so their parts can morph and draw.
- Style: stroke-based, round caps and joins, 2–2.5 px stroke at 24 px, `fg` color; active parts in `accent`.
- Each animated icon SHOULD expose: `state` (e.g. `playing`, `dark`, `open`, `searching`),
  `progress` (0–1, where relevant) and `size`.
- Icons MUST animate in both directions (e.g. pause → play reverses the morph).

**The six icon behaviors**

| # | Icon | Transition | Duration / easing |
|---|---|---|---|
| 01 | **Play ⇄ Pause** | The play triangle splits and squares off into two pause bars; reverse on toggle. | `duration-toggle`, `ease-standard` |
| 02 | **Download** | Arrow drops into the tray → collapses to a dot → dot grows into a progress ring that sweeps 0 → 100% with a % label → ring fills into a solid `accent` circle with a white check (pop: scale 0.6 → 1.08 → 1). | ≥ `duration-process`; ring `linear`, check `ease-out` |
| 03 | **Theme: Sun ⇄ Moon** | 8 sun rays retract into the body while a shadow disc slides over it to carve a crescent; color shifts `warm` → `fg`; small `accent` sparkle stars pop in. | `duration-morph`, `ease-standard` |
| 04 | **Search ⇄ Close** | The magnifier circle undraws (stroke-dashoffset), the handle rotates and a second stroke draws in to form an X. | `duration-draw`, `ease-standard` |
| 05 | **Send** | Paper plane flies out up-right with a short motion trail, then springs back into place from the bottom-left. | out `duration-draw`, return `ease-spring` |
| 06 | **Lock → Unlock** | Shackle lifts +18 px (at 24 px scale ≈ +3 px) and swings open with ~34% overshoot; keyhole turns `accent`. | `ease-spring` |

**Where to use**: media players (01), downloads/uploads/exports (02), theme toggles (03), search bars
(04), send/submit in chat and forms (05), lock/unlock, privacy, password visibility or login states (06).
Apply the same principle to any other stateful icon (e.g. menu ⇄ close, heart ⇄ liked, copy ⇄ copied).

**Showcase layout (optional, for demo/landing sections)**
- Story-style segmented progress bar at the top (one segment per item, current one in `accent`).
- Eyebrow (`01 · PLAY / PAUSE`) → headline with accent word → small pill (`1x` / `SLOW-MO ¼x`).
- Large hero tile (~50% width) with the animated icon.
- Strip of 5 small keyframe tiles with a moving scrubber line; passed frames get an accent border + glow.
- Outlined spec caption pill (e.g. `TRIANGLE → 2 BARS · 300 ms`).

---

## 5. Accessibility rules

- MUST respect the user's reduced-motion setting: replace morphs, springs and fly-outs with a quick
  cross-fade (`duration-fast`) or an instant change.
- MUST update the accessible label/name when an icon's state changes ("Play" → "Pause",
  "Switch to dark mode" → "Switch to light mode").
- MUST NOT rely on animation or color alone to convey meaning; pair with a label, tooltip or text.
- Progress MUST be exposed to assistive tech (e.g. a progress role/value) and completion announced.
- Text and icons MUST meet WCAG AA contrast against their background (`fg` on `bg` and `accent` on `bg` do).
- Interactive targets SHOULD be at least 44 × 44 px; focus states MUST be visible (use `accent` glow ring).

---

## 6. Agent checklist

Before finishing any UI task, confirm:
- [ ] Colors, durations and easings come from the tokens in §3 (no hard-coded values).
- [ ] State changes morph instead of swapping (§2.1).
- [ ] Multi-step actions show start → progress → done/error (§2.2).
- [ ] Any icon matching §4.1 is implemented as described there, in both directions.
- [ ] Reduced motion, accessible labels and contrast are handled (§5).
- [ ] No unnecessary dependency was added just for animation.

---

## 7. Sources

| Pattern | Source | Notes |
|---|---|---|
| 4.1 Animated icons that morph | Reel "Icons that feel alive" (41 s, portrait) | Derived from frames only; audio not analyzed. Some hex values approximate due to video compression; exact font unknown (Inter is a close match). |

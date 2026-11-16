# Design Spec — Animated Icon Micro-interactions

> Source: reference reel (41 s, 720×1280 portrait, 30 fps) titled **"Icons that feel alive."**
> This document captures the visual language and the six icon animations shown, so they can be
> rebuilt in this project (React + Vite + Tailwind + shadcn/ui, `lucide-react` already installed).

---

## 1. Core idea

**"Morph, don't swap."** Icons never hard-cut from one state to another. Every state change is a
short, continuous animation where parts of the old icon *become* the new one (a triangle becomes two
bars, an arrow becomes a progress ring, a sun becomes a moon). This makes the UI feel responsive and
tells the user *what happened*.

Principles:
1. **Continuity** – shared geometry is morphed, not replaced.
2. **Tell the story** – multi-step actions (download) show every stage: start → progress → done.
3. **Short and purposeful** – 300–600 ms for toggles, up to ~1.2 s for processes.
4. **Physical feel** – use springs/overshoot for "release" actions (unlock, send).
5. **Glow = active** – the active/accent state is signaled by cyan-blue color and soft outer glow.

---

## 2. Visual language

### 2.1 Color palette (sampled from the video)

| Token              | Hex        | Use |
|--------------------|------------|-----|
| `--bg-deep`        | `#01060C`  | Page background, bottom of the vignette |
| `--bg`             | `#050D1D`  | Page background, main |
| `--bg-raised`      | `#081022`  | Subtle surfaces / grid area |
| `--tile`           | `#121A2C`  | Icon tile fill (to `#131D31` at center) |
| `--tile-border`    | `#1E2A40` (approx.) | 1 px tile stroke, slightly lighter than fill |
| `--icon`           | `#FDFDFD`  | Primary icon glyphs (near white) |
| `--icon-muted`     | `#9599A6`  | Inactive / not-yet-reached frames in the timeline strip |
| `--accent`         | `#37BAF4`  | Accent blue: headline highlight word, progress ring, check, pills |
| `--accent-2`       | `#2FBCF1` / `#42B9EC` | Accent variants used across the ring gradient |
| `--sun`            | `#F5BD4F` (approx.) | Sun body and rays in the dark-mode icon |

Background has a very faint square grid and a radial vignette (lighter near the center tile, darker
at the edges). The accent blue is also used as a **soft outer glow** (`box-shadow`/`filter: drop-shadow`)
on active elements.

### 2.2 Typography
- Font: geometric/grotesk sans (SF Pro Display / Inter look). Use **Inter** or the system UI stack.
- **Eyebrow** (e.g. `01 · PLAY / PAUSE`): ~10–11 px, bold, uppercase, wide letter-spacing (~0.15em), muted white.
- **Headline** (e.g. "Morph, don't **swap**."): ~28–32 px on mobile, bold, tight tracking; last word
  in `--accent`. The accent word types/fades in after the first words.
- **Pill labels** (`SLOW-MO ¼x`, `6 ICONS · NO SWAPS`): ~9–10 px, bold uppercase, dark text on solid accent fill, full radius.
- **Spec caption** (e.g. `TRIANGLE → 2 BARS · 300 ms`): ~13–14 px, semibold uppercase, accent text inside
  an outlined accent pill with a faint glow.
- **Credit/footer**: tiny, muted.

### 2.3 Shapes and surfaces
- **Icon tile**: squircle / rounded square, radius ≈ 22–24% of its size (≈ 40 px on a 180 px tile),
  fill `--tile`, 1 px lighter border, inner highlight at the top edge, large soft drop shadow.
- Small tiles (grid on intro screen): ~88 px, same style.
- **Timeline strip**: 5 small rounded tiles (~44 px) showing keyframes of the animation. Passed frames
  get an accent border + glow; a thin vertical white **scrubber line** moves across them.
- **Progress bar (top)**: 6 thin segments across the top of the screen, one per scene; the current one
  is filled in accent (story/stories style).

---

## 3. Screen layout (mobile, portrait)

```
┌────────────────────────────┐
│  ▬ ▬ ▬ ▬ ▬ ▬   (scene progress) │
│      01 · PLAY / PAUSE      │  eyebrow
│   Morph, don't  swap.       │  headline (last word accent)
│        [SLOW-MO ¼x]         │  speed pill
│      ┌──────────────┐       │
│      │              │       │
│      │   BIG ICON   │       │  hero tile (~50% width)
│      │              │       │
│      └──────────────┘       │
│  [▢][▢][▢][▢][▢]  |scrubber │  keyframe timeline strip
│                             │
│  ( TRIANGLE → 2 BARS · 300 ms ) │  spec caption pill
│                             │
│        • @credit            │
└────────────────────────────┘
```

Intro screen: headline "Icons that **feel alive.**" over a 3×2 grid of small tiles that each loop
their animation, with a pill `6 ICONS · NO SWAPS`.

Scene flow: each scene first plays at `1x` (pill reads `1x`), then replays at `SLOW-MO ¼x` while the
scrubber moves across the keyframe strip.

---

## 4. Icon animations (the six scenes)

| # | Scene / icon | Headline | Animation | Duration / spec |
|---|---|---|---|---|
| 01 | **Play / Pause** | Morph, don't **swap.** | Play triangle splits and squares off into two pause bars (and back). | `TRIANGLE → 2 BARS · 300 ms` |
| 02 | **Download** | Tell the whole **story.** | Arrow drops into tray, collapses to a dot, dot becomes a progress ring counting 0% → 100% with a percentage label, ring fills into a solid accent circle with a white **check**. | `ARROW → RING → TICK · 1.2 s` |
| 03 | **Dark mode** | Sun into **moon.** | 8 sun rays retract into the body while a shadow disc slides over it to carve a crescent; color shifts yellow → white; small accent sparkle stars pop in. | `8 RAYS RETRACT · 600 ms` |
| 04 | **Search** | Turn into the **exit.** | Magnifier circle "undraws" (stroke-dashoffset), handle rotates and a second stroke draws in to form an **X** (close search). | `CIRCLE UNDRAWS · 400 ms` |
| 05 | **Send** | Let it **fly.** | Paper plane flies out up-right with motion-blur trail, then springs back into place from the bottom-left. | `FLIES OUT 400 ms · SPRINGS BACK` |
| 06 | **Unlock** | Spring it **open.** | Shackle lifts +18 px and swings open with overshoot; keyhole turns accent blue. | `SHACKLE +18 px · 34% OVERSHOOT` |

### Easing guidance
- Toggles (play/pause, sun/moon, search/close): `cubic-bezier(0.65, 0, 0.35, 1)` (ease-in-out).
- Progress: linear for the ring sweep, ease-out for the final fill + check pop (scale 0.6 → 1.08 → 1).
- Springs (send return, unlock): spring with ~34% overshoot, e.g. framer-motion
  `{ type: "spring", stiffness: 300, damping: 15 }` or CSS `cubic-bezier(0.34, 1.56, 0.64, 1)`.

---

## 5. Implementation notes for this project

- Stack already present: React, Tailwind, shadcn/ui, `lucide-react`. Lucide icons are static, so the
  animated icons should be **custom inline SVGs** (stroke-based, `stroke-linecap="round"`, 2–2.5 px stroke).
- Recommended: add `framer-motion` for path morphing, springs and `AnimatePresence`. Pure CSS
  (`stroke-dasharray`/`stroke-dashoffset`, `transform`, `transition`) is enough for search, unlock and send.
- Suggested component: `src/components/icons/AnimatedIcon/` with one component per icon
  (`PlayPauseIcon`, `DownloadIcon`, `ThemeToggleIcon`, `SearchCloseIcon`, `SendIcon`, `LockIcon`),
  each taking a `state` prop (or `progress` for download) and a `size` prop.
- Add the palette to `tailwind.config.ts` / CSS variables in `src/index.css` as listed in §2.1.
- Accessibility: keep `aria-label` updated with the state ("Play" / "Pause"), and respect
  `prefers-reduced-motion` by switching to a quick cross-fade (≤150 ms).
- Natural fits in the site: theme toggle (03), chatbot send button (05), search bar (04),
  file/download buttons (02), media players (01), login/unlock states (06).

---

## 6. Open questions / assumptions
- Audio was not analyzed (only frames); any narration is not reflected here.
- Exact hex values for the tile border and sun yellow are approximate (compressed video).
- Exact font is not identifiable from frames; Inter is a close match.

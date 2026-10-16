# Design System — Connor Willis Racing

Version 2.0 · 2026-10-16 · Source: site/styles.css and site/config.json. This file documents the shipped system; styles.css remains the implementation.

## Decisions recorded
- Single light theme by design ("showroom white"). No dark mode.
- Fonts kept: Barlow (body) and Barlow Semi Condensed (display), SIL Open Font License via Google Fonts. Named in every prompt. The OS prefers Fontshare, but swapping a shipped, licensed pairing has no client benefit.
- The dark Relume comp ("Pit wall": black, monza red #DC0527, Racing Sans One) is held as an alternative direction only. Its tokens are in clients/connor-willis-racing/design-system.md v1.0 in the agency workspace.

## Colour tokens
| Token | Hex | Use |
|---|---|---|
| bg | #FFFFFF | Page |
| bg-2 | #F5F5F7 | Panels, footer, table header |
| bg-3 | #ECECF0 | Progress track |
| ink | #111114 | Text, dark buttons, taken chips |
| ink-2 | #3A3A42 | Secondary text (10.6:1) |
| muted | #6E6E78 | Captions (4.9:1) |
| line | #E4E4E9 | Borders |
| line-2 | #D3D3DA | Stronger borders |
| red | #D8141E | Primary buttons, available pins, accents (4.6:1 on white) |
| red-2 | #B10F18 | Hover |
| red-soft | #FCE9EA | Active row, open chip ground |
| carbon | #151519 | 3D rear livery reference |
| ok | #1F8A4C | Reserved for success states |

Livery (3D car): front #D8141E, rear #131316, stripe #F4F4F6, wings #131316.

## Typography
- Display: Barlow Semi Condensed 500/600/700. h1 clamp(40px, 7vw, 76px); h2 clamp(30px, 4.2vw, 44px); h3 22px.
- Body: Barlow 400/500/600 at 17px, line-height 1.55, tabular numerals on.
- Eyebrow: display, uppercase, 13px, 0.14em tracking, muted.
- Prices: display 700, 20px in cards, 18px in popovers.

## Spacing, radius, elevation
- Max width 1120px, 20px gutter.
- Sections 72px vertical; hero 72px top, 40px bottom.
- Radius 14px (cards, panels), 8px small, 999px pills, 22px stage.
- Shadow: 0 1px 2px rgba(17,17,20,.05), 0 10px 30px rgba(17,17,20,.07).

## Components
- Buttons: pill, 12px 20px, 44px minimum height. Primary red, dark ink, ghost outlined. Small variant 8px 14px, still 44px tall.
- Segmented control: pill group on bg-2, 38px buttons, pressed state ink on white.
- Navbar: sticky, translucent white with blur, 64px (58px on phones, links in a scrollable row under the bar).
- Funding bar: 10px track, red gradient fill, aria progressbar.
- Stage: 16:9 (4:3 on phones), radial white-to-grey ground, pins 30px with numbers, popover 250px card.
- Table: 15px, uppercase 12px headers, chips for size and status, min-width 760 with horizontal scroll.
- Kit cards: 4:3 photo, name, location, price, Claim.
- Steps: three outlined cards with numbered red discs.
- Spec card: bg-2 panel with definition list and a photo.
- Timeline: five columns with top rules, the current year in red.
- Partners: logos at 44px height plus a dashed "Your logo here".
- FAQ: details/summary with plus and minus.
- Dialog: 520px, 18px radius, labelled fields, done state with copy box.

## Icons and imagery
- Icons: one inline SVG (drag hint) and CSS glyphs. No generated icons. If more are needed, use one Iconify set.
- Photography: eight Connor Willis Racing photographs. Portrait 4:5, wide 16:10, kit 4:3.
- 3D: car.glb (CC BY stand-in), studio HDRI (CC0). Credit line in footer is mandatory.

## Motion
- GSAP 3.12 with ScrollTrigger, loaded after the content renders (site/motion.js). If it does not load, the page is complete without it.
- Hero: one staged entrance (eyebrow, headline, lede, funding block, buttons, note), 0.5 to 0.8s, power3.out.
- Funding bar fills from empty after the entrance.
- Sections: headings and content blocks rise 28px and fade in as they are reached, 0.7s, staggered 0.08s, once only. The table rows, pins and popover are not animated.
- Not used: ScrollSmoother and pinned sections. They fight anchor links and add little to a price table.
- prefers-reduced-motion: no GSAP is loaded, CSS transitions are off, and the 3D car does not auto-rotate.

## Loading behaviour (new in this review)
- Content renders from config.json before three.js loads. three.js loads on demand; on failure the stage shows the panning photograph and the rest of the page is unaffected.

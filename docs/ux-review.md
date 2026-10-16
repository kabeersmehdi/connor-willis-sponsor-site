# UX Review — Connor Willis Racing

Version 2.0 · 2026-10-16 · Reviewed: site/index.html as served locally at 1400 and 390 px, with and without the three.js CDN reachable. Judged against brand-strategy.md v2.0 and Apple HIG numbers.

## Summary
The flow is strong: hero with goal and bar, the car, the table, how it works, proof, questions. Copy is plain and the hierarchy is clear. Three structural problems were found, two of them serious: the entire page's content disappeared when the three.js CDN was unreachable, and phones had no section navigation at all. Both are fixed in this review's change set. Verdict: approved after the fixes below.

## User flow map
Hero (goal, bar, Pick a spot) → 3D car with numbered pins → driver kit cards → spot table with Claim → claim dialog → mailto or copy box → How it works → Budget and car spec → Driver bio and timeline → Founding partners → FAQ → Footer.

Dead ends: the claim flow ends in a copy-and-send box because `contactEmail` is empty. That is a content item for the client, recorded in QA.

## Findings

| # | Section | Severity | Issue | Change |
|---|---|---|---|---|
| 1 | Whole page | Critical | app.js imported three.js statically at the top of the module. If the CDN fails (ad blocker, corporate network, outage), the module never runs, so the table, kit cards, partner logos, footer links and funding numbers all render empty. | Load three.js on demand after the content renders; on failure show the panning photo in the stage. Applied. |
| 2 | Navbar, phones | Major | Section links were hidden under 760 px with no menu, so phone users had no way to jump to Spots or Connor. | Links now sit in a scrollable row under the bar on phones. Applied. |
| 3 | Navbar, controls | Major | Nav links were 23 px tall; currency and view toggles 32 px; the nav button 41 px. Below the 44 px target. | Links and buttons now 44 px minimum; segmented controls 38 px inside a 44 px group. Applied. |
| 4 | Navbar vs hero | Minor | "Get a spot" in the bar, "Pick a spot" in the hero, for the same destination. | Both now "Pick a spot". Applied. |
| 5 | Claim flow | Major | With no contact email the primary action ends in a copy box. | Client sets `site.contactEmail` or `claimEndpoint`. Open. |
| 6 | Hero | Suggestion | The funding bar reads $0 until a spot is marked taken, which can look inactive. | Keep. The meta line already says "Be the first partner on it." Mark real sales as soon as they exist. |
| 7 | Spot table, phones | Minor | Table scrolls horizontally inside its wrapper (min-width 760). Acceptable; the kit cards and car popovers cover the phone case. | Keep. Consider a stacked card list under 600 px in a later iteration. |
| 8 | 3D stage | Suggestion | Auto-rotate continues indefinitely; reduced-motion users get the same. | Later: stop auto-rotate under prefers-reduced-motion. |

## Mobile usability findings
- Stacking follows reading order. Pass.
- Tap targets: pass after finding 3. Pins on the car are 30 px; they are secondary to the table and acceptable, but note for a later pass.
- Body text 17 px. Pass against HIG.
- No horizontal page scroll at 390 px. Pass.
- Contrast: muted text #6E6E78 on white is 4.9:1. Pass. Red on white for the open chip is 4.6:1. Pass.

## Recommended before → after
Before: page content depends on a third-party script; phones lose the nav.
After: content renders from config.json first, the car is progressive enhancement; phones keep the section links.

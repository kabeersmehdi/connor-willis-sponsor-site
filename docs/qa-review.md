# QA Review — Connor Willis Racing

## Verdict: PUNCH LIST (client items only)
- Client slug: connor-willis-racing
- Date: 2026-10-16
- Reviewed against: CREATIVE_BRIEF.md v2.0, brand-strategy.md v2.0, design-system.md v2.0, copy.md v2.0, ux-review.md v2.0
- Build reviewed: site/ after this review's fixes, rendered at 1400 and 390 px, once with the three.js CDN blocked and once with three.js served locally.

All Critical and Major findings owned by the design side are fixed and re-verified in this pass. Three Major items remain and all three need a decision or a value from Connor. The page cannot be marked deliverable until they are closed.

## Compliance notes (brief and strategy)
| Check | Result |
|---|---|
| All launch content present (hero, car, table, steps, budget, bio, partners, FAQ, footer) | Pass |
| Primary CTA "Pick a spot" in hero and navbar, "Claim" per spot, "Send request" in form | Pass (navbar wording aligned this pass) |
| Positioning stated on the first screen: what, for whom, why different | Pass: driver, series, logo everywhere, goal, no payment on page |
| Tone matches personality, no hype | Pass |
| Trust signals: official results, team, partners, livestream | Pass |
| Facts sourced per CREDITS.md | Pass; no new facts were added |
| Compliance: CC BY credit line in footer, noindex while draft, no payments | Pass |
| Banned content from strategy (unsourced audience numbers, invented quotes) | Pass, none present |

## Audit log
- Compliance: pass.
- Consistency: pass. One font pairing, one icon style, tokens from styles.css only. CTA wording unified.
- Accessibility (WCAG 2.2 AA): pass after fixes. Contrast: body 10.6:1 and higher, muted 4.9:1, red on white 4.6:1. One h1, no skipped levels. All images carry alt (empty alt on decorative kit photos). Form fields labelled. Focus states visible. Reduced-motion honoured for CSS; auto-rotate not yet (Suggestion). Tap targets: all links and buttons 44 px or more except the segmented controls at 38 px inside a 44 px group and the car pins at 30 px (accepted, see Minor).
- Hierarchy: pass. One message and one action per screen; five-second test passes on the hero.
- Spacing: pass. 72 px section rhythm, consistent radii.
- Mobile: pass after fixes. Section links available on phones; no horizontal page scroll at 390 px; table scrolls inside its wrapper.
- Resilience (added to this audit because the failure was total): pass after fix. Content renders from config.json before three.js; a blocked CDN now costs only the 3D car and shows the panning photograph instead.
- Impeccable audit suite: not installable in this environment; the equivalent hierarchy, spacing, typography, accessibility and empty-state checks were run manually and are recorded above. Empty states: funding bar at $0 reads "Be the first partner on it"; partners row always shows "Your logo here".
- Final AI-slop and placeholder scan: pass. No banned words, no lorem ipsum, no "[Insert]" text.

## Fixed in this pass (re-verified)
1. Critical. Page content depended on the three.js CDN. app.js now loads three.js on demand after rendering; fallback to photo on failure. Verified both paths.
2. Major. No section navigation on phones. Links now in a scrollable row under the bar.
3. Major. Nav links 23 px, toggles 32 px, nav button 41 px. Now 44 px (toggles 38 px in a 44 px group).
4. Minor. "Get a spot" vs "Pick a spot". Unified.
5. Minor. Footer links 22 px, brand link 30 px. Now 44 px.

## Final punch list (open)
| # | Severity | Finding | Fix | Owner |
|---|---|---|---|---|
| 1 | Major | `site.contactEmail` is empty, so the primary action ends in a copy-and-send box | Set the email (or a `claimEndpoint`) in config.json | Connor, via Kabeer |
| 2 | Major | Prices are a proposal scaled to the goal; the page presents them as asking prices | Connor confirms or edits the twenty prices; any sold spots marked taken | Connor |
| 3 | Major | Page is in draft with noindex | After 1 and 2: set `draft` to false and remove the robots line | Kabeer, on Connor's approval |
| 4 | Minor | Car pins are 30 px | Enlarge to 36 px in a later pass if phone testing shows misses | Visual designer |
| 5 | Minor | Auto-rotate runs under prefers-reduced-motion | Disable autoRotate when the media query matches | Visual designer |
| 6 | Suggestion | Budget categories carry no amounts | Add amounts when the 2027 plan is set | Connor |
| 7 | Suggestion | Table on phones scrolls sideways | Consider stacked cards under 600 px | UX |

## Sign-off block
- Project: Connor Willis Racing sponsorship page
- Date: 2026-10-16
- Verdict: PUNCH LIST. Design-side items closed. Deliverable once items 1 to 3 are closed by the client; re-run /qa-review on that commit.
- Open suggestions for the next iteration: items 4 to 7 above; a dark campaign landing page using the Relume comp if a specific push needs it.

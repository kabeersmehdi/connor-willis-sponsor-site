# Creative Brief — Connor Willis Racing

## Project Metadata
- Client Name: Connor Willis (driver). Day-to-day contact: Connor or Kabeer Mehdi
- Business Name: Connor Willis Racing (car 99, Hillspeed, GB4 Championship)
- Prepared By: Design Agency OS, /intake (reconstructed from the repository, its CREDITS.md sources, and the build sessions; the client questionnaire has not been run)
- Date: 2026-10-16
- Client Slug: connor-willis-racing
- Brief Version: 2.0 (supersedes 1.0, which was drafted from a Relume export with placeholder pricing)

## Business Overview
- What the business does: Sells sponsorship placements on Connor Willis's single-seater race car and driver kit. Connor is a 19-year-old American from Naperville, Illinois, racing in the UK's GB4 Championship for Hillspeed. The page funds his next steps up the single-seater ladder toward Formula One.
- Core products/services to feature: Twenty numbered spots on the car and the driver kit, priced individually in US dollars and summing to the $1,000,000 season goal (rear wing $150,000 down to mirrors $12,000). Bundles and multi-year deals priced on request. An interactive 3D car shows where each spot sits.
- Service area / market: Races in the UK (seven rounds, 21 races, April to September). Buyers are US and UK businesses; the driver's home market is the Chicago area.
- Key differentiators: Published asking prices for every surface. A spot you can see on a 3D car before you ask. Every race streamed live on MSV TV's YouTube channel. A rookie season with a win (Silverstone), a podium (Brands Hatch finale), ninth in the championship with 221 points, and a team that finished runner-up. Two founding partners already on board (Phalanx Security, Stellar Cyber).
- Compliance/legal notes: Every fact about results and the car must trace to a source in CREDITS.md with a date. The 3D model is a CC BY stand-in and the credit line in the footer is a licence condition. No payments on the page; agreements and invoices come from Connor's team. The page is in draft with a noindex tag until Connor approves prices and wording.

## Target Audience Profile
### Primary Audience
- Who they are: Owners and marketing leads at US and UK companies with $12,000 to $150,000 of discretionary sponsorship budget, especially in security, technology, automotive, logistics and professional services. Many have a personal connection to the Chicago area or to motorsport.
- Main needs/problems: They want visible, story-led brand exposure and a relationship with a driver on the way up, without an opaque negotiation.
- Purchase/decision triggers: A price they can see, a surface they can picture, proof the driver is real and racing, and a simple way to ask.
- Trust signals they care about: Official standings and results, the livestream, the founding partners already on the car, named team (Hillspeed), photography of the real car.

### Secondary Audience(s)
- Segment: Smaller businesses and individuals who want the driver kit or a small surface; motorsport-adjacent suppliers.
- Why they matter: The FAQ already invites them ("Can a smaller business join?"), and they fill the lower-priced spots that build the raised total early.

### Audience Exclusions (if any)
- Not a fit: Anyone expecting to pay on the page or to buy a title sponsorship bigger than the full car. The page is a priced menu, not an auction.

## Brand Personality
- Desired brand adjectives (3-5): Straight, confident, specific, hard-working, ambitious
- Preferred tone of voice: Plain sentences, real numbers, no hype. The existing page is already written this way and sets the bar.
- Tone to avoid: Vague "exposure", begging, superlatives, any claim without a source.
- Emotional outcome for visitors: "This is real, I can afford a piece of it, and I know exactly what happens when I click."
- Visual direction cues: Showroom white with the livery red, condensed display type, photographs of the real car and driver. A dark racing direction exists as an alternative comp (see Design Preferences).

### Existing Brand Assets
- Logo: Yes. Connor Willis Racing wordmark (assets/logos/wordmark.png).
- Colors: Yes. Livery red #D8141E, near-black #131316, stripe white #F4F4F6; page ink #111114.
- Fonts: Yes. Barlow and Barlow Semi Condensed (SIL OFL, Google Fonts). Decision recorded: keep them; they are the client's shipped choice.
- Imagery/assets: Yes. Eight photographs from connorwillisracing.com (portrait, suit, cockpit, two track shots, panning, garage, candid) plus two partner logos and a Draco-compressed 3D car.
- Brand guideline: Partial. styles.css tokens and CLAUDE.md rules in the repository.

### If No Assets Exist (common case)
- Not applicable. All core assets exist.

## Competitor Analysis Summary
- Competitor 1: Other junior single-seater drivers' sponsorship pages and PDF decks
  - What they do well: Personal story, podium photography.
  - Gaps/opportunities: Prices hidden behind "contact us"; no way to picture the placement; usually a PDF.
- Competitor 2: Tiered driver and team sponsorship pages (bronze/silver/gold ladders from £500 club packages to 250k single-seater packs)
  - What they do well: Clear ladder, placements spelled out.
  - Gaps/opportunities: No audience proof, no reporting, no mobile care, no interactivity.
- Competitor 3: brandmymac.com-style "buy a spot" pages outside motorsport
  - What they do well: A single object, numbered spots, a progress bar, a price per spot. This is the model the page already follows.
  - Gaps/opportunities: Those pages rarely carry trust content; this one pairs the mechanic with sourced results and real partners.

### Positioning Summary
- How this business should stand apart: The only driver sponsorship you can price, place and picture from one page, backed by official results, real partners and a car you can spin.

## Content/Page Requirements
### Required Launch Pages
- Page list: One page (index.html) with sections: hero and funding bar, 3D car and driver kit, spot table, how it works, the budget and car spec, the driver, founding partners, FAQ, footer. Plus embed.html for the Squarespace car-only view.

### Page Priorities & CTAs
- Primary CTA: "Pick a spot" (hero, navbar) leading to the car and table, then "Claim" on a spot opening the request form. "Send request" in the form.
- Secondary CTA(s): "How it works", "Clean look" view toggle, currency toggle.
- CTA by page (if known): As above; all on one page.

### Available Content Assets
- Existing copy: Complete and sourced (hero, steps, budget, spec, bio, timeline, FAQ).
- Existing images: Eight photographs, two partner logos, wordmark.
- Testimonials/reviews: None. Founding partner logos act as proof.
- FAQs/case studies: Seven FAQ entries in draft policy form.

### Missing Content & Ownership
- Missing items: Contact email (claim requests currently fall back to a copy-and-send box); confirmation of the twenty asking prices; any spots already sold; budget amounts per category; FAQ policy confirmation; approval to leave draft.
- Who provides each item: Connor Willis. Kabeer edits config.json.
- Content deadline assumptions: Before the page is shared with sponsors.

### Functional Requirements
- Forms/integrations: Claim dialog; mailto fallback or a POST endpoint (Formspree or the optional Node server).
- Booking/e-commerce/chat needs: None. No payments by design.
- Accessibility/language needs: English (US spelling in copy). WCAG 2.2 AA minimums.

## Design Preferences
### Reference Websites
1. URL: https://brandmymac.com
   - What client likes: One object, numbered spots, progress bar, price per spot.
   - What to avoid copying directly: The novelty tone; this page must stay credible.
2. URL: Relume dark comp built in this project (https://claude.ai/artifact/GMeuWpHJ66bL5FcxsLbrsB)
   - What client likes: Black and monza red, Racing Sans One headings, pinned video hero.
   - What to avoid copying directly: Its three-tier pricing and its 2023 timeline were placeholder content and contradict the sourced facts. Only the visual direction is reusable.
3. URL: https://www.gb-4.net/standings
   - What client likes: The authority of the official table.
   - What to avoid copying directly: Nothing to copy; cite it.

### Aesthetic Direction
- Layout preferences: Centred hero, full-width 3D stage, dense but readable table, two-column budget and bio.
- Typography preferences: Barlow Semi Condensed display, Barlow body, 17px base.
- Color/vibe preferences: White showroom ground, livery red accent, near-black for taken states. Light theme only, by design.
- Imagery direction: The eight real photographs. No stock.
- Explicit do-not-use styles: Gradients beyond the progress bar, glass effects, generated icons, invented numbers.

## Success Metrics
- Business goals (first 3-6 months): First spots marked taken; raised bar moving; the page shared with Hillspeed's and the partners' networks.
- Leading indicators (early signals): Claim requests per week; which spots get clicked on the car; reel and standings link clicks.
- KPI targets (if available): Not set by the client. Suggested: five qualified claim requests in the first month after launch.
- Qualitative success criteria: A sponsor can name their spot, its price and the next step after one visit.

## Assumptions & Open Questions
- Assumptions made during intake: Audience and KPIs inferred; prices are a proposal scaled to the goal (README says so); FAQ answers are draft policy.
- Unknowns requiring follow-up: Contact email; confirmed prices; sold spots; the 2027 programme the money funds; whether GBP should be shown at a live rate.
- Risks/blockers to timeline or quality: Draft status; empty contact email makes the primary action end in a copy box; the 3D car depends on a third-party CDN (addressed in this review).

## Downstream Handoff Notes
### For /brand-strategist
- Inputs to use: Positioning summary, the twenty-spot mechanic, sourced results, founding partners, US and UK buyer mix.

### For /ux-expert
- Inputs to use: Single-page flow hero → car → table → claim; mobile nav; tap targets; what happens when the 3D scene cannot load.

### For /copywriter
- Inputs to use: Existing plain-language copy as the baseline; CTA wording consistency; banned words list; no new facts without a CREDITS.md source.

### For /visual-designer
- Inputs to use: styles.css tokens; Barlow pairing; photographs; keep the single light theme; document the dark comp as an alternative direction only.

### For Relume Site Builder Stage
- Inputs to use: Not used for this project. The skeleton is hand-built in index.html.

### For Claude Design Stage
- Inputs to use: The live page at https://kabeersmehdi.github.io/connor-willis-sponsor-site/ and the repository.

# Back Connor Willis: sponsorship page

Live: https://kabeersmehdi.github.io/connor-willis-sponsor-site/

Connor, read `START-HERE.md`. Claude, read `CLAUDE.md`.

A single-page sponsorship site for Connor Willis (GB4 Championship, Hillspeed, car 99), modelled on brandmymac.com: a fundraising bar, an interactive 3D car with numbered sponsorship spots, a price list, and a claim form. Goal: $1,000,000.

```
site/        the website. Deploy this folder as-is (static hosting) or through server/.
  index.html   page structure and copy
  styles.css   design
  app.js       page logic, three.js scene, livery shader, decal spots, claim flow
  config.json  everything editable: goal, prices, spot status, contact email, links
  assets/      car.glb (2.4 MB, Draco), studio HDRI, Draco decoder, photos, logos
server/      optional zero-dependency Node backend that stores claim requests
tools/       asset pipeline that rebuilds car.glb from the source model
CREDITS.md   licences and the sources behind every fact in the copy
```

## Run it locally

Any static server works. Two options:

```bash
npx serve site
```

```bash
node server/server.js
```

The second one also accepts claim requests at `POST /api/claims` and appends them to `data/claims.jsonl`. Set `"claimEndpoint": "/api/claims"` in `site/config.json` to use it. `ADMIN_TOKEN=secret` enables `GET /api/claims` (send `Authorization: Bearer secret`). `CLAIM_WEBHOOK_URL` forwards each request to a Slack or Zapier webhook.

## Before it goes live: five things to fill in

All in `site/config.json`.

1. **`site.contactEmail`**: the address claim requests go to. Empty today, so the form falls back to a copy-and-send box. With an email set, the form opens the visitor's mail app with the request pre-filled. With `claimEndpoint` set, it posts to the backend instead.
2. **Prices**: the 20 spots are asking prices that add up to exactly $1,000,000. They are a proposal scaled to the goal, not Connor's numbers. Edit `price` per spot.
3. **Spots already sold**: set `"status": "taken"`, `"holder"`, `"url"` and optionally `"logo"` (a PNG in `assets/logos/`) and `"paid"` if the amount differs from the list price. The raised total, the bar and the panel on the car update from that. `site.raisedOverride` forces the raised figure if needed.
4. **What the money buys**: the budget section lists categories without amounts on purpose. Add amounts once Connor confirms the plan for the next step up the ladder.
5. **FAQ answers** are drafts of policy (carry-over to a new car, bundles, what a partner gets). Confirm them with Connor.

Also worth checking: `currency.gbpPerUsd` (an approximate fixed rate for the £ toggle). The About section carries the final 2026 GB4 standings.

The page ships in draft: a banner says so and a robots meta tag keeps it out of search. Set `site.draft` to `false` and delete that meta line in `site/index.html` once Connor approves it.

## Deploy

GitHub Pages (current): every push to `main` runs `.github/workflows/pages.yml`, which publishes the `site` folder. In a fresh copy, set Settings, Pages, Source to GitHub Actions once.

Other static hosts: drop the `site/` folder on Netlify, Vercel, Cloudflare Pages or GitHub Pages. The only external requests are three.js from jsDelivr and the Barlow fonts from Google Fonts. Point `claimEndpoint` at a Formspree or Basin endpoint if you want form submissions without running a server.

With the backend: deploy the repo to Render, Railway or Fly and run `node server/server.js` (`PORT` is respected). Serve behind HTTPS.

## The 3D car

- The model is a generic 2022-style single-seater (CC BY, see CREDITS.md), repainted at runtime with a two-tone livery shader that mimics Connor's Hillspeed colours: red front, white stripe, black rear. Colours and the split line are in `config.livery`.
- Sponsor panels are projected decals. Each spot in `config.json` has one or more `decals` entries: `from` is a ray origin in normalised car space (x in half-widths, y in heights, z in half-lengths, nose at +z), `dir` is the ray direction, `w` and `h` are the panel size in metres, `up` is which way the top of the panel points. The first surface the ray hits gets the panel. `pinOnly` marks a spot with a numbered pin but no panel (mirrors, rims).
- The camera orbits around the vertical axis only. Auto-rotation pauses while dragging and resumes after five seconds.
- `index.html?debug=1&still=1&az=1.2` (and `?embed=1` for the car-only view used by `embed.html`) shows axes, stops rotation, sets the start angle, and exposes `window.__cwr` for probing. Missed decal rays log a warning in the console.

### Swapping in the real Tatuus

The GB4 car is a Tatuus MSV GB4-025. A close CC-licensed model (Tyler_Dave's 2020 Tatuus FT-60, Sketchfab, CC BY) needs a free Sketchfab account to download. To swap:

1. Put the downloaded GLB at `tools/source/car-source.glb` and run `cd tools && npm install && npm run build:model`. Edit the `STRIP` table in `tools/prepare-model.mjs` for that model's material names (any baked sponsor textures must be removed).
2. Set `model.rotateY` in `config.json` if the nose is not at +z, and adjust `decals` anchors with `?debug=1`.
3. Remove the "3D stand-in" wording from the legend, the spec card and the FAQ in `index.html`.

## Hosting on a service that only serves text media types

Some hosts refuse `.glb` and `.hdr`. `app.js` also accepts both assets wrapped as base64 JSON (`{"glb": "..."}` and `{"hdr": "..."}`): point `model.file` and `env` in `config.json` at the JSON files. `index.html?config=other.json` loads an alternative config, which is handy for testing a variant without touching the live one.

## Editing the copy

All prose is in `index.html`. Facts about Connor (standings, results, car spec) are sourced in CREDITS.md. No em dashes anywhere, on purpose.

# Instructions for Claude: Connor Willis sponsorship site

This repo is Connor Willis's sponsorship page: a single static web page with a spinnable 3D race car, 20 numbered sponsorship spots, a price table, a claim form, his bio and partners. Connor races car 99 for Hillspeed in the UK's GB4 Championship and is raising $1,000,000 in partnerships.

Live page: https://kabeersmehdi.github.io/connor-willis-sponsor-site/
The person asking you for changes is usually Connor or his friend Kabeer. Neither needs to read code, so describe changes in plain words and do the edits yourself.

## Where things live

| What | File |
|---|---|
| Prices, spot names and sizes, sold or available, sponsor names and logos, goal, contact email, social links, car colours, draft switch | `site/config.json` |
| All page wording (headline, bio, budget, FAQ, timeline, stats) | `site/index.html` |
| Design (colours, fonts, spacing) | `site/styles.css` |
| 3D scene, decals, pins, claim form logic | `site/app.js` |
| Photos and logos | `site/assets/img/`, `site/assets/logos/` |
| Squarespace embed snippet | `squarespace/embed-code.html` |
| Licences and the sources behind every fact on the page | `CREDITS.md` |

`site/embed.html` only redirects to `index.html?embed=1`, which shows just the car. Do not copy content into it.

## Common requests and how to do them

- **"Mark spot N as sold to Company X for $Y."** In `site/config.json`, on the spot with that `id`: set `"status": "taken"`, `"holder": "Company X"`, `"url"` to their website if given, and `"paid": Y` if Y differs from `price`. If a logo file is provided, save it as a PNG with a transparent background in `site/assets/logos/` and set `"logo": "assets/logos/<file>.png"`. The raised total, progress bar, table, popover and the panel on the car all update from this. Nothing else needs editing.
- **"Change a price."** Edit that spot's `price` (whole US dollars, no commas). The page shows the sum of all prices in the note under the table; tell the person if the total no longer matches `site.goal`.
- **"Add a partner logo to Founding partners."** Add `{ "name": "...", "logo": "assets/logos/<file>.png" }` to `partners` in config.json.
- **"Set the contact email."** `site.contactEmail` in config.json. Claim requests then open the visitor's email app addressed to it.
- **"Collect claims in a form inbox."** Put a Formspree (or similar) endpoint URL in `site.claimEndpoint`. The page then POSTs JSON there.
- **"Take the page out of draft" / "go live."** Set `site.draft` to `false` in config.json AND delete the `<meta name="robots" content="noindex, nofollow">` line (and the comment above it) in `site/index.html`. Only do this when Connor says the prices and wording are approved.
- **"Update results or standings."** Edit the About section and timeline in `site/index.html`. Use the official standings at https://www.gb-4.net/standings and add the source with a date to the facts list in `CREDITS.md`. Never guess a result.
- **"Change the car colours."** `livery` in config.json: `front`, `rear`, `stripe` are hex colours; `split` moves the colour boundary along the car (negative is toward the rear).
- **"Move a logo panel on the car."** Each spot's `decals` entry is a ray: `from` is a start point in normalised car space (x in half-widths, y in heights, z in half-lengths, nose at +z), `dir` is the direction, `w` and `h` are the panel size in metres, `up` is which way is up. The panel lands where the ray first hits the body. Open the page with `?debug=1&still=1&az=1.2` to check; missed rays log a warning in the browser console.

## Preview locally before publishing

```bash
cd site && python3 -m http.server 8000
```

Then open http://localhost:8000. The page must be served over http; opening index.html as a file will not load the car. Check the car loads and spins, the table renders, and the browser console shows no errors.

## Publishing

Commit and push to `main`. The GitHub Action in `.github/workflows/pages.yml` publishes the `site` folder to GitHub Pages in about a minute. Check the Actions tab if the live page does not change.

## Rules

- Keep the footer credit line. The 3D model is used under CC BY 4.0, which requires it (see `CREDITS.md`).
- Do not rename files or folders inside `site`; paths are referenced from config.json and app.js.
- Facts about Connor (results, standings, history) must come from a source listed in `CREDITS.md`, with a date. Do not invent results, sponsors or numbers.
- The page takes no payments. Keep it that way; deals are agreed and invoiced by Connor's team.
- Keep the wording plain and specific. No em dashes.
- `sponsor-prospecting/` is not part of this repo and must never be committed: it lists private contacts.

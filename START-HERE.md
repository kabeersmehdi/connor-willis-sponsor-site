# Connor: start here

Your sponsorship page is live:

**https://kabeersmehdi.github.io/connor-willis-sponsor-site/**

It shows a draft banner and is hidden from Google until you approve the prices and wording. Section 4 says how to switch that off.

Everything is also in this repository: https://github.com/kabeersmehdi/connor-willis-sponsor-site

## 1. Make it yours (pick one)

**A. Your own copy on GitHub (recommended).** You own it, it is free, and your Claude can edit it.

1. Make a free account at https://github.com.
2. Open https://github.com/kabeersmehdi/connor-willis-sponsor-site and click **Use this template**, then **Create a new repository**. Name it, keep it Public, create it.
3. In your new repository: **Settings**, then **Pages**, then under Source choose **GitHub Actions**.
4. Open the **Actions** tab, pick **Deploy site to GitHub Pages**, click **Run workflow**. About a minute later your page is at `https://<your-username>.github.io/<repo-name>/`.

**B. Edit Kabeer's copy.** Send Kabeer your GitHub username and he adds you as a collaborator. The live link above stays the same.

## 2. Edit it with Claude

The file `CLAUDE.md` tells Claude how this site works, so you can just ask in plain English: "Mark the rear wing as sold to Acme for $120,000", "set my contact email", "change the sidepod price to $90,000", "take the page out of draft".

- **With Claude Code (desktop app or terminal):** clone your repository, open the folder, ask Claude. When it is done, ask it to commit and push. The page updates about a minute later.
- **With Claude in the browser (claude.ai):** open `site/config.json` on GitHub, copy it into the chat with your request, and paste Claude's version back using the pencil icon on GitHub, then click **Commit changes**. Most edits (prices, sold spots, email, partners) happen in that one file.

## 3. Put it on your Squarespace site

Squarespace cannot host these files itself, so the page stays on GitHub and plugs into your site.

- **Menu link (any plan):** Pages, plus button, **Link**. Call it "Sponsor" and paste your page link.
- **Show the car on your homepage (Business plan or higher):** add a **Code Block** and paste the contents of `squarespace/embed-code.html`. It shows the spinning car with its spots and a button to the full page. If you made your own copy, change the two links in it to yours.
- **Your own address, like sponsor.connorwillisracing.com (optional):** in Squarespace, **Settings, Domains**, your domain, **DNS settings**, add a record: Type `CNAME`, Host `sponsor`, Data `<your-github-username>.github.io`. Then in your GitHub repository, **Settings, Pages, Custom domain**, type `sponsor.connorwillisracing.com` and save. HTTPS turns on by itself within an hour.

## 4. Before you share the link with sponsors

Ask Claude to do these, or edit `site/config.json` yourself:

1. **Contact email** (`contactEmail`). Right now claim requests fall back to a copy-and-send box.
2. **Prices.** The 20 asking prices add up to exactly $1,000,000. They are a proposal; change any of them.
3. **Spots already sold.** Mark them taken with the sponsor's name and logo.
4. **The FAQ answers** are drafts. Read them once.
5. **Go live:** set `draft` to `false` and delete the `noindex` line in `site/index.html` (or ask Claude: "take the page out of draft").

## 5. How sponsor requests reach you

When someone clicks Claim, the page opens their email app with the request filled in and addressed to your contact email. Nothing is charged online. You send the agreement and invoice yourself.

## 6. Good to know

- The 3D car is a stand-in for your Tatuus, and the page says so. If you can download the Tatuus FT-60 model from Sketchfab, the README explains the swap.
- Keep the credit line in the footer: the 3D model's licence requires it.
- No GitHub at all? Drag the `site` folder onto https://app.netlify.com/drop and you get a link in a minute. Edits then mean dragging the folder in again.

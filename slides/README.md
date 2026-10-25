# DevOps & Git for LabVIEW Development — GDevCon ANZ slides

A 16-slide [reveal.js](https://revealjs.com) deck with [Mermaid](https://mermaid.js.org) diagrams. Every dependency
is vendored under `vendor/`, so the deck runs **100% offline**: no CDN, no web fonts, no build step.

## Run it

| Option | Command | URL |
| --- | --- | --- |
| Double-click | open `index.html` directly (works from `file://`) | — |
| Python 3 (any OS) | `python3 serve.py --open` | http://localhost:8000/ |
| Windows | double-click `serve.bat` | http://localhost:8000/ |
| Docker | `docker build -t gdevcon-slides . && docker run --rm -p 8080:80 gdevcon-slides` | http://localhost:8080/ |

`serve.py` options: `--port 8000`, `--host 127.0.0.1` (use `0.0.0.0` to share on the LAN), `--open`.

## Controls

- `→` / `Space` / `PgDn` next · `←` / `PgUp` previous · `Esc` overview · `F` fullscreen · `S` speaker notes · `L` learn more
- On-screen bar (bottom centre): previous · slide counter · next · overview · fullscreen. It fades out when idle and
  reappears on mouse/touch activity.
- Jump to a slide with the URL hash, e.g. `index.html#/5`.
- **Learn more** (top right): opens a menu of further-reading links for the current slide, in a new tab, for people
  reading the deck after the talk. Links need internet; the rest of the deck stays offline.

## Embedding in LabVIEW (Web Browser control)

Point the control at either the local server (`http://localhost:8000/`) or the file itself
(`file:///C:/path/to/slides/index.html`), e.g. from
`LabVIEW Demo Station/Demos/2026 Q1 Features/Web Browser Front Panel Control/demo_Web Browser Front Panel Control.vi`.

- The slide canvas is a fixed 1280×720 stage that reveal.js scales to fit whatever size the control is, so the
  layout is identical at any panel size; the nav bar sits outside the scaled stage so it stays clickable.
- Below 640×420 the overview/fullscreen buttons and act label are hidden to keep small panels clean.
- Click inside the control once to give it keyboard focus for `Space` / arrow keys; after clicking an on-screen
  button, focus returns to the deck automatically.
- The deck needs a modern Chromium/Edge-class engine (reveal.js 5, Mermaid 11). Legacy IE-based browser controls
  are not supported.

## Deploy to GitHub Pages

`.github/workflows/slides-gh-pages.yml` publishes this folder to the `gh-pages` branch on every push to `main` that
touches `slides/**` (or manually via *Actions → Deploy slides to GitHub Pages → Run workflow*).

One-time setup: **Settings → Pages → Build and deployment → Source: Deploy from a branch → `gh-pages` / `(root)`**.
GitHub Pages on a private repository requires a paid GitHub plan.

When hosted on `*.github.io`, the takeaways slide's repository link points at the hosting repo automatically;
otherwise edit the `repo-link` anchor in `index.html`.

## Editing

- Slides: `index.html` (one `<section>` per slide, speaker notes in `<aside class="notes">`).
- Diagrams: `<pre class="mermaid">` blocks; rendered lazily when their slide is shown.
- Learn-more links: a hidden `<div class="learn-more-links">` of `<a>` tags inside each `<section>`; the button only
  appears on slides that have one.
- Styling: `css/theme.css` · behaviour: `js/app.js`.
- Update vendored libraries (needs Node + internet): `scripts/update-vendor.sh`
  (pin with `REVEAL_VERSION=5.2.1 MERMAID_VERSION=11.17.2`). Currently reveal.js 5.2.1, Mermaid 11.17.2.

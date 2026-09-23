# NOCTELLE

A cinematic one-page site for NOCTELLE, a fictional fragrance house built on one idea: *sillage*, the trail of scent you leave in a room.

Plain HTML, CSS, and vanilla JavaScript. No framework, no build step.

```
index.html
assets/style.css   design tokens, layout, motion
assets/main.js     scroll hero, sillage trail, collection, hold-to-wear, form
assets/og.jpg      link preview image
render.yaml        Render static site Blueprint
```

## Preview locally

```
npx http-server . -p 8080
```

## Deploy

Hosted on Render as a static site. Every push to `main` redeploys automatically.

## Two switches in `assets/main.js`

- `HERO_VIDEO`: set to a scrub-encoded mp4 in `assets/` to replace the drawn hero with scroll-scrubbed footage.
- `FORM_ENDPOINT`: set to a Formspree (or similar) URL so discovery-set requests reach an inbox. Until then the form shows an honest preview-mode message.

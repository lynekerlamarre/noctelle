# NOCTELLE

A cinematic one-page store for NOCTELLE, a boutique reselling authentic designer and niche fragrances. Built on one idea: *sillage*, the trail of scent you leave in a room.

Plain HTML, CSS, and vanilla JavaScript. No framework, no build step.

```
index.html
assets/style.css   design tokens, layout, motion
assets/main.js     store settings, smoke hero, sillage trail, shop, hold-to-wear, form
assets/products/   product photos
assets/og.jpg      link preview image
render.yaml        Render static site Blueprint
```

## Preview locally

```
npx http-server . -p 8080
```

## Deploy

Hosted on Render as a static site. Every push to `main` redeploys automatically.

## Store settings (top of `assets/main.js`)

- `PRODUCTS`: one entry per bottle. Set `price`, the category in `for` (For him, For her, Unisex), and paste the bottle's Stripe Payment Link into `stripe`. Photos live in `assets/products/`.
- Stripe Payment Links: set "After payment" to redirect to `/thanks.html` on the live site.
- `FORM_ENDPOINT`: a Formspree (or similar) URL so "request a fragrance" messages reach an inbox. Until then the form shows an honest preview-mode message.
- `HERO_VIDEO`: optional scrub-encoded mp4 to replace the golden smoke with footage.

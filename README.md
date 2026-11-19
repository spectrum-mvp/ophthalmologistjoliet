# Spectrum Eye Institute website

The site is built with Astro and deploys as a static site to GitHub Pages.
Every push to `main` runs `.github/workflows/deploy.yml`, which builds `dist/`
and publishes it (Settings → Pages → Source must be **GitHub Actions**).

## Local development

Use Node.js 22.23.4 or newer.

```sh
nvm use
npm install
npm run dev
```

Create and preview the production build with `npm run build` and `npm run preview`.
`npm run build:preview` builds with the repository path used by the GitHub Pages
project preview.

Patient-form downloads belong in `public/assets/`, which Astro publishes at
`/assets/`.
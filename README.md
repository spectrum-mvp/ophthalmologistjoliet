# Spectrum Eye Institute

Astro builds this site into plain HTML, CSS, and vanilla JavaScript. No server,
React, or client-side framework is needed on GitHub Pages.

## Local development

Use Node.js 22.22.0 or newer (the installed Astro release is pinned for compatibility).

```sh
npm ci
npm run dev
```

```sh
npm run check
npm run build
npm test
npm run preview
```

The commands invoke Astro through Node directly because this Dropbox folder's
name contains a colon, which otherwise breaks npm's executable lookup.

## Editing

- `src/pages/*.astro`: page content and page-specific metadata.
- `src/components/Header.astro` and `Footer.astro`: shared header and footer.
- `src/layouts/SiteLayout.astro`: shared document, stylesheet, and scripts,
  including the Google Tag Manager snippet in the head.
- `src/components/AppointmentLink.astro`: use this for every scheduler link;
  it supplies `target="_blank"` and `rel="noopener"`.
- `public/styles/global.css`: the shared stylesheet, with the existing design.
- `public/styles/doctors.css`: the doctors page's existing safe-area/hidden behavior.
- `public/styles/privacy.css`: the production privacy policy's existing heading styles.
- `public/scripts/site.js`: fills the current copyright year on page load and
  appends the current page's query parameters to every appointment link.
  Duplicate query values and URL encoding are preserved; existing scheduler
  parameters take precedence so `platform=spectrum` cannot be overwritten.
- `public/scripts/navigation.js`: accessible Services dropdown.
- `public/scripts/doctors.js`: existing doctor biography dialogs.
- `public/assets/`: logos and photographs.

Use `withBase()` from `src/lib/paths.ts` for internal URLs and asset paths so
they also work when hosted under a GitHub Pages repository subpath.

## Routes and deployment

Home is `/`, and Our Doctors is `/our-doctors/`. All other pages are folder
routes: `/contact/`, `/glaucoma/`, etc. The build emits `dist/index.html`,
`dist/our-doctors/index.html`, `dist/contact/index.html`, and so on. The existing
custom error page is preserved as `dist/404.html`, the required GitHub Pages
exception to directory routes. Publish **the contents of `dist/`**, not the
Astro source files.

The production repository is `spectrum-mvp/ophthalmologistjoliet`, with `main`
as its production branch and `www.ophthalmologistjoliet.com` as its custom domain.
The Astro migration is on `astro-site-preview`. Pushing that branch does not
deploy to production. Branch pushes and pull requests run checks and produce
a downloadable `static-site` artifact, not a publicly browsable preview.

The production workflow is guarded to run only from `main`, including manual
runs. It reads the Pages domain and base path automatically. The existing
custom domain is preserved in `CNAME` and `public/CNAME`.

Existing root-level `.html` URLs are replaced by folder routes, not redirected;
update any external links that still use them. The
previous `/home/` route is also replaced by `/` and is not redirected.

## Public previews and release

GitHub Pages provides one site per repository, not one URL per branch. Do not
switch the production site's publishing branch to a feature branch to preview it:
that would replace the live site.

For automatic public previews, connect this repository to a separate preview
host such as Netlify and enable branch deploys/deploy previews:

- Preview branch: `astro-site-preview`.
- Node version: 22 (at least 22.22.0).
- Build command: `npm run build`.
- Publish directory: `dist`.
- Base path: `/`.
- Set `SITE_URL` to the preview URL for that build; on Netlify, the build command
  can be `SITE_URL=$DEPLOY_PRIME_URL npm run build`.
- Keep previews out of search engines with the host's `X-Robots-Tag: noindex`
  configuration. Preview visits currently load the same GTM container as production.

No external preview host has been connected by this project. If you want to
stay entirely on GitHub, use a separate staging repository/Pages site; remove
the production `CNAME` from its build artifact and configure its own site/base URL.

Once the preview is approved:

1. Open a pull request from `astro-site-preview` into `main` and wait for checks.
2. Immediately before merging, select **Settings > Pages > Build and deployment
   > Source > GitHub Actions** in the production repository. Leave the custom domain
   and DNS unchanged. The current site was previously published directly from `main`.
3. Merge the pull request. The production workflow builds and publishes the new site.
4. Confirm the deployment succeeds and check the live homepage, doctors, contact,
   policy, appointment links, and custom domain. Future changes follow the same
   branch, preview, review, merge process.

For a manual project-subpath build:

```sh
SITE_URL=https://your-account.github.io BASE_PATH=/your-repository npm run build
BASE_PATH=/your-repository npm test
BASE_PATH=/your-repository npm run preview
```

Without overrides, builds use the existing production domain and `/`.
Page canonical and Open Graph URLs follow the configured deployment URL;
the original organization/medical structured data retains its production identity.

The existing production privacy policy and favicon files have been restored
from the repository. `robots.txt` and `sitemap.xml` are generated from the
configured deployment URL and all current content routes.

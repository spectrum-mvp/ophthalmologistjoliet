import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { test } from 'node:test';

const base = `${(process.env.BASE_PATH || '/').replace(/\/?$/, '/')}`;
const slugs = fs.readdirSync('src/pages').filter(file => file.endsWith('.astro'))
  .map(file => file.slice(0, -6));

function readPage(slug) {
  const file = slug === '404' ? '404.html' : slug === 'index' ? 'index.html' : `${slug}/index.html`;
  return fs.readFileSync(`dist/${file}`, 'utf8');
}

function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1].replace(/&amp;/g, '&');
}

test('Google Tag Manager appears first in the head of every page', () => {
  for (const slug of slugs) {
    const html = readPage(slug);
    const head = html.match(/<head>([\s\S]*?)<\/head>/)[1];
    const scripts = head.match(/^\s*(<script\b[^>]*><\/script>)\s*<script>([\s\S]*?)<\/script>/);
    assert.ok(scripts, `${slug}: expected both tag scripts at the start of the head`);
    assert.equal(attribute(scripts[1], 'src'), 'https://www.googletagmanager.com/gtm.js?id=GTM-KL553QLN');
    assert.match(scripts[1], /\basync(?:\s|>)/);
    assert.match(scripts[2], /window\.dataLayer\s*=\s*window\.dataLayer\s*\|\|\s*\[\];/);
    assert.match(scripts[2], /function gtag\(\)\s*\{\s*dataLayer\.push\(arguments\);\s*\}/);
    assert.match(scripts[2], /gtag\('js',\s*new Date\(\)\);/);
    assert.equal([...html.matchAll(/https:\/\/www\.googletagmanager\.com\/gtm\.js\?id=GTM-KL553QLN/g)].length, 1, slug);
    assert.ok(Buffer.byteLength(html.slice(0, html.indexOf('<meta charset='))) < 1024, slug);
  }
});

test('Google tag initialization queues the timestamp and preserves an existing data layer', () => {
  const html = fs.readFileSync('dist/index.html', 'utf8');
  const script = html.match(/<script async src="https:\/\/www\.googletagmanager\.com\/gtm\.js\?id=GTM-KL553QLN"><\/script>\s*<script>([\s\S]*?)<\/script>/)[1];

  for (const existing of [undefined, [{ event: 'existing' }]]) {
    const context = { Date, dataLayer: existing };
    context.window = context;
    vm.runInNewContext(script, context);
    if (existing) assert.equal(context.dataLayer, existing);
    const entry = context.dataLayer[context.dataLayer.length - 1];
    assert.equal(entry[0], 'js');
    assert.ok(entry[1] instanceof Date);
    assert.equal(entry.length, 2);
  }
});

test('homepage, doctors page, and their links use the correct routes', () => {
  const home = fs.readFileSync('dist/index.html', 'utf8');
  const doctors = fs.readFileSync('dist/our-doctors/index.html', 'utf8');

  assert.match(home, /<h1>We’re open and seeing patients\.<\/h1>/);
  assert.match(doctors, /<h1>Our doctors<\/h1>/);
  assert.equal(fs.existsSync('dist/home/index.html'), false);
  assert.equal(attribute(home.match(/<meta property="og:url"[^>]*>/)[0], 'content'),
    attribute(home.match(/<link rel="canonical"[^>]*>/)[0], 'href'));
  assert.equal(attribute(home.match(/<a class="panel-link"[^>]*>Meet Our Doctors[^<]*<\/a>/)[0], 'href'),
    `${base}our-doctors/`);

  assert.match(doctors, /viewport-fit=cover/);
  assert.match(doctors, /styles\/doctors\.css/);
  assert.match(doctors, /scripts\/doctors\.js/);
  assert.doesNotMatch(home, /viewport-fit=cover|styles\/doctors\.css|scripts\/doctors\.js/);

  for (const slug of slugs) {
    const html = readPage(slug);
    assert.equal(attribute(html.match(/<a class="logo"[^>]*>/)[0], 'href'), base, slug);
    assert.equal(attribute(html.match(/<a class="nav-link"[^>]*>Our Doctors<\/a>/)[0], 'href'),
      `${base}our-doctors/`, slug);
    const homeLinks = [...html.matchAll(/<a\b[^>]*>(?:Home|← Back to Home)<\/a>/g)];
    assert.ok(homeLinks.length > 0, slug);
    for (const [link] of homeLinks) assert.equal(attribute(link, 'href'), base, slug);
  }

  for (const [slug, count] of [['corneal-transplant', 2], ['diabetic-retinopathy', 1]]) {
    const html = fs.readFileSync(`dist/${slug}/index.html`, 'utf8');
    const main = html.match(/<main\b[\s\S]*?<\/main>/)[0];
    const links = [...main.matchAll(/<a\b[^>]*>our doctors<\/a>/g)];
    assert.equal(links.length, count, slug);
    for (const [link] of links) assert.equal(attribute(link, 'href'), `${base}our-doctors/`, slug);
  }

  const cornealPage = fs.readFileSync('dist/corneal-transplant/index.html', 'utf8');
  const schemas = [...cornealPage.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(([, json]) => JSON.parse(json));
  const faq = schemas.find(schema => schema['@type'] === 'FAQPage');
  const answer = faq.mainEntity.find(question => question.name === 'Who would perform my surgery?');
  assert.ok(answer.acceptedAnswer.text.includes(`<a href="${base}our-doctors/">our doctors</a>`));
});

test('static pages use directory routes except the homepage and GitHub Pages 404', () => {
  assert.equal(slugs.length, 15);
  assert.deepEqual(fs.readdirSync('dist').filter(file => file.endsWith('.html')), ['404.html', 'index.html']);
  for (const slug of slugs) {
    const route = slug === 'index' ? '' : `${slug}/`;
    const html = readPage(slug);
    assert.match(html, /<html lang="en">/);
    assert.match(html, /<main id="main"/);
    assert.equal([...html.matchAll(/<header\b/g)].length, 1);
    assert.equal([...html.matchAll(/<footer\b/g)].length, 1);
    assert.match(html, /&copy; <span id="year"><\/span> Spectrum Eye Institute/);
    assert.doesNotMatch(html, /<style\b|style="/);
    const stylesheet = html.match(/<link[^>]*href="[^"]*styles\/global\.css"[^>]*>/)?.[0];
    assert.equal(attribute(stylesheet || '', 'href'), `${base}styles/global.css`);

    const canonical = html.match(/<link rel="canonical"[^>]*>/)[0];
    if (slug !== '404') assert.equal(new URL(attribute(canonical, 'href')).pathname, `${base}${route}`);
    else assert.match(html, /<meta name="robots" content="noindex, follow"/);

    const appointments = [...html.matchAll(/<a[^>]*href="https:\/\/s\.odoro\.com\/mvp\/\?platform=spectrum"[^>]*>/g)];
    assert.ok(appointments.length >= 2, slug);
    for (const [tag] of appointments) {
      assert.equal(attribute(tag, 'target'), '_blank');
      assert.equal(attribute(tag, 'rel'), 'noopener');
      assert.match(tag, /data-appointment/);
    }
    const active = [...html.matchAll(/<a[^>]*aria-current="page"[^>]*>/g)];
    const hasNavLink = !['404', 'privacy-policy', 'no-surprise-billing-act', 'notice-of-availability', 'notice-of-nondiscrimination'].includes(slug);
    assert.equal(active.length, hasNavLink ? 1 : 0, slug);
    for (const [tag] of active) assert.equal(attribute(tag, 'href'), `${base}${route}`);

    for (const [tag] of html.matchAll(/<(?:a|link|img|script)\b[^>]*>/g)) {
      const value = attribute(tag, 'href') || attribute(tag, 'src');
      if (!value || /^(?:https?:|tel:|mailto:|#)/.test(value)) continue;
      assert.ok(value.startsWith(base), `${slug}: ${value}`);
      const local = value.slice(base.length).split(/[?#]/)[0];
      assert.doesNotMatch(local, /\.html$/, `${slug}: old route ${value}`);
      const destination = path.join('dist', local.endsWith('/') || !local ? `${local}index.html` : local);
      assert.ok(fs.existsSync(destination), `${slug}: missing ${destination}`);
    }
    for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      assert.equal(typeof JSON.parse(json), 'object');
    }
  }
});

test('production privacy policy, icons, custom domain and SEO routes are preserved', () => {
  const privacy = readPage('privacy-policy');
  assert.match(privacy, /<h1>Privacy Policy<\/h1>/);
  assert.match(privacy, /Your Rights Regarding Your Protected Health Information/);
  assert.match(privacy, /This practice does not share, sell, rent, or lease its customer lists/);
  assert.match(readPage('404'), /<h1>Page not found<\/h1>/);
  assert.equal(fs.readFileSync('dist/CNAME', 'utf8').trim(), 'www.ophthalmologistjoliet.com');
  for (const file of ['favicon-32.png', 'icon-512.png', 'apple-touch-icon.png']) {
    assert.ok(fs.statSync(`dist/assets/${file}`).size > 0);
  }
  const root = new URL(attribute(readPage('index').match(/<link rel="canonical"[^>]*>/)[0], 'href'));
  const sitemap = fs.readFileSync('dist/sitemap.xml', 'utf8');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url.replaceAll('&amp;', '&')).sort();
  const expected = slugs.filter(slug => slug !== '404')
    .map(slug => new URL(`${base}${slug === 'index' ? '' : `${slug}/`}`, root.origin).href).sort();
  assert.deepEqual(urls, expected);
  const robots = fs.readFileSync('dist/robots.txt', 'utf8');
  assert.ok(robots.includes(`Sitemap: ${new URL(`${base}sitemap.xml`, root.origin).href}`));
  for (const slug of slugs) {
    const link = readPage(slug).match(/<a\b[^>]*>Privacy Policy<\/a>/)[0];
    assert.equal(attribute(link, 'href'), `${base}privacy-policy/`);
  }
});

test('production deployment jobs cannot run from a feature branch', () => {
  const workflow = fs.readFileSync('.github/workflows/deploy.yml', 'utf8');
  for (const job of ['build', 'deploy']) {
    assert.match(workflow, new RegExp(`${job}:\\n\\s+if: github\\.ref == 'refs/heads/main'`));
  }
});

function runSite(search, now) {
  const year = { textContent: '' };
  const links = Array.from({ length: 4 }, () => ({ href: 'https://s.odoro.com/mvp/?platform=spectrum' }));
  const context = {
    URL,
    URLSearchParams,
    Date: class extends Date { constructor() { super(now); } },
    window: { location: { search } },
    document: {
      getElementById(id) { assert.equal(id, 'year'); return year; },
      querySelectorAll(selector) { assert.equal(selector, 'a[data-appointment]'); return links; },
    },
  };
  vm.runInNewContext(fs.readFileSync('public/scripts/site.js', 'utf8'), context);
  return { year, links };
}

test('year follows the browser clock, not the build date', () => {
  for (const expected of [2026, 2027, 2035]) {
    const { year } = runSite('', `${expected}-06-15T12:00:00`);
    assert.equal(year.textContent, String(expected));
  }
});

test('every appointment link receives URL parameters and keeps the Spectrum platform', () => {
  const { links } = runSite('?utm_source=cpc&utm_campaign=eye%20care&tag=one&tag=two&empty=&platform=other&encoded=a%26b%3Dc', '2026-06-15');
  for (const link of links) {
    const url = new URL(link.href);
    assert.equal(url.origin + url.pathname, 'https://s.odoro.com/mvp/');
    assert.deepEqual([...url.searchParams], [
      ['platform', 'spectrum'],
      ['utm_source', 'cpc'],
      ['utm_campaign', 'eye care'],
      ['tag', 'one'],
      ['tag', 'two'],
      ['empty', ''],
      ['encoded', 'a&b=c'],
    ]);
  }
  const { links: noParameters } = runSite('', '2026-06-15');
  for (const link of noParameters) assert.equal(link.href, 'https://s.odoro.com/mvp/?platform=spectrum');
  const { links: example } = runSite('?utm_source=cpc', '2026-06-15');
  for (const link of example) assert.equal(link.href, 'https://s.odoro.com/mvp/?platform=spectrum&utm_source=cpc');
});

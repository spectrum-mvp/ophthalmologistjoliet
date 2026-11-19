import type { APIRoute } from "astro";
import { services } from "../data/services";

const pages = [
  "/",
  "/doctors/",
  "/patient-info/",
  "/contact/",
  ...services.map((service) => `/${service.slug}/`),
  "/no-surprise-billing-act/",
  "/notice-of-nondiscrimination/",
  "/notice-of-availability/",
  "/privacy-policy/",
];

export const GET: APIRoute = () => {
  const urls = pages
    .map((path) => `  <url><loc>https://www.ophthalmologistjoliet.com${path}</loc></url>`)
    .join("\n");
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(sitemap, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};

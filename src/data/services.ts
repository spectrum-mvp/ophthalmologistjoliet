import { z } from "astro/zod";
import serviceData from "./services.json";

const sectionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("prose"),
    heading: z.string(),
    paragraphs: z.array(z.string()),
  }),
  z.object({
    type: z.literal("cards"),
    heading: z.string(),
    note: z.string().nullable(),
    cards: z.array(
      z.object({
        name: z.string(),
        tag: z.string(),
        body: z.string(),
      }),
    ),
  }),
  z.object({
    type: z.literal("checklist"),
    heading: z.string(),
    intro: z.string(),
    items: z.array(z.string()),
  }),
  z.object({
    type: z.literal("note"),
    html: z.string(),
  }),
]);

const serviceSchema = z.object({
  slug: z.string(),
  navLabel: z.string(),
  title: z.string(),
  h1: z.string(),
  description: z.string(),
  lede: z.string(),
  image: z.object({
    file: z.string(),
    alt: z.string(),
    caption: z.string(),
  }).nullable(),
  atAGlance: z.array(z.object({ label: z.string(), value: z.string() })),
  sections: z.array(sectionSchema),
  promo: z.object({
    image: z.string(),
    alt: z.string(),
    eyebrow: z.string(),
    headline: z.string(),
    body: z.string(),
    expires: z.string(),
    terms: z.string(),
  }).nullable(),
  cta: z.object({ heading: z.string(), body: z.string() }),
  faq: z.array(z.object({ q: z.string(), a: z.string() })),
  condition: z.boolean().optional(),
});

export type Service = z.infer<typeof serviceSchema>;

export const services = z.array(serviceSchema).parse(serviceData);

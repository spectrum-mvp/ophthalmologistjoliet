import { z } from "astro/zod";
import doctorData from "./doctors.json";

const doctorSchema = z.object({
  slug: z.string(),
  name: z.string(),
  photo: z.string(),
  role: z.string(),
  field: z.string(),
  blurb: z.string(),
  quote: z.string().optional(),
  bio: z.array(z.string()),
  lists: z.array(z.tuple([z.string(), z.array(z.string())])).optional(),
  bio_after: z.array(z.string()).optional(),
});

export const doctors = z.array(doctorSchema).parse(doctorData);

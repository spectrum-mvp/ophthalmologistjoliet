import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://www.ophthalmologistjoliet.com",
  base: process.env.ASTRO_BASE ?? "/",
  output: "static",
  trailingSlash: "always",
  build: {
    format: "directory",
  },
});

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

const site = process.env.SITE_URL ?? "https://hermes-agent-ak.github.io";
const base = process.env.BASE_PATH ?? "/git-fanta-site/";

export default defineConfig({
  site,
  base,
  output: "static",
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});

import { defineConfig } from "@solidjs/start/config";
import { analyzer } from "vite-bundle-analyzer";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  vite: {
    plugins: [tailwindcss(), analyzer({ analyzerMode: "static" })],
  },
  server: { preset: "cloudflarePages" },
  ssr: false,
});

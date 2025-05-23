import { defineConfig } from "@solidjs/start/config";
import { analyzer } from "vite-bundle-analyzer";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  vite: {
    plugins: [
      tailwindcss(),
      analyzer({ analyzerMode: "static" }),
      visualizer({ template: "flamegraph" }),
    ],
  },
  server: {
    preset: "cloudflare_pages",
    // compatibilityDate: "2025-05-23",
    // cloudflare: {
    //   deployConfig: true,
    //   nodeCompat: true,
    // },
  },
  ssr: false,
});

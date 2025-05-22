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
  server: { preset: "cloudflarePages" },
  ssr: false,
});

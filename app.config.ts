import { defineConfig } from "@solidjs/start/config";
import { analyzer } from "vite-bundle-analyzer";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  vite: {
    plugins: [
      tailwindcss(),
      VitePWA({
        registerType: "autoUpdate",
        devOptions: { enabled: true, type: "module" },
        includeAssets: ["**/*"],
        workbox: {
          globPatterns: ["**/*"],
        },
        manifest: {
          name: "Clothing Assistant",
          short_name: "Cloventh",
          description:
            "A simple app to help manage your stock in your clothing/apparel-related business.",
          theme_color: "#ffffff",
          icons: [
            {
              src: "pwa-64x64.png",
              sizes: "64x64",
              type: "image/png",
            },
            {
              src: "pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
            {
              src: "maskable-icon-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
            {
              src: "maskable-icon-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
          ],
          display: "standalone",
        },
      }),
      analyzer({ analyzerMode: "static" }),
      visualizer({ template: "flamegraph" }),
    ],
  },
  server: {
    preset: "cloudflare_pages",
    prerender: {
      crawlLinks: true,
    },
    compressPublicAssets: { gzip: true, brotli: true },
    // compatibilityDate: "2025-05-23",
    // cloudflare: {
    //   deployConfig: true,
    //   nodeCompat: true,
    // },
  },
  ssr: false,
});

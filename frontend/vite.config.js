import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import frappeui from "frappe-ui/vite";
import { fileURLToPath } from "node:url";

const here = (path) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  // Keep the existing Desk-page asset output/proxy. Use frappe-ui's barrel
  // optimizer without enabling its separate app-shell build or dev proxy.
  plugins: [
    frappeui({
      frappeProxy: false,
      jinjaBootData: false,
      buildConfig: false,
      codeLanguages: false,
    }),
    vue(),
  ],
  base: "/assets/pick_pack_experiment/dist/",
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://mysite.localhost:8000",
        changeOrigin: true,
      },
      "/assets": {
        target: "http://mysite.localhost:8000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: here("../pick_pack_experiment/public/dist/"),
    emptyOutDir: true,
    manifest: true,
    cssCodeSplit: false,
    assetsDir: "assets",
    rollupOptions: {
      input: here("./index.html"),
    },
  },
});

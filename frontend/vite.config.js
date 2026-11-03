import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "node:url";

const here = (path) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  plugins: [vue()],
  base: "/assets/pick_pack_experiment/dist/",
  build: {
    outDir: here("../pick_pack_experiment/public/dist/"),
    emptyOutDir: true,
    manifest: true,
    cssCodeSplit: false,
    assetsDir: "assets",
    rollupOptions: {
      input: here("./src/main.js"),
    },
  },
});

import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],

  build: {
    outDir: "../public/react",
    emptyOutDir: true,

    rollupOptions: {
      input: {
        tasks: resolve(
          import.meta.dirname,
          "src/entries/tasks-entry.tsx",
        ),
      },

      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
});
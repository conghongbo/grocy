import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],

  build: {
    outDir: "../public/react",
    emptyOutDir: true,

    cssCodeSplit: false,

    rollupOptions: {
      input: {
        chores: resolve(import.meta.dirname, "src/entries/chores-entry.tsx"),
        tasks: resolve(
          import.meta.dirname,
          "src/entries/tasks-entry.tsx",
        ),
      },

      output: {
        entryFileNames: "[name].js",

        chunkFileNames:
          "chunks/[name]-[hash].js",

        assetFileNames: (assetInfo) => {
          if (
            assetInfo.names?.some(
              (name) =>
                name.endsWith(".css"),
            )
          ) {
            return "tasks.css";
          }

          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
});
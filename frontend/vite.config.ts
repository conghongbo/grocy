import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],

  build: {
    outDir: "../public/react",
    emptyOutDir: true,

    cssCodeSplit: true,

    rollupOptions: {
      input: {
        tasks: resolve(
          import.meta.dirname,
          "src/entries/tasks-entry.tsx",
        ),

        batteries: resolve(
          import.meta.dirname,
          "src/entries/batteries-entry.tsx",
        ),

        "batteries-overview": resolve(
          import.meta.dirname,
          "src/entries/batteries-overview-entry.tsx",
        ),
      },

      output: {
        entryFileNames:
          "[name].js",

        chunkFileNames:
          "chunks/[name]-[hash].js",

        assetFileNames: (assetInfo) => {
          const name =
            assetInfo.name ?? "";

          if (
            name === "tasks.css" ||
            name.startsWith("tasks-")
          ) {
            return "tasks.css";
          }

          // Must be checked before "batteries-"
          if (
            name === "batteries-overview.css" ||
            name.startsWith(
              "batteries-overview-",
            )
          ) {
            return "batteries-overview.css";
          }

          if (
            name === "batteries.css" ||
            name.startsWith("batteries-")
          ) {
            return "batteries.css";
          }

          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
});
import path from "path";
import { defineConfig } from "vite";

// See https://vitejs.dev/config/
export default defineConfig({
  root: path.resolve(__dirname, "src"),
  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        "javascript/manager/main": "./manager/index.ts",
      },
    },
  },
  server: {
    port: 8080,
  },
  resolve: {
    alias: {
      // TODO: Would be nice to prefix these with '@' to be explicit about what they are
      components: path.resolve(__dirname, "../components/"),
      core: path.resolve(__dirname, "../core/"),
      manager: path.resolve(__dirname, "../manager/"),
      utils: path.resolve(__dirname, "../utils/"),
      branding: path.resolve(__dirname, "../branding/"),
      // TODO: Do we need this?
      jquery: path.resolve(__dirname, "./inject.global.jquery.js"),
    },
  },
});

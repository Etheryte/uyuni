import path from "path";
import { defineConfig } from "vite";

// TODO: We're missing manually copied files

// See https://vitejs.dev/config/
export default defineConfig({
  root: path.resolve(__dirname, "src"),
  build: {
    outDir: path.resolve(__dirname, "../dist"),
    rollupOptions: {
      input: {
        "javascript/manager/main": path.resolve(__dirname, "../manager/index.ts"),
        "css/uyuni": path.resolve(__dirname, "../branding/css/uyuni.less"),
        "css/susemanager-fullscreen": path.resolve(__dirname, "../branding/css/susemanager-fullscreen.less"),
        "css/susemanager-light": path.resolve(__dirname, "../branding/css/susemanager-light.less"),
        // TODO: We're removing the dark theme for now
        "css/susemanager-dark": path.resolve(__dirname, "../branding/css/susemanager-light.less"),
      },
      // TODO: These differ from the old directory structure, do we need to update anything in the spec etc?
      output: {
        entryFileNames: "[name].bundle.js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      },
    },
    emptyOutDir: true,
  },
  server: {
    port: 8080,
    proxy: {
      "/": {
        // TODO: Use env variable or arg
        target: "https://server.tf.local/",
        changeOrigin: true,
        secure: false,

        // TODO: Do we need this?
        ws: true,
      },
    },
    // Allow any CORS
    // cors: true,
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

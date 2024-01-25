import basicSsl from "@vitejs/plugin-basic-ssl";
// import dns from "dns";
import path from "path";
import { defineConfig } from "vite";

// TODO: Do we need this? If anyone has DNS issues, try reenabling this.
// dns.setDefaultResultOrder("verbatim");

// TODO: We're missing manually copied files, see https://www.npmjs.com/package/vite-plugin-static-copy
// TODO: Maybe assetsInclude?

// See https://vitejs.dev/config/
export default defineConfig({
  plugins: [basicSsl()],
  // TODO: Do we want and/or need this? Check https://vitejs.dev/config/shared-options.html#apptype
  // appType: "custom",
  // TODO: Configure publicDir etc https://vitejs.dev/guide/assets#the-public-directory
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
        // preserveModules: true,
      },
    },
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    // proxy: {
    //   "^(?!/javascript/manager)": {
    //     // TODO: Use env variable or arg
    //     target: "https://server.tf.local/",
    //     // If you change this to true you can unintentionally get redirected to the target url instead? Should this be true or false?
    //     changeOrigin: false,
    //     followRedirects: false,
    //     secure: false,
    //     // bypass(req) {
    //     //   if (req.url.startsWith("/javascript/manager")) {
    //     //     console.log(req.url);
    //     //     // return false;
    //     //   }
    //     //   return req;
    //     // },

    //     // TODO: Do we need this?
    //     // ws: true,
    //   },
    // },
    // // Allow any CORS
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

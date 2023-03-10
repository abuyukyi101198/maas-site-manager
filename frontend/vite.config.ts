import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: "../.env" });

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { port: Number(process.env.VITE_UI_PORT) },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "sass:math";
          @import "./src/settings.scss";
          @import "node_modules/vanilla-framework";
          @include vanilla;
        `,
      },
    },
  },
});

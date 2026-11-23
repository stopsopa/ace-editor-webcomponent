import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // src/App.tsx imports ../../ace-web-component.js from the root of the repository
      allow: [".."],
    },
  },
});

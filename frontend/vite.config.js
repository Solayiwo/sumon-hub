import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Define __dirname manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@styles": resolve(__dirname, "src/assets/styles"),
      "@images": resolve(__dirname, "src/assets/images"),
      "@components": resolve(__dirname, "src/components"),
      "@context": resolve(__dirname, "src/context"),
    },
  },

   // ADD SERVER CONFIGURATION SECTION
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

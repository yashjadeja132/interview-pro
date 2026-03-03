import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    strictPort: false,
    allowedHosts: ["silk-alumni-angle-labour.trycloudflare.com"], // ✅ allow ANY hostname (permanent fix)
    host: "0.0.0.0",       // ✅ listen on all network interfaces
    cors: true,            // ✅ ensure cross-origin requests work
  },
});
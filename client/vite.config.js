import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";

import dns from "node:dns";

dns.setDefaultResultOrder("verbatim");

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    proxy: {
      "/users": {
        target: "http://localhost:8080/api/v1",
        changeOrigin: true,
      },
      "/services": {
        target: "http://localhost:8080/api/v1",
        changeOrigin: true,
      },
      "/containers": {
        target: "http://localhost:8080/api/v1",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

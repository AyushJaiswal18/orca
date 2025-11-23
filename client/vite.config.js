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
    // Proxy only for development when VITE_API_URL is not set
    proxy: process.env.VITE_API_URL
      ? {}
      : {
          "/users": {
            target: process.env.VITE_PROXY_TARGET || "http://localhost:8080/api/v1",
            changeOrigin: true,
          },
          "/services": {
            target: process.env.VITE_PROXY_TARGET || "http://localhost:8080/api/v1",
            changeOrigin: true,
          },
          "/containers": {
            target: process.env.VITE_PROXY_TARGET || "http://localhost:8080/api/v1",
            changeOrigin: true,
          },
        },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Expose env variables to client
  envPrefix: "VITE_",
});

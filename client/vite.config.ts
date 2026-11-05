import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // In dev the browser talks to Vite (5173); /api calls are forwarded to Express (3000),
  // so the session cookie stays on one origin.
  server: { port: 5173, proxy: { "/api": `http://localhost:${process.env.API_PORT ?? 3000}` } },
});

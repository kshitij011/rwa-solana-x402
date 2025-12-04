import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      buffer: "buffer",
      process: "process",
      util: "util",
      events: "events",
    },
  },

  define: {
    global: "globalThis",
  },

  optimizeDeps: {
    include: ["buffer", "process", "util", "events"],
  },
});

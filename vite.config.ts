import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // loadEnv will load .env file variables
  const env = loadEnv(mode, process.cwd(), "");

  // Check both process.env and loaded .env
  const apiBaseUrl = process.env.VITE_API_BASE_URL || env.VITE_API_BASE_URL;

  if (!apiBaseUrl) {
    console.error(
      "ERROR: VITE_API_BASE_URL must be set either in environment or .env file",
    );
    process.exit(1);
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});

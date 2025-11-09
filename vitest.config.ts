/// <reference types="vitest" />
import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    // Run tests single-threaded to avoid worker termination/EPERM issues on Windows.
    // This property isn't in the typed config for this Vitest version so suppress TS here.
    // @ts-ignore
    threads: false,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})

// Vitest configuration. Compiler/domain tests run in the default "node" environment
// (no DOM) on purpose: pure modules must not depend on a browser.
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
    testTimeout: 15000,
  },
});

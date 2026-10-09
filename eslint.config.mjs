import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Module boundary rules (see docs/architecture/REPOSITORY_STRUCTURE.md §3).
 * These are enforced by `npm run lint` AND proven to work by
 * src/lib/eslint-boundaries.test.ts (negative tests: violating code must fail).
 *
 * Flat-config note: when several blocks set the same rule for one file, the LAST
 * block replaces the earlier options, so every block below lists its full set.
 *
 * Known limitation: boundaries are checked on the `@/` alias and bare package names.
 * Escaping via long relative paths (e.g. "../../../app/x") is not detected; keep
 * imports inside a module relative and imports across modules on `@/modules/<name>`.
 */

const UI_AND_INFRA = [
  {
    group: ["@/app", "@/app/*", "@/components", "@/components/*", "@/infrastructure", "@/infrastructure/*"],
    message: "Domain modules must not import from app/, components/ or infrastructure/ (dependency direction).",
  },
];

const NO_CROSS_MODULE_DEEP_IMPORT = {
  group: ["@/modules/*/*"],
  message: "Import other modules only through their public index (e.g. '@/modules/runs'), not their internal files.",
};

const PURE_PATHS = [
  { name: "react", message: "Pure modules (compiler/templates) must not depend on React." },
  { name: "react-dom", message: "Pure modules (compiler/templates) must not depend on React." },
  { name: "fs", message: "Pure modules must not touch the filesystem." },
  { name: "fs/promises", message: "Pure modules must not touch the filesystem." },
  { name: "child_process", message: "Pure modules must not spawn processes." },
  { name: "http", message: "Pure modules must not use the network." },
  { name: "https", message: "Pure modules must not use the network." },
  { name: "net", message: "Pure modules must not use the network." },
];

const PURE_PATTERNS = [
  ...UI_AND_INFRA,
  NO_CROSS_MODULE_DEEP_IMPORT,
  { group: ["next", "next/*"], message: "Pure modules must not depend on Next.js." },
  { group: ["node:*"], message: "Pure modules must not use Node built-ins (fs, net, ...)." },
];

const PURE_GLOBALS = [
  "window",
  "document",
  "navigator",
  "localStorage",
  "sessionStorage",
  "indexedDB",
  "fetch",
  "XMLHttpRequest",
  "WebSocket",
  "process",
].map((name) => ({
  name,
  message: `'${name}' is a browser/Node/network API; pure modules (compiler/templates) must stay free of it.`,
}));

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Safety: no dynamic code execution anywhere (blueprint §5A.5, master prompt §D).
  {
    rules: {
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
    },
  },

  // Cross-module imports go through the public index.
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [NO_CROSS_MODULE_DEEP_IMPORT] }],
    },
  },

  // All domain modules: never import UI / infrastructure.
  {
    files: ["src/modules/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [...UI_AND_INFRA, NO_CROSS_MODULE_DEEP_IMPORT] }],
    },
  },

  // Pure modules: no React, Next, browser, filesystem or network.
  {
    files: ["src/modules/prompt-compiler/**/*.{ts,tsx}", "src/modules/templates/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { paths: PURE_PATHS, patterns: PURE_PATTERNS }],
      "no-restricted-globals": ["error", ...PURE_GLOBALS],
    },
  },

  // lib/ and components/ui are leaf layers: they must not reach into domain modules.
  {
    files: ["src/lib/**/*.{ts,tsx}", "src/components/ui/**/*.{ts,tsx}"],
    ignores: ["**/*.test.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@/modules", "@/modules/*", "@/app", "@/app/*", "@/infrastructure", "@/infrastructure/*"], message: "lib/ and components/ui are leaf layers and must not import domain modules, app or infrastructure." },
          ],
        },
      ],
    },
  },

  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
  ]),
]);

export default eslintConfig;

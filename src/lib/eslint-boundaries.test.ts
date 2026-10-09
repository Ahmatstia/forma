// Proves that the dependency-boundary ESLint rules actually work (negative tests):
// code that violates a boundary MUST produce an error. Without this, a misconfigured
// rule would silently pass `npm run lint`.
import path from "node:path";
import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

const eslint = new ESLint({ cwd: process.cwd() });

async function lint(relativePath: string, code: string) {
  const [result] = await eslint.lintText(code, {
    filePath: path.join(process.cwd(), relativePath),
  });
  return result.messages;
}

const COMPILER = "src/modules/prompt-compiler/example.ts";
const hasRule = (messages: { ruleId: string | null }[], ruleId: string) =>
  messages.some((m) => m.ruleId === ruleId);

describe("ESLint dependency boundaries", () => {
  it("rejects React in the pure compiler", async () => {
    const m = await lint(COMPILER, 'import { useState } from "react";\nexport const x = useState;\n');
    expect(hasRule(m, "no-restricted-imports")).toBe(true);
  });

  it("rejects Next.js in the pure compiler", async () => {
    const m = await lint(COMPILER, 'import { NextResponse } from "next/server";\nexport const x = NextResponse;\n');
    expect(hasRule(m, "no-restricted-imports")).toBe(true);
  });

  it("rejects node: built-ins in the pure compiler", async () => {
    const m = await lint(COMPILER, 'import { readFileSync } from "node:fs";\nexport const x = readFileSync;\n');
    expect(hasRule(m, "no-restricted-imports")).toBe(true);
  });

  it("rejects network/browser globals in the pure compiler", async () => {
    const m = await lint(COMPILER, "export const f = () => fetch('/x');\n");
    expect(hasRule(m, "no-restricted-globals")).toBe(true);
    const m2 = await lint(COMPILER, "export const s = () => localStorage.getItem('k');\n");
    expect(hasRule(m2, "no-restricted-globals")).toBe(true);
  });

  it("applies the same purity rules to templates", async () => {
    const m = await lint("src/modules/templates/example.ts", 'import React from "react";\nexport default React;\n');
    expect(hasRule(m, "no-restricted-imports")).toBe(true);
  });

  it("rejects UI and infrastructure imports from any domain module", async () => {
    const ui = await lint("src/modules/projects/example.ts", 'import { Button } from "@/components/ui/button";\nexport const x = Button;\n');
    expect(hasRule(ui, "no-restricted-imports")).toBe(true);
    const infra = await lint("src/modules/runs/example.ts", 'import { repo } from "@/infrastructure/storage-browser";\nexport const x = repo;\n');
    expect(hasRule(infra, "no-restricted-imports")).toBe(true);
    const app = await lint("src/modules/runs/example.ts", 'import page from "@/app/page";\nexport const x = page;\n');
    expect(hasRule(app, "no-restricted-imports")).toBe(true);
  });

  it("rejects deep imports into another module's internals", async () => {
    const m = await lint("src/modules/projects/example.ts", 'import { run } from "@/modules/runs/service";\nexport const x = run;\n');
    expect(hasRule(m, "no-restricted-imports")).toBe(true);
    const fromApp = await lint("src/app/example.ts", 'import { run } from "@/modules/runs/service";\nexport const x = run;\n');
    expect(hasRule(fromApp, "no-restricted-imports")).toBe(true);
  });

  it("rejects lib/ importing domain modules", async () => {
    const m = await lint("src/lib/example.ts", 'import { p } from "@/modules/projects";\nexport const x = p;\n');
    expect(hasRule(m, "no-restricted-imports")).toBe(true);
  });

  it("rejects eval and new Function everywhere", async () => {
    const m = await lint("src/lib/example.ts", "export const a = (s: string) => eval(s);\n");
    expect(hasRule(m, "no-eval")).toBe(true);
    const m2 = await lint("src/lib/example.ts", "export const b = new Function('return 1');\n");
    expect(hasRule(m2, "no-new-func")).toBe(true);
  });

  it("still allows legitimate imports (rules are not over-blocking)", async () => {
    const compiler = await lint(
      COMPILER,
      'import { z } from "zod";\nimport { helper } from "./helper";\nimport { id } from "@/lib/id";\nimport { run } from "@/modules/runs";\nexport const x = [z, helper, id, run];\n',
    );
    expect(hasRule(compiler, "no-restricted-imports")).toBe(false);
    expect(hasRule(compiler, "no-restricted-globals")).toBe(false);

    const app = await lint("src/app/example.ts", 'import { p } from "@/modules/projects";\nimport { b } from "@/components/ui/button";\nexport const x = [p, b];\n');
    expect(hasRule(app, "no-restricted-imports")).toBe(false);

    const component = await lint("src/components/shared/example.ts", "export const f = () => fetch('/x');\n");
    expect(hasRule(component, "no-restricted-globals")).toBe(false);
  });
});

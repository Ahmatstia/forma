// R0 toolchain smoke tests. These prove that Vitest, TypeScript path aliases and Zod
// work together. They intentionally contain no product logic.
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { SMOKE_MARKER } from "@/lib/smoke";

describe("toolchain smoke", () => {
  it("resolves the @/ path alias", () => {
    expect(SMOKE_MARKER).toBe("forma-r0");
  });

  it("runs Zod validation", () => {
    const schema = z.object({ name: z.string().min(1) });
    expect(schema.safeParse({ name: "Forma" }).success).toBe(true);
    expect(schema.safeParse({ name: "" }).success).toBe(false);
  });
});

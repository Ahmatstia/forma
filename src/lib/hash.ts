/**
 * Deterministic 64-bit FNV-1a string hash.
 * Zero-dependency, pure functional, runs identically across browser, Node, and workers.
 */
export function deterministicHash(input: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x84222325;

  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    h1 ^= code;
    h1 = Math.imul(h1, 0x01000193);

    h2 ^= code;
    h2 = Math.imul(h2, 0x01000193) ^ (h1 >>> 16);
  }

  const p1 = (h1 >>> 0).toString(16).padStart(8, "0");
  const p2 = (h2 >>> 0).toString(16).padStart(8, "0");
  return `${p1}${p2}`;
}

/**
 * Produces a stable, canonically sorted JSON representation for deterministic hashing.
 */
export function canonicalJsonString(data: unknown): string {
  if (data === null || typeof data !== "object") {
    return JSON.stringify(data);
  }

  if (Array.isArray(data)) {
    return "[" + data.map(canonicalJsonString).join(",") + "]";
  }

  const entries = Object.entries(data as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b));

  return "{" + entries.map(([k, v]) => JSON.stringify(k) + ":" + canonicalJsonString(v)).join(",") + "}";
}

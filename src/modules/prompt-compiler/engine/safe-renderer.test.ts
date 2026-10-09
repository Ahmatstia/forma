import { describe, expect, it } from "vitest";
import { SafeTemplateRenderer } from "./safe-renderer";

describe("SafeTemplateRenderer", () => {
  const renderer = new SafeTemplateRenderer();

  it("renders simple variable interpolation", () => {
    const template = "Halo {{ name }}, proyek: {{ project.title }}!";
    const context = { name: "Budi", project: { title: "Forma" } };
    expect(renderer.render(template, context)).toBe("Halo Budi, proyek: Forma!");
  });

  it("handles filters pipeline", () => {
    const template = "Problem: {{ problem | or_unknown }} | Alternatif: {{ alt | or_default: 'Manual' }}";
    const context = { problem: "", alt: "" };
    expect(renderer.render(template, context)).toBe(
      "Problem: belum diketahui | Alternatif: Manual"
    );
  });

  it("handles list formatting filters", () => {
    const template = "Bukti: {{ evidence | format_list_or_unknown }}\nUnknowns: {{ unknowns | format_list_or_none }}";
    const context = {
      evidence: ["Wawancara 5 mahasiswa", "Observasi biaya"],
      unknowns: [],
    };
    expect(renderer.render(template, context)).toBe(
      "Bukti: - Wawancara 5 mahasiswa\n- Observasi biaya\nUnknowns: Tidak ada"
    );
  });

  it("evaluates if-else conditionals correctly", () => {
    const template = "{% if isMobile %}Platform Mobile aktif{% else %}Platform Web aktif{% endif %}";
    expect(renderer.render(template, { isMobile: true })).toBe("Platform Mobile aktif");
    expect(renderer.render(template, { isMobile: false })).toBe("Platform Web aktif");
  });

  it("evaluates for loops correctly", () => {
    const template = "Daftar:{% for item in items %}\n- {{ item }}{% endfor %}";
    const context = { items: ["Satu", "Dua", "Tiga"] };
    expect(renderer.render(template, context)).toBe("Daftar:\n- Satu\n- Dua\n- Tiga");
  });

  it("strictly rejects unallowlisted tags with SecurityError", () => {
    expect(() => renderer.render('{% render "dangerous.html" %}', {})).toThrow(
      "SecurityError: Tag 'render' is not allowlisted"
    );
    expect(() => renderer.render('{% include "passwd" %}', {})).toThrow(
      "SecurityError: Tag 'include' is not allowlisted"
    );
    expect(() => renderer.render('{% eval "1+1" %}', {})).toThrow(
      "SecurityError: Tag 'eval' is not allowlisted"
    );
  });

  it("blocks prototype pollution traversal", () => {
    expect(() => renderer.render("{{ __proto__.polluted }}", {})).toThrow(
      "SecurityError: Access to forbidden property '__proto__'"
    );
    expect(() => renderer.render("{{ constructor.name }}", {})).toThrow(
      "SecurityError: Access to forbidden property 'constructor'"
    );
  });
});

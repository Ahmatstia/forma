import { PromptTemplate } from "../types";

export const P01_PRODUCT_BRIEF_V1: PromptTemplate = {
  id: "P-01-PRODUCT-BRIEF",
  slug: "product-brief",
  name: "Product Brief & MVP Scope",
  description:
    "Mengubah discovery context yang disetujui menjadi tujuan produk, prioritas scope MVP, dan batasan terarah untuk solo developer.",
  category: "product",
  stage: "1",
  supportedPlatforms: [
    "web",
    "android",
    "ios",
    "cross_platform_mobile",
    "backend_api",
    "multi_platform",
  ],
  complexityTracks: ["quick", "standard", "advanced"],
  status: "published",
  currentVersion: 1,
  prerequisites: ["P-00-IDEA"],
  suggestedNextTemplates: ["P-02-PRD"],
  versions: [
    {
      templateId: "P-01-PRODUCT-BRIEF",
      version: 1,
      createdAt: "2026-10-09T00:00:00Z",
      inputVariables: [
        {
          key: "project.deliveryConstraints",
          label: "Batasan Waktu & Kapasitas",
          description: "Waktu luang per minggu atau batas waktu peluncuran MVP.",
          required: false,
          supportsUnknown: true,
          valueType: "string",
        },
        {
          key: "architecture.technologyPreference",
          label: "Preferensi Teknologi",
          description: "Framework atau bahasa pemrograman yang ingin digunakan.",
          required: false,
          supportsUnknown: true,
          valueType: "string",
        },
      ],
      outputContractSections: [
        "EXECUTIVE_SUMMARY",
        "PROBLEM_STATEMENT",
        "TARGET_USERS",
        "VALUE_PROPOSITION",
        "GOALS_AND_SUCCESS_SIGNALS",
        "MVP_SCOPE",
        "OUT_OF_SCOPE",
        "CONSTRAINTS",
        "ASSUMPTIONS_AND_RISKS",
        "DEPENDENCIES",
        "OPEN_DECISIONS",
      ],
      templateBody: `# Peran
Bertindak sebagai Product Owner dan Product Manager yang memandu solo developer menyusun batasan produk yang realistis dan dapat dieksekusi.

# Tujuan
Buat Product Brief yang mengubah konteks discovery P-00 yang telah disetujui menjadi tujuan produk yang tajam dan batasan scope MVP yang jelas.

# Konteks Discovery yang Disetujui
{{ context.artifact.P00.approvedContent | fence_data }}

# Batasan Proyek Tambahan
- Platform: {{ derived.project.platformsText }}
- Waktu / Biaya / Kapasitas Solo Dev: {{ answers.project.deliveryConstraints | or_unknown }}
- Preferensi Teknologi: {{ answers.architecture.technologyPreference | or_unknown }}

# Langkah Kerja
1. Rumuskan problem, target user, value proposition, dan outcome yang ingin dicapai berdasarkan discovery yang disetujui.
2. Tetapkan goals dan metrik/sinyal keberhasilan yang realistis untuk solo developer. Jangan membuat baseline palsu.
3. Kelompokkan kebutuhan menjadi MVP (must-have awal), Later (fase berikutnya), dan Non-goals (di luar scope).
4. Urutkan prioritas dengan rationale dan dependency yang masuk akal.
5. Tunjukkan risiko product/technical feasibility serta asumsi paling berdampak.
6. Identifikasi keputusan yang harus diambil developer sebelum masuk ke PRD. Tandai usulan baru sebagai \`PROPOSED\`.

# Kontrak Output
Keluarkan dokumen terstruktur \`PRODUCT_BRIEF.md\` dalam Markdown:
1. \`EXECUTIVE_SUMMARY\`
2. \`PROBLEM_STATEMENT\`
3. \`TARGET_USERS\`
4. \`VALUE_PROPOSITION\`
5. \`GOALS_AND_SUCCESS_SIGNALS\`
6. \`MVP_SCOPE\` (daftar fitur inti beserta rationale)
7. \`OUT_OF_SCOPE\` (non-goals yang jelas ditolak untuk MVP)
8. \`CONSTRAINTS\`
9. \`ASSUMPTIONS_AND_RISKS\`
10. \`DEPENDENCIES\`
11. \`OPEN_DECISIONS\`

Setiap rekomendasi wajib memiliki alasan teknis/produk. Tandai usulan yang belum disetujui sebagai PROPOSED.`,
    },
  ],
};

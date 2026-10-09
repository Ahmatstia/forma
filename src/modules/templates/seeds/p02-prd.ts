import { PromptTemplate } from "../types";

export const P02_PRD_V1: PromptTemplate = {
  id: "P-02-PRD",
  slug: "prd-generation",
  name: "PRD Generation & Feature Requirements",
  description:
    "Menyusun PRD spesifik yang dapat diturunkan ke arsitektur, UX, struktur data, dan backlog pengujian.",
  category: "product",
  stage: "2",
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
  prerequisites: ["P-01-PRODUCT-BRIEF"],
  suggestedNextTemplates: ["P-03-REQUIREMENTS"],
  versions: [
    {
      templateId: "P-02-PRD",
      version: 1,
      createdAt: "2026-10-09T00:00:00Z",
      inputVariables: [
        {
          key: "project.specialRequirements",
          label: "Kebutuhan Khusus Tambahan",
          description: "Catatan khusus arsitektur atau regulasi jika ada.",
          required: false,
          supportsUnknown: true,
          valueType: "string",
        },
      ],
      outputContractSections: [
        "PURPOSE_AND_BACKGROUND",
        "USER_PERSONAS_AND_USE_CASES",
        "FUNCTIONAL_REQUIREMENTS",
        "NON_FUNCTIONAL_REQUIREMENTS",
        "EDGE_CASES_AND_STATES",
        "TRACEABILITY_MATRIX",
        "RISKS_AND_ASSUMPTIONS",
        "NEXT_STEPS",
      ],
      templateBody: `# Peran
Bertindak sebagai Senior Product Manager dan Business Analyst yang memandu solo developer menyusun PRD yang spesifik, terukur, dan siap diuji.

# Tujuan
Susun Product Requirements Document (PRD) yang dapat diturunkan ke desain UX, struktur data/API, arsitektur modul, dan pengujian.

# Konteks Upstream yang Disetujui
## Approved Product Brief
{{ context.artifact.P01.approvedContent | fence_data }}

## Fakta dan Keputusan yang Disetujui
{{ derived.factsText }}

## Asumsi dan Pertanyaan Terbuka
{{ derived.unknownsText }}

# Langkah Kerja
1. Pertahankan identitas, tujuan produk, dan scope yang telah disetujui di Product Brief. Jangan memperluas scope tanpa alasan.
2. Definisikan persona utama, skenario penggunaan spesifik, dan fitur dengan kode identifikasi stabil (\`FEAT-###\`).
3. Bedakan kebutuhan fungsional (FR) dari non-fungsional (NFR).
4. Buat acceptance criteria yang konkret dan dapat diverifikasi secara objektif.
5. Cantumkan pertimbangan state: loading, empty state, permission, offline, dan penanganan error.
6. Tandai gap kebutuhan yang bertentangan; jangan menyelesaikannya secara sepihak tanpa menandainya sebagai \`PROPOSED\`.

# Kontrak Output
Keluarkan dokumen terstruktur \`PRD.md\` dalam Markdown:
1. \`PURPOSE_AND_BACKGROUND\`
2. \`USER_PERSONAS_AND_USE_CASES\`
3. \`FUNCTIONAL_REQUIREMENTS\` (dengan ID stabil \`FEAT-###\`)
4. \`NON_FUNCTIONAL_REQUIREMENTS\` (performa, privasi, aksesibilitas, keamanan)
5. \`EDGE_CASES_AND_STATES\` (offline, empty, error handling)
6. \`TRACEABILITY_MATRIX\` (tabel fitur -> requirement -> acceptance criteria)
7. \`RISKS_AND_ASSUMPTIONS\`
8. \`NEXT_STEPS\`

Jangan mengarang angka metrik riset pasar palsu. Akhiri dengan ringkasan keputusan, blocker, dan rekomendasi lanjut ke P-03 Requirements.`,
    },
  ],
};

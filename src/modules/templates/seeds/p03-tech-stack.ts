import { PromptTemplate } from "../types";

export const P03_TECH_STACK_V1: PromptTemplate = {
  id: "P-03-TECH-STACK",
  slug: "tech-stack-and-architecture",
  name: "P-03: Tech Stack & Architecture",
  description:
    "Rancang arsitektur sistem, tech stack yang tepat, struktur modul/folder, strategi data/API, serta mitigasi risiko teknis berdasarkan PRD yang disetujui.",
  category: "architecture",
  stage: "3",
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
  prerequisites: ["P-02-PRD"],
  suggestedNextTemplates: ["P-04W-WEB-PLATFORM", "P-04M-MOBILE-PLATFORM"],
  versions: [
    {
      templateId: "P-03-TECH-STACK",
      version: 1,
      createdAt: "2026-10-10T00:00:00Z",
      inputVariables: [
        {
          key: "architecture.preferredStack",
          label: "Preferensi Utama Tech Stack",
          description: "Bahasa, framework, atau runtime yang paling dikuasai.",
          required: false,
          supportsUnknown: true,
          valueType: "string",
        },
        {
          key: "architecture.dataScale",
          label: "Ekspektasi Skala Data",
          description: "Perkiraan volume data lokal/server dan konkurensi awal.",
          required: false,
          supportsUnknown: true,
          valueType: "string",
        },
        {
          key: "architecture.hostingTarget",
          label: "Target Hosting / Infrastruktur",
          description: "Lingkungan deployment tempat aplikasi akan dijalankan.",
          required: false,
          supportsUnknown: true,
          valueType: "string",
        },
      ],
      outputContractSections: [
        "EXECUTIVE_SUMMARY_AND_STACK_OVERVIEW",
        "SYSTEM_ARCHITECTURE_RATIONALE",
        "RECOMMENDED_TECH_STACK",
        "COMPONENT_AND_DATA_FLOW_DIAGRAM",
        "FOLDER_STRUCTURE_AND_MODULE_BOUNDARIES",
        "DATA_PERSISTENCE_AND_API_STRATEGY",
        "SECURITY_PRIVACY_PERFORMANCE_MAINTAINABILITY",
        "TECHNICAL_RISKS_ALTERNATIVES_OPEN_DECISIONS",
      ],
      templateBody: `# Peran
Bertindak sebagai Software Architect, System Analyst, dan Tech Lead yang membimbing solo developer merancang arsitektur aplikasi yang pragmatis, maintainable, dan sesuai batas kemampuan.

# Tujuan
Rancang arsitektur sistem dan rekomendasi tech stack komprehensif berdasarkan Dokumen PRD yang telah disetujui dari tahap P-02. Jangan mengarang kebutuhan fungsional di luar PRD.

# Dokumen PRD yang Disetujui (Konteks Hulu P-02)
{{ context.artifact.P02.approvedContent | fence_data }}

# Parameter Teknis Awal
- Preferensi Teknologi Pengembang: {{ answers.architecture.preferredStack | or_unknown }}
- Ekspektasi Skala Data / Beban: {{ answers.architecture.dataScale | or_unknown }}
- Target Lingkungan Deployment: {{ answers.architecture.hostingTarget | or_unknown }}

# Langkah Kerja
1. Analisis seluruh kebutuhan fungsional dan non-fungsional dari PRD yang disetujui.
2. Rekomendasikan tech stack yang konkret (frontend, backend/runtime, database, styling, testing) dengan trade-off yang jujur untuk solo developer.
3. Rancang arsitektur sistem (monolith modular, client-server, offline-first local storage, dll.) beserta alasannya.
4. Buat diagram komponen dan alur data utama dalam format teks (Mermaid atau teks ASCII).
5. Buat struktur folder proyek yang jelas beserta tanggung jawab setiap modul.
6. Tetapkan batas domain (module boundaries) dan kontrak integrasi antarkomponen.
7. Definisikan strategi persistensi data dan integrasi API (jika server diperlukan).
8. Tinjau aspek keamanan, privasi data, performa, maintainability, dan pengujian.
9. Rangkum risiko teknis, alternatif pendekatan, asumsi sementara, dan keputusan yang masih terbuka.

# Kontrak Output
Keluarkan dokumen terstruktur \`TECH_STACK_AND_ARCHITECTURE.md\` dalam Markdown:
1. \`EXECUTIVE_SUMMARY_AND_STACK_OVERVIEW\`
2. \`SYSTEM_ARCHITECTURE_RATIONALE\`
3. \`RECOMMENDED_TECH_STACK\` (Tabel komponen, library/framework terpilih, alasan, dan risiko)
4. \`COMPONENT_AND_DATA_FLOW_DIAGRAM\` (Diagram Mermaid \`flowchart\` atau \`sequenceDiagram\`)
5. \`FOLDER_STRUCTURE_AND_MODULE_BOUNDARIES\`
6. \`DATA_PERSISTENCE_AND_API_STRATEGY\`
7. \`SECURITY_PRIVACY_PERFORMANCE_MAINTAINABILITY\`
8. \`TECHNICAL_RISKS_ALTERNATIVES_OPEN_DECISIONS\`

Setiap rekomendasi wajib memiliki alasan teknis/arsitektur. Tandai usulan yang belum disetujui pengguna sebagai PROPOSED.`,
    },
  ],
};

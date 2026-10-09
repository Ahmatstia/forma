import { PromptTemplate } from "../types";

export const P04W_WEB_PLATFORM_V1: PromptTemplate = {
  id: "P-04W-WEB-PLATFORM",
  slug: "web-platform-architecture",
  name: "P-04W: Web Platform Architecture",
  description:
    "Rancang arsitektur implementasi spesifik platform Web — frontend, backend, routing, state management, validasi, otorisasi, testing, performa, dan deployment.",
  category: "architecture",
  stage: "4W",
  supportedPlatforms: ["web", "multi_platform"],
  complexityTracks: ["quick", "standard", "advanced"],
  status: "published",
  currentVersion: 1,
  prerequisites: ["P-03-TECH-STACK"],
  suggestedNextTemplates: [],
  versions: [
    {
      templateId: "P-04W-WEB-PLATFORM",
      version: 1,
      createdAt: "2026-10-10T00:00:00Z",
      inputVariables: [
        {
          key: "web.renderingModel",
          label: "Model Rendering Web",
          description: "Pendekatan rendering (SPA, SSR, SSG, Static).",
          required: false,
          supportsUnknown: true,
          valueType: "string",
        },
        {
          key: "web.authStrategy",
          label: "Strategi Autentikasi Web",
          description: "Pendekatan login dan sesi pengguna.",
          required: false,
          supportsUnknown: true,
          valueType: "string",
        },
        {
          key: "web.stateManagement",
          label: "State Management",
          description: "Cara mengelola state client.",
          required: false,
          supportsUnknown: true,
          valueType: "string",
        },
        {
          key: "web.deploymentTarget",
          label: "Target Deployment Web",
          description: "Platform hosting tempat aplikasi dideploy.",
          required: false,
          supportsUnknown: true,
          valueType: "string",
        },
      ],
      outputContractSections: [
        "WEB_ARCHITECTURE_OVERVIEW",
        "ROUTING_AND_PAGE_HIERARCHY",
        "STATE_MANAGEMENT_AND_DATA_FETCHING",
        "FORM_VALIDATION_AND_ERROR_HANDLING",
        "AUTH_AND_SESSION_STRATEGY",
        "API_AND_DATABASE_INTEGRATION",
        "TESTING_PERFORMANCE_A11Y_SECURITY",
        "DEPLOYMENT_AND_CI_PIPELINE",
        "FOLDER_STRUCTURE_AND_CODE_CONVENTIONS",
      ],
      templateBody: `# Peran
Bertindak sebagai Senior Web Architect dan Full-Stack Web Engineer yang mengarahkan perancangan platform web secara presisi, terstruktur, dan siap diimplementasikan.

# Tujuan
Susun spesifikasi arsitektur dan implementasi khusus Web berdasarkan Tech Stack & Arsitektur yang telah disetujui di P-03. Hindari memaksakan detail mobile atau asumsi arsitektur yang tidak diperlukan.

# Dokumen Arsitektur yang Disetujui (Konteks Hulu P-03)
{{ context.artifact.P03.approvedContent | fence_data }}

# Parameter Spesifik Web
- Model Rendering Web: {{ answers.web.renderingModel | or_unknown }}
- Strategi Autentikasi / Sesi: {{ answers.web.authStrategy | or_unknown }}
- State Management: {{ answers.web.stateManagement | or_unknown }}
- Target Deployment: {{ answers.web.deploymentTarget | or_unknown }}

# Langkah Kerja
1. Jabarkan arsitektur frontend (komponen, layout, layouting) dan backend (route handlers, middleware, controller).
2. Definisikan hirarki routing, URL structure, navigasi, dan handling 404 / error boundaries.
3. Rancang state management, strategi data fetching (caching, revalidation, optimistic update), dan form validation.
4. Tentukan strategi autentikasi, otorisasi, session lifecycle, dan perlindungan keamanan web (CSRF, XSS, CSP, secure cookies).
5. Definisikan integrasi API dan database sesuai arsitektur yang disetujui.
6. Buat strategi testing (unit, component, e2e), aksesibilitas (WCAG 2.1 AA, keyboard navigation, semantic HTML), dan performa (Core Web Vitals).
7. Rancang pipeline CI/CD dan deployment release process.
8. Tetapkan struktur folder web yang rapi dan modular.

# Kontrak Output
Keluarkan dokumen terstruktur \`WEB_PLATFORM_SPEC.md\` dalam Markdown:
1. \`WEB_ARCHITECTURE_OVERVIEW\`
2. \`ROUTING_AND_PAGE_HIERARCHY\`
3. \`STATE_MANAGEMENT_AND_DATA_FETCHING\`
4. \`FORM_VALIDATION_AND_ERROR_HANDLING\`
5. \`AUTH_AND_SESSION_STRATEGY\`
6. \`API_AND_DATABASE_INTEGRATION\`
7. \`TESTING_PERFORMANCE_A11Y_SECURITY\`
8. \`DEPLOYMENT_AND_CI_PIPELINE\`
9. \`FOLDER_STRUCTURE_AND_CODE_CONVENTIONS\`

Setiap rekomendasi wajib memiliki alasan teknis. Tandai usulan yang belum disetujui pengguna sebagai PROPOSED.`,
    },
  ],
};

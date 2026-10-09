import { PromptTemplate } from "../types";

export const P04M_MOBILE_PLATFORM_V1: PromptTemplate = {
  id: "P-04M-MOBILE-PLATFORM",
  slug: "mobile-platform-architecture",
  name: "P-04M: Mobile Platform Architecture",
  description:
    "Rancang arsitektur implementasi spesifik platform Mobile — framework, navigasi, state management, offline-first/lokal storage, sync, permissions, device security, dan rilis app store.",
  category: "architecture",
  stage: "4M",
  supportedPlatforms: ["android", "ios", "cross_platform_mobile", "multi_platform"],
  complexityTracks: ["quick", "standard", "advanced"],
  status: "published",
  currentVersion: 1,
  prerequisites: ["P-03-TECH-STACK"],
  suggestedNextTemplates: [],
  versions: [
    {
      templateId: "P-04M-MOBILE-PLATFORM",
      version: 1,
      createdAt: "2026-10-10T00:00:00Z",
      inputVariables: [
        {
          key: "mobile.frameworkChoice",
          label: "Pilihan Framework Mobile",
          description: "Framework mobile yang digunakan (Flutter, React Native, Native).",
          required: false,
          supportsUnknown: true,
          valueType: "string",
        },
        {
          key: "mobile.offlineSyncStrategy",
          label: "Strategi Offline & Sinkronisasi",
          description: "Penyimpanan lokal di perangkat dan sinkronisasi.",
          required: false,
          supportsUnknown: true,
          valueType: "string",
        },
        {
          key: "mobile.devicePermissions",
          label: "Izin Perangkat (Permissions)",
          description: "Izin perangkat yang dibutuhkan.",
          required: false,
          supportsUnknown: true,
          valueType: "string",
        },
        {
          key: "mobile.targetStores",
          label: "Target Distribusi App Store",
          description: "Kanal rilis aplikasi mobile.",
          required: false,
          supportsUnknown: true,
          valueType: "string",
        },
      ],
      outputContractSections: [
        "MOBILE_ARCHITECTURE_AND_FRAMEWORK_SELECTION",
        "NAVIGATION_AND_SCREEN_FLOW",
        "STATE_MANAGEMENT_AND_STORE_LIFECYCLE",
        "OFFLINE_FIRST_LOCAL_PERSISTENCE_AND_SYNC",
        "API_AUTH_AND_NETWORK_RESILIENCE",
        "DEVICE_CAPABILITIES_AND_PERMISSION_HANDLING",
        "DEVICE_SECURITY_DATA_PROTECTION",
        "TESTING_PERFORMANCE_BATTERY_CONSTRAINTS",
        "BUILD_RELEASE_PIPELINE_STORE_READINESS",
        "MOBILE_FOLDER_STRUCTURE_AND_MODULE_CONTRACTS",
      ],
      templateBody: `# Peran
Bertindak sebagai Mobile Solutions Architect dan Senior Mobile Engineer yang memandu perancangan aplikasi mobile yang tangguh, hemat baterai, dan responsif.

# Tujuan
Susun spesifikasi arsitektur dan implementasi khusus Mobile berdasarkan Tech Stack & Arsitektur yang telah disetujui di P-03. Hindari memaksakan detail web atau asumsi jaringan selalu stabil.

# Dokumen Arsitektur yang Disetujui (Konteks Hulu P-03)
{{ context.artifact.P03.approvedContent | fence_data }}

# Parameter Spesifik Mobile
- Pilihan Framework Mobile: {{ answers.mobile.frameworkChoice | or_unknown }}
- Strategi Offline & Sinkronisasi: {{ answers.mobile.offlineSyncStrategy | or_unknown }}
- Izin Perangkat (Permissions): {{ answers.mobile.devicePermissions | or_unknown }}
- Target App Store / Distribusi: {{ answers.mobile.targetStores | or_unknown }}

# Langkah Kerja
1. Evaluasi framework dan arsitektur mobile berdasarkan batasan solo developer dan kebutuhan proyek.
2. Rancang struktur navigasi (stack, tabs, modal, deep linking) dan screen lifecycle.
3. Tetapkan state management, reactive stream, dan lifecycle events (background, resume, suspend).
4. Rancang strategi offline-first: penyimpanan lokal, skema migrasi database lokal, dan penanganan konflik sinkronisasi.
5. Definisikan ketahanan jaringan (retry with exponential backoff, offline queue, circuit breaker).
6. Kelola izin perangkat (runtime permissions) dengan penjelasan privasi yang ramah pengguna.
7. Tinjau keamanan data perangkat (keystore/keychain, enkripsi penyimpanan, sertifikat pinning).
8. Buat strategi testing (unit, widget/screen, instrumented), optimasi konsumsi baterai, dan ukuran bundle.
9. Rancang pipeline build rilis (keystore signing, Fastlane/CI, Play Store / App Store requirements).
10. Tetapkan struktur folder dan kontrak antarmodul.

# Kontrak Output
Keluarkan dokumen terstruktur \`MOBILE_PLATFORM_SPEC.md\` dalam Markdown:
1. \`MOBILE_ARCHITECTURE_AND_FRAMEWORK_SELECTION\`
2. \`NAVIGATION_AND_SCREEN_FLOW\`
3. \`STATE_MANAGEMENT_AND_STORE_LIFECYCLE\`
4. \`OFFLINE_FIRST_LOCAL_PERSISTENCE_AND_SYNC\`
5. \`API_AUTH_AND_NETWORK_RESILIENCE\`
6. \`DEVICE_CAPABILITIES_AND_PERMISSION_HANDLING\`
7. \`DEVICE_SECURITY_DATA_PROTECTION\`
8. \`TESTING_PERFORMANCE_BATTERY_CONSTRAINTS\`
9. \`BUILD_RELEASE_PIPELINE_STORE_READINESS\`
10. \`MOBILE_FOLDER_STRUCTURE_AND_MODULE_CONTRACTS\`

Setiap rekomendasi wajib memiliki alasan teknis. Tandai usulan yang belum disetujui pengguna sebagai PROPOSED.`,
    },
  ],
};

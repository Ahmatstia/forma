import { PromptTemplate } from "../types";

export const P00_IDEA_V1: PromptTemplate = {
  id: "P-00-IDEA",
  slug: "idea-clarification",
  name: "Klarifikasi Ide & Eksplorasi Masalah",
  description:
    "Membimbing solo developer memperjelas ide awal, memisahkan masalah dari solusi, mengidentifikasi asumsi berisiko, dan menyusun rencana validasi awal.",
  category: "discovery",
  stage: "0",
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
  prerequisites: [],
  suggestedNextTemplates: ["P-01-PRODUCT-BRIEF"],
  versions: [
    {
      templateId: "P-00-IDEA",
      version: 1,
      createdAt: "2026-10-09T00:00:00Z",
      inputVariables: [
        {
          key: "project.name",
          label: "Nama Proyek",
          description: "Nama sementara aplikasi atau produk.",
          required: true,
          supportsUnknown: false,
          valueType: "string",
        },
        {
          key: "project.ideaSummary",
          label: "Deskripsi Ide Awal",
          description: "Penjelasan ide produk dengan kata-kata sendiri.",
          required: true,
          supportsUnknown: false,
          valueType: "string",
        },
        {
          key: "project.platforms",
          label: "Target Platform",
          description: "Platform target awal yang dibayangkan.",
          required: true,
          supportsUnknown: true,
          valueType: "string_list",
        },
        {
          key: "project.complexityTrack",
          label: "Jalur Kompleksitas",
          description: "Tingkat kedalaman proses (quick, standard, advanced).",
          required: true,
          supportsUnknown: false,
          valueType: "enum",
          defaultValue: "standard",
        },
        {
          key: "product.targetUsers",
          label: "Target Pengguna",
          description: "Siapa yang mengalami masalah dan akan menggunakan aplikasi.",
          required: false,
          supportsUnknown: true,
          valueType: "string",
        },
        {
          key: "product.problem",
          label: "Dugaan Masalah",
          description: "Masalah utama yang dihadapi pengguna saat ini.",
          required: false,
          supportsUnknown: true,
          valueType: "string",
        },
        {
          key: "product.currentAlternatives",
          label: "Alternatif / Workaround Saat Ini",
          description: "Cara pengguna menyelesaikan masalah sekarang.",
          required: false,
          supportsUnknown: true,
          valueType: "string",
        },
        {
          key: "project.constraintsSummary",
          label: "Batasan Proyek",
          description: "Kendala waktu, biaya, keahlian, atau cara kerja (misal solo developer).",
          required: false,
          supportsUnknown: true,
          valueType: "string",
        },
        {
          key: "research.evidence",
          label: "Bukti Nyata yang Sudah Ada",
          description: "Data observasi atau wawancara yang sudah dimiliki (jika ada).",
          required: false,
          supportsUnknown: true,
          valueType: "string_list",
        },
        {
          key: "product.unknowns",
          label: "Hal yang Belum Diketahui",
          description: "Daftar hal yang masih membingungkan atau belum diputuskan.",
          required: false,
          supportsUnknown: true,
          valueType: "string_list",
        },
      ],
      outputContractSections: [
        "IDEA_SUMMARY",
        "PROBLEM_STATEMENT",
        "TARGET_USERS_AND_SITUATIONS",
        "FACTS_ASSUMPTIONS_OPEN_QUESTIONS",
        "ALTERNATIVES_AND_WORKAROUNDS",
        "VALUE_HYPOTHESES",
        "VALIDATION_PLAN",
        "MVP_DIRECTION_OPTIONS",
        "RECOMMENDED_NEXT_STEP",
      ],
      templateBody: `# Peran
Bertindak sebagai Product Discovery Lead dan Business Analyst yang membimbing solo developer. Berikan arahan yang praktis, tidak berasumsi bahwa ide sudah tervalidasi.

# Tujuan
Perjelas ide berikut dan ubah menjadi problem framing yang bisa dipakai untuk mengambil keputusan apakah, untuk siapa, dan dalam bentuk apa produk perlu dibangun.

# Ide awal
DATA PENGGUNA:
{{ answers.project.ideaSummary | fence_data }}

# Input yang sudah diketahui
- Target pengguna: {{ answers.product.targetUsers | or_unknown }}
- Dugaan masalah: {{ answers.product.problem | or_unknown }}
- Alternatif/workaround saat ini: {{ answers.product.currentAlternatives | or_unknown }}
- Batasan: {{ answers.project.constraintsSummary | or_unknown }}
- Bukti yang sudah ada: {{ answers.research.evidence | format_list_or_unknown }}
- Hal yang belum diketahui menurut pengguna: {{ answers.product.unknowns | format_list_or_none }}

# Langkah kerja
1. Rangkum ide tanpa mengubah maksud pengguna.
2. Pisahkan masalah yang diketahui dari solusi yang baru dibayangkan.
3. Tunjukkan asumsi paling berisiko dan informasi yang belum diketahui.
4. Identifikasi target pengguna awal dan situasi penggunaan spesifik.
5. Bandingkan alternatif/workaround yang sudah tercatat; jangan mengarang hasil riset pasar.
6. Usulkan 3–7 pertanyaan validasi atau eksperimen dengan biaya rendah, prioritas, bukti yang akan diamati, serta batasan interpretasi.
7. Buat problem statement dan hipotesis nilai yang dapat diuji.
8. Tentukan apakah ada blocker untuk lanjut ke Product Brief. Jika tidak, nyatakan item yang tetap menjadi asumsi.

# Kontrak output
Gunakan Markdown dan keluarkan:
1. \`IDEA_SUMMARY\`
2. \`PROBLEM_STATEMENT\`
3. \`TARGET_USERS_AND_SITUATIONS\`
4. \`FACTS_ASSUMPTIONS_OPEN_QUESTIONS\` dalam tabel
5. \`ALTERNATIVES_AND_WORKAROUNDS\`
6. \`VALUE_HYPOTHESES\`
7. \`VALIDATION_PLAN\` dengan eksperimen, sinyal bukti, risiko bias, dan effort
8. \`MVP_DIRECTION_OPTIONS\` maksimal 3 pilihan beserta trade-off
9. \`RECOMMENDED_NEXT_STEP\`

Jangan menyatakan ide sudah tervalidasi jika belum ada evidence. Jangan memilih fitur berdasarkan tren semata. Akhiri dengan ringkasan keputusan, asumsi, blocker, dan langkah berikutnya.`,
    },
  ],
};

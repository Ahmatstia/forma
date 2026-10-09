import { Certainty, ValueType } from "@/modules/projects";

export interface P00QuestionDef {
  key: string;
  label: string;
  group: "audience_problem" | "constraints_context" | "validation_evidence";
  groupTitle: string;
  description: string;
  placeholder: string;
  example: string;
  required: boolean;
  valueType: ValueType;
  defaultCertainty: Certainty;
  helpText: string;
}

export const P00_QUESTION_GROUPS: {
  id: "audience_problem" | "constraints_context" | "validation_evidence";
  title: string;
  description: string;
}[] = [
  {
    id: "audience_problem",
    title: "1. Target Pengguna & Eksplorasi Masalah",
    description: "Perjelas siapa yang dibantu dan masalah nyata apa yang ingin diselesaikan.",
  },
  {
    id: "constraints_context",
    title: "2. Batasan & Preferensi Teknis",
    description: "Tentukan batasan solo developer dan preferensi arsitektur awal.",
  },
  {
    id: "validation_evidence",
    title: "3. Bukti Riset & Hal yang Belum Diketahui",
    description: "Pisahkan apa yang sudah Anda buktikan dari hal yang masih menjadi pertanyaan terbuka.",
  },
];

export const P00_QUESTIONS: P00QuestionDef[] = [
  {
    key: "product.targetUsers",
    label: "Target Pengguna Awal",
    group: "audience_problem",
    groupTitle: "Target Pengguna & Eksplorasi Masalah",
    description: "Siapa pengguna spesifik pertama yang merasakan masalah ini paling mendesak?",
    placeholder: "Contoh: Mahasiswa yang tinggal di kos dan punya anggaran terbatas",
    example: "Mahasiswa tahun pertama yang pertama kali mengelola uang saku sendiri",
    required: false,
    valueType: "string",
    defaultCertainty: "confirmed",
    helpText: "Hindari 'semua orang'. Fokus pada satu segmen spesifik untuk validasi awal.",
  },
  {
    key: "product.problem",
    label: "Dugaan Masalah Inti",
    group: "audience_problem",
    groupTitle: "Target Pengguna & Eksplorasi Masalah",
    description: "Apa kesulitan terbesar mereka saat ini dan mengapa menyakitkan?",
    placeholder: "Contoh: Sering tidak sadar uang habis sebelum akhir bulan",
    example: "Uang kiriman habis dalam 10 hari pertama karena tidak ada batas harian yang jelas",
    required: false,
    valueType: "string",
    defaultCertainty: "assumption",
    helpText: "Fokus pada akar masalah, bukan solusi (jangan tulis 'tidak ada aplikasi kami').",
  },
  {
    key: "product.currentAlternatives",
    label: "Alternatif / Workaround Saat Ini",
    group: "audience_problem",
    groupTitle: "Target Pengguna & Eksplorasi Masalah",
    description: "Bagaimana cara mereka mengatasi atau bertahan dari masalah tersebut sekarang?",
    placeholder: "Contoh: Mencatat di buku kecil, spreadsheet, atau sekadar perkiraan saldo",
    example: "Cek saldo m-banking tiap beberapa hari atau mencatat di grup WhatsApp sendiri",
    required: false,
    valueType: "string",
    defaultCertainty: "assumption",
    helpText: "Jika mereka tidak melakukan apa-apa, mungkin masalahnya belum cukup menyakitkan.",
  },
  {
    key: "project.constraintsSummary",
    label: "Batasan Proyek",
    group: "constraints_context",
    groupTitle: "Batasan & Preferensi Teknis",
    description: "Batasan kapasitas solo developer, biaya, infrastruktur, atau waktu.",
    placeholder: "Contoh: Dikembangkan oleh satu developer; biaya operasi rendah",
    example: "Hanya punya waktu luang 10 jam/minggu; backend gratisan tanpa biaya server bulanan",
    required: false,
    valueType: "string",
    defaultCertainty: "confirmed",
    helpText: "Batasan realistis akan mencegah AI agent merekomendasikan arsitektur enterprise yang rumit.",
  },
  {
    key: "constraints.offlineFirst",
    label: "Preferensi Offline-First",
    group: "constraints_context",
    groupTitle: "Batasan & Preferensi Teknis",
    description: "Apakah aplikasi sebaiknya berfungsi tanpa koneksi internet?",
    placeholder: "Contoh: Aplikasi sebaiknya tetap bisa dipakai tanpa internet (offline-first)",
    example: "Pencatatan data harus bisa dilakukan saat kuota internet habis",
    required: false,
    valueType: "string",
    defaultCertainty: "preference",
    helpText: "Tandai sebagai preferensi awal jika Anda belum mengunci keputusan arsitektur data.",
  },
  {
    key: "architecture.technologyPreference",
    label: "Preferensi Teknologi / Stack",
    group: "constraints_context",
    groupTitle: "Batasan & Preferensi Teknis",
    description: "Pilihan teknologi yang Anda kuasai atau ingin digunakan.",
    placeholder: "Contoh: Flutter, React/Next.js, Kotlin, atau belum diputuskan",
    example: "Flutter untuk mobile atau Next.js untuk web",
    required: false,
    valueType: "string",
    defaultCertainty: "preference",
    helpText: "Agen AI akan menyesuaikan panduan implementasi dengan keahlian Anda.",
  },
  {
    key: "research.evidence",
    label: "Bukti Riset yang Sudah Ada",
    group: "validation_evidence",
    groupTitle: "Bukti Riset & Hal yang Belum Diketahui",
    description: "Data nyata, observasi, atau wawancara yang sudah pernah Anda lakukan (opsional).",
    placeholder: "Contoh: Obrolan dengan 4 teman kos yang mengaku sering pinjam uang di akhir bulan",
    example: "Survei kecil ke 15 mahasiswa angkatan 2025 di asrama",
    required: false,
    valueType: "string",
    defaultCertainty: "confirmed",
    helpText: "Jika belum ada riset, biarkan kosong atau tandai 'belum diketahui'. Jangan mengarang data.",
  },
  {
    key: "product.unknowns",
    label: "Hal yang Belum Diketahui / Pertanyaan Terbuka",
    group: "validation_evidence",
    groupTitle: "Bukti Riset & Hal yang Belum Diketahui",
    description: "Apa saja pertanyaan penting yang belum Anda ketahui jawabannya?",
    placeholder: "Contoh: Apakah butuh login? Apakah sinkronisasi cloud diperlukan sejak hari pertama?",
    example: "Model monetisasi apa yang cocok untuk mahasiswa beranggaran terbatas",
    required: false,
    valueType: "string",
    defaultCertainty: "unknown",
    helpText: "AI agent akan secara eksplisit menyusun rencana validasi untuk menguji pertanyaan ini.",
  },
];

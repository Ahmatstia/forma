import { P00QuestionDef } from "./p00-questions";

export const P01_QUESTIONS: P00QuestionDef[] = [
  {
    key: "project.deliveryConstraints",
    label: "Batasan Waktu & Kapasitas Solo Developer",
    group: "constraints_context",
    groupTitle: "Batasan Eksekusi",
    description: "Berapa jam per minggu yang bisa dialokasikan atau apakah ada batas target rilis MVP?",
    placeholder: "Contoh: 10-15 jam per minggu di akhir pekan; target MVP fungsional dalam 3 minggu",
    example: "Hanya 5 jam per minggu; tidak ada budget iklan",
    required: false,
    valueType: "string",
    defaultCertainty: "confirmed",
    helpText: "Informasi kapasitas waktu membantu AI menentukan scope MVP yang realistis.",
  },
  {
    key: "architecture.technologyPreference",
    label: "Preferensi Framework / Teknologi",
    group: "constraints_context",
    groupTitle: "Batasan Eksekusi",
    description: "Framework atau bahasa pemrograman yang sudah Anda kuasai atau ingin digunakan.",
    placeholder: "Contoh: Next.js + Tailwind (Web), atau Flutter (Mobile)",
    example: "Next.js dengan local storage tanpa database server",
    required: false,
    valueType: "string",
    defaultCertainty: "preference",
    helpText: "AI akan memfokuskan arsitektur PRD sesuai kenyamanan stack Anda.",
  },
];

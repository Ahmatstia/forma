import { P00QuestionDef } from "./p00-questions";

export const P02_QUESTIONS: P00QuestionDef[] = [
  {
    key: "project.specialRequirements",
    label: "Kebutuhan Khusus / Aturan Tambahan",
    group: "constraints_context",
    groupTitle: "Kebutuhan Tambahan",
    description: "Apakah ada aturan bisnis, standar privasi, atau kompatibilitas khusus yang harus dipenuhi?",
    placeholder: "Contoh: Harus mematuhi privasi data lokal tanpa mengirim data keluar perangkat; kompatibel Android 8+",
    example: "Tidak boleh ada iklan pihak ketiga; data ekspor harus format JSON standar",
    required: false,
    valueType: "string",
    defaultCertainty: "confirmed",
    helpText: "Kebutuhan khusus akan masuk ke section Non-Functional Requirements PRD.",
  },
];

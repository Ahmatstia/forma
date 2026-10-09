import { P00QuestionDef } from "./p00-questions";
import { P00_QUESTIONS } from "./p00-questions";
import { P01_QUESTIONS } from "./p01-questions";
import { P02_QUESTIONS } from "./p02-questions";

export interface ChainStageInfo {
  id: string; // e.g. "P-00-IDEA"
  stageNumber: string; // e.g. "0"
  title: string;
  badge: string;
  description: string;
  prerequisiteId?: string;
  prerequisiteName?: string;
  expectedArtifactTitle: string;
  questions: P00QuestionDef[];
}

export const CHAIN_STAGES: ChainStageInfo[] = [
  {
    id: "P-00-IDEA",
    stageNumber: "0",
    title: "P-00: Klarifikasi Ide",
    badge: "Discovery",
    description: "Perjelas ide mentah, petakan masalah, dan pisahkan asumsi dari fakta terkonfirmasi.",
    expectedArtifactTitle: "Temuan Discovery & Validasi Masalah",
    questions: P00_QUESTIONS,
  },
  {
    id: "P-01-PRODUCT-BRIEF",
    stageNumber: "1",
    title: "P-01: Product Brief",
    badge: "Product Scope",
    description: "Ubah temuan discovery P-00 yang disetujui menjadi target scope MVP terarah.",
    prerequisiteId: "P-00-IDEA",
    prerequisiteName: "P-00 Klarifikasi Ide",
    expectedArtifactTitle: "Dokumen PRODUCT_BRIEF.md",
    questions: P01_QUESTIONS,
  },
  {
    id: "P-02-PRD",
    stageNumber: "2",
    title: "P-02: PRD & Requirements",
    badge: "Specification",
    description: "Turunkan Product Brief yang disetujui menjadi PRD spesifik dengan acceptance criteria.",
    prerequisiteId: "P-01-PRODUCT-BRIEF",
    prerequisiteName: "P-01 Product Brief",
    expectedArtifactTitle: "Dokumen PRD.md",
    questions: P02_QUESTIONS,
  },
];

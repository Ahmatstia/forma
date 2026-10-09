import { Platform } from "@/modules/projects";
import { P00QuestionDef } from "./p00-questions";
import { P00_QUESTIONS } from "./p00-questions";
import { P01_QUESTIONS } from "./p01-questions";
import { P02_QUESTIONS } from "./p02-questions";
import { P03_QUESTIONS } from "./p03-questions";
import { P04W_QUESTIONS } from "./p04w-questions";
import { P04M_QUESTIONS } from "./p04m-questions";

export interface ChainStageInfo {
  id: string; // e.g. "P-00-IDEA"
  stageNumber: string; // e.g. "0", "1", "2", "3", "4W", "4M"
  title: string;
  badge: string;
  description: string;
  prerequisiteId?: string;
  prerequisiteName?: string;
  expectedArtifactTitle: string;
  requiredPlatform?: "web" | "mobile" | "any";
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
    requiredPlatform: "any",
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
    requiredPlatform: "any",
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
    requiredPlatform: "any",
    questions: P02_QUESTIONS,
  },
  {
    id: "P-03-TECH-STACK",
    stageNumber: "3",
    title: "P-03: Tech Stack & Architecture",
    badge: "Architecture",
    description: "Susun rekomendasi tech stack, diagram sistem, struktur folder, dan mitigasi risiko teknis dari PRD.",
    prerequisiteId: "P-02-PRD",
    prerequisiteName: "P-02 PRD & Requirements",
    expectedArtifactTitle: "Dokumen TECH_STACK_AND_ARCHITECTURE.md",
    requiredPlatform: "any",
    questions: P03_QUESTIONS,
  },
  {
    id: "P-04W-WEB-PLATFORM",
    stageNumber: "4W",
    title: "P-04W: Web Architecture",
    badge: "Web Platform",
    description: "Rancang arsitektur web: routing, state management, auth, API, testing, dan deployment pipeline.",
    prerequisiteId: "P-03-TECH-STACK",
    prerequisiteName: "P-03 Tech Stack & Architecture",
    expectedArtifactTitle: "Dokumen WEB_PLATFORM_SPEC.md",
    requiredPlatform: "web",
    questions: P04W_QUESTIONS,
  },
  {
    id: "P-04M-MOBILE-PLATFORM",
    stageNumber: "4M",
    title: "P-04M: Mobile Architecture",
    badge: "Mobile Platform",
    description: "Rancang arsitektur mobile: framework, navigasi, offline sync, permissions, dan rilis app store.",
    prerequisiteId: "P-03-TECH-STACK",
    prerequisiteName: "P-03 Tech Stack & Architecture",
    expectedArtifactTitle: "Dokumen MOBILE_PLATFORM_SPEC.md",
    requiredPlatform: "mobile",
    questions: P04M_QUESTIONS,
  },
];

/**
 * Checks whether a stage is relevant for a project given its target platforms.
 */
export function isStageRelevantForPlatforms(
  stage: ChainStageInfo,
  platforms: Platform[] = []
): boolean {
  if (!stage.requiredPlatform || stage.requiredPlatform === "any") {
    return true;
  }
  if (stage.requiredPlatform === "web") {
    return platforms.includes("web") || platforms.includes("multi_platform");
  }
  if (stage.requiredPlatform === "mobile") {
    return (
      platforms.includes("android") ||
      platforms.includes("ios") ||
      platforms.includes("cross_platform_mobile") ||
      platforms.includes("multi_platform")
    );
  }
  return true;
}

/**
 * Returns filtered chain stages for a project based on its target platforms.
 */
export function getStagesForProject(platforms: Platform[] = []): ChainStageInfo[] {
  return CHAIN_STAGES.filter((stage) => isStageRelevantForPlatforms(stage, platforms));
}

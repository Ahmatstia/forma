import { Platform, ArtifactStatus } from "@/modules/projects";

export interface PromptPackStageSummary {
  stageId: string;
  stageNumber: string;
  title: string;
  status: ArtifactStatus | "missing";
  isPrerequisiteMet: boolean;
  promptFileName?: string;
  artifactFileName?: string;
}

export interface PromptPackManifest {
  formatVersion: "1.0";
  formaVersion: string;
  exportedAt: string;
  project: {
    id: string;
    name: string;
    platforms: Platform[];
    complexityTrack: string;
  };
  stages: PromptPackStageSummary[];
  files: string[];
}

export interface PromptPackResult {
  zipData: Uint8Array;
  filename: string;
  manifest: PromptPackManifest;
  containsSecrets: boolean;
  secretFindings?: string[];
}

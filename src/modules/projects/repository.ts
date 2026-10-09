import {
  Project,
  ProjectAnswer,
  ProjectSchema,
  ProjectAnswerSchema,
  AgentArtifact,
  AgentArtifactSchema,
} from "./types";
import { PromptGenerationRun, PromptGenerationRunSchema } from "@/modules/runs";
import { z } from "zod";

export const ExportPayloadSchema = z.object({
  version: z.union([z.literal("1.0"), z.literal("2.0")]),
  exportedAt: z.string(),
  source: z.string(),
  projects: z.array(ProjectSchema),
  answers: z.array(ProjectAnswerSchema),
  runs: z.array(PromptGenerationRunSchema),
  artifacts: z.array(AgentArtifactSchema).optional().default([]),
});

export type ExportPayload = z.infer<typeof ExportPayloadSchema>;

export interface ImportResult {
  success: boolean;
  importedProjectsCount: number;
  errors: string[];
}

export interface ProjectRepository {
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | null>;
  saveProject(project: Project): Promise<void>;
  deleteProject(id: string): Promise<void>;

  getAnswers(projectId: string): Promise<ProjectAnswer[]>;
  saveAnswers(projectId: string, answers: ProjectAnswer[]): Promise<void>;

  getRuns(projectId: string): Promise<PromptGenerationRun[]>;
  saveRun(run: PromptGenerationRun): Promise<void>;

  getArtifacts(projectId: string): Promise<AgentArtifact[]>;
  getArtifact(projectId: string, stage: string): Promise<AgentArtifact | null>;
  saveArtifact(artifact: AgentArtifact): Promise<void>;

  exportAll(): Promise<ExportPayload>;
  importAll(rawJsonOrObj: unknown): Promise<ImportResult>;
}

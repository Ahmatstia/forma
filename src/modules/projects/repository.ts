import { Project, ProjectAnswer } from "./types";
import { PromptGenerationRun } from "@/modules/runs";
import { z } from "zod";
import { ProjectSchema, ProjectAnswerSchema } from "./types";
import { PromptGenerationRunSchema } from "@/modules/runs";

export const ExportPayloadSchema = z.object({
  version: z.literal("1.0"),
  exportedAt: z.string(),
  source: z.literal("forma-browser-storage"),
  projects: z.array(ProjectSchema),
  answers: z.array(ProjectAnswerSchema),
  runs: z.array(PromptGenerationRunSchema),
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

  exportAll(): Promise<ExportPayload>;
  importAll(rawJsonOrObj: unknown): Promise<ImportResult>;
}

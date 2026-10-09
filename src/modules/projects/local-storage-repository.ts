import {
  Project,
  ProjectAnswer,
  ProjectSchema,
  ProjectAnswerSchema,
} from "./types";
import { PromptGenerationRun, PromptGenerationRunSchema } from "@/modules/runs";
import {
  ExportPayload,
  ExportPayloadSchema,
  ImportResult,
  ProjectRepository,
} from "./repository";

const STORAGE_KEYS = {
  PROJECTS: "forma:projects:v1",
  ANSWERS: "forma:answers:v1",
  RUNS: "forma:runs:v1",
};

export class LocalStorageProjectRepository implements ProjectRepository {
  // In-memory fallback for SSR and test environments without window.localStorage
  private memoryProjects: Map<string, Project> = new Map();
  private memoryAnswers: Map<string, ProjectAnswer[]> = new Map();
  private memoryRuns: Map<string, PromptGenerationRun[]> = new Map();

  private isStorageAvailable(): boolean {
    if (typeof window === "undefined" || !window.localStorage) {
      return false;
    }
    try {
      const testKey = "__forma_test__";
      window.localStorage.setItem(testKey, "1");
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  private readStorage<T>(key: string): T[] {
    if (!this.isStorageAvailable()) {
      if (key === STORAGE_KEYS.PROJECTS) {
        return Array.from(this.memoryProjects.values()) as unknown as T[];
      }
      if (key === STORAGE_KEYS.ANSWERS) {
        const all: ProjectAnswer[] = [];
        for (const list of this.memoryAnswers.values()) {
          all.push(...list);
        }
        return all as unknown as T[];
      }
      if (key === STORAGE_KEYS.RUNS) {
        const all: PromptGenerationRun[] = [];
        for (const list of this.memoryRuns.values()) {
          all.push(...list);
        }
        return all as unknown as T[];
      }
      return [];
    }

    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn(`[Forma Repository] Failed to parse key ${key}:`, err);
      return [];
    }
  }

  private writeStorage<T>(key: string, items: T[]): void {
    if (!this.isStorageAvailable()) {
      if (key === STORAGE_KEYS.PROJECTS) {
        this.memoryProjects.clear();
        for (const p of items as unknown as Project[]) {
          this.memoryProjects.set(p.id, p);
        }
      }
      if (key === STORAGE_KEYS.ANSWERS) {
        this.memoryAnswers.clear();
        for (const a of items as unknown as ProjectAnswer[]) {
          const existing = this.memoryAnswers.get(a.projectId) || [];
          existing.push(a);
          this.memoryAnswers.set(a.projectId, existing);
        }
      }
      if (key === STORAGE_KEYS.RUNS) {
        this.memoryRuns.clear();
        for (const r of items as unknown as PromptGenerationRun[]) {
          const existing = this.memoryRuns.get(r.projectId) || [];
          existing.push(r);
          this.memoryRuns.set(r.projectId, existing);
        }
      }
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(items));
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        (err.name === "QuotaExceededError" ||
          err.name === "NS_ERROR_DOM_QUOTA_REACHED")
      ) {
        throw new Error(
          "Penyimpanan browser penuh. Silakan ekspor data proyek Anda lalu hapus proyek yang tidak lagi dibutuhkan."
        );
      }
      throw err;
    }
  }

  async getProjects(): Promise<Project[]> {
    const rawList = this.readStorage<unknown>(STORAGE_KEYS.PROJECTS);
    const valid: Project[] = [];
    for (const item of rawList) {
      const parsed = ProjectSchema.safeParse(item);
      if (parsed.success) {
        valid.push(parsed.data);
      }
    }
    // Sort newest first
    return valid.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async getProject(id: string): Promise<Project | null> {
    const list = await this.getProjects();
    return list.find((p) => p.id === id) || null;
  }

  async saveProject(project: Project): Promise<void> {
    const validated = ProjectSchema.parse(project);
    const existing = await this.getProjects();
    const index = existing.findIndex((p) => p.id === validated.id);
    if (index >= 0) {
      existing[index] = validated;
    } else {
      existing.unshift(validated);
    }
    this.writeStorage(STORAGE_KEYS.PROJECTS, existing);
  }

  async deleteProject(id: string): Promise<void> {
    const existingProjects = await this.getProjects();
    const filteredProjects = existingProjects.filter((p) => p.id !== id);
    this.writeStorage(STORAGE_KEYS.PROJECTS, filteredProjects);

    // Clean up answers for this project
    const allAnswers = this.readStorage<unknown>(STORAGE_KEYS.ANSWERS);
    const filteredAnswers = allAnswers.filter((a) => {
      const parsed = ProjectAnswerSchema.safeParse(a);
      return parsed.success && parsed.data.projectId !== id;
    });
    this.writeStorage(STORAGE_KEYS.ANSWERS, filteredAnswers);

    // Clean up runs for this project
    const allRuns = this.readStorage<unknown>(STORAGE_KEYS.RUNS);
    const filteredRuns = allRuns.filter((r) => {
      const parsed = PromptGenerationRunSchema.safeParse(r);
      return parsed.success && parsed.data.projectId !== id;
    });
    this.writeStorage(STORAGE_KEYS.RUNS, filteredRuns);
  }

  async getAnswers(projectId: string): Promise<ProjectAnswer[]> {
    const rawList = this.readStorage<unknown>(STORAGE_KEYS.ANSWERS);
    const answers: ProjectAnswer[] = [];
    for (const item of rawList) {
      const parsed = ProjectAnswerSchema.safeParse(item);
      if (parsed.success && parsed.data.projectId === projectId) {
        answers.push(parsed.data);
      }
    }
    return answers;
  }

  async saveAnswers(projectId: string, answers: ProjectAnswer[]): Promise<void> {
    for (const a of answers) {
      ProjectAnswerSchema.parse(a);
    }
    const rawList = this.readStorage<unknown>(STORAGE_KEYS.ANSWERS);
    const otherAnswers = rawList.filter((item) => {
      const parsed = ProjectAnswerSchema.safeParse(item);
      return parsed.success && parsed.data.projectId !== projectId;
    });
    this.writeStorage(STORAGE_KEYS.ANSWERS, [...otherAnswers, ...answers]);
  }

  async getRuns(projectId: string): Promise<PromptGenerationRun[]> {
    const rawList = this.readStorage<unknown>(STORAGE_KEYS.RUNS);
    const runs: PromptGenerationRun[] = [];
    for (const item of rawList) {
      const parsed = PromptGenerationRunSchema.safeParse(item);
      if (parsed.success && parsed.data.projectId === projectId) {
        runs.push(parsed.data);
      }
    }
    return runs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async saveRun(run: PromptGenerationRun): Promise<void> {
    const validated = PromptGenerationRunSchema.parse(run);
    const rawList = this.readStorage<unknown>(STORAGE_KEYS.RUNS);
    const existing = rawList.filter((item) => {
      const parsed = PromptGenerationRunSchema.safeParse(item);
      return parsed.success && parsed.data.id !== validated.id;
    });
    this.writeStorage(STORAGE_KEYS.RUNS, [validated, ...existing]);
  }

  async exportAll(): Promise<ExportPayload> {
    const projects = await this.getProjects();
    const rawAnswers = this.readStorage<unknown>(STORAGE_KEYS.ANSWERS);
    const answers: ProjectAnswer[] = [];
    for (const a of rawAnswers) {
      const parsed = ProjectAnswerSchema.safeParse(a);
      if (parsed.success) answers.push(parsed.data);
    }

    const rawRuns = this.readStorage<unknown>(STORAGE_KEYS.RUNS);
    const runs: PromptGenerationRun[] = [];
    for (const r of rawRuns) {
      const parsed = PromptGenerationRunSchema.safeParse(r);
      if (parsed.success) runs.push(parsed.data);
    }

    return {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      source: "forma-browser-storage",
      projects,
      answers,
      runs,
    };
  }

  async importAll(rawJsonOrObj: unknown): Promise<ImportResult> {
    let obj = rawJsonOrObj;
    if (typeof rawJsonOrObj === "string") {
      try {
        obj = JSON.parse(rawJsonOrObj);
      } catch {
        return {
          success: false,
          importedProjectsCount: 0,
          errors: ["Format file JSON tidak valid."],
        };
      }
    }

    const parseResult = ExportPayloadSchema.safeParse(obj);
    if (!parseResult.success) {
      const formattedErrors = parseResult.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`
      );
      return {
        success: false,
        importedProjectsCount: 0,
        errors: formattedErrors,
      };
    }

    const data = parseResult.data;

    // Merge projects: update existing by ID, add new
    const existingProjects = await this.getProjects();
    const projectMap = new Map<string, Project>();
    for (const p of existingProjects) projectMap.set(p.id, p);
    for (const p of data.projects) projectMap.set(p.id, p);
    this.writeStorage(
      STORAGE_KEYS.PROJECTS,
      Array.from(projectMap.values())
    );

    // Merge answers
    const existingAnswers = this.readStorage<unknown>(STORAGE_KEYS.ANSWERS);
    const answerMap = new Map<string, ProjectAnswer>();
    for (const a of existingAnswers) {
      const parsed = ProjectAnswerSchema.safeParse(a);
      if (parsed.success) answerMap.set(parsed.data.id, parsed.data);
    }
    for (const a of data.answers) answerMap.set(a.id, a);
    this.writeStorage(
      STORAGE_KEYS.ANSWERS,
      Array.from(answerMap.values())
    );

    // Merge runs
    const existingRuns = this.readStorage<unknown>(STORAGE_KEYS.RUNS);
    const runMap = new Map<string, PromptGenerationRun>();
    for (const r of existingRuns) {
      const parsed = PromptGenerationRunSchema.safeParse(r);
      if (parsed.success) runMap.set(parsed.data.id, parsed.data);
    }
    for (const r of data.runs) runMap.set(r.id, r);
    this.writeStorage(
      STORAGE_KEYS.RUNS,
      Array.from(runMap.values())
    );

    return {
      success: true,
      importedProjectsCount: data.projects.length,
      errors: [],
    };
  }
}

let singletonRepo: LocalStorageProjectRepository | null = null;

export function getProjectRepository(): ProjectRepository {
  if (!singletonRepo) {
    singletonRepo = new LocalStorageProjectRepository();
  }
  return singletonRepo;
}

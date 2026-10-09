import { describe, expect, it, beforeEach } from "vitest";
import { LocalStorageProjectRepository } from "./local-storage-repository";
import { Project, ProjectAnswer } from "./types";
import { PromptGenerationRun } from "@/modules/runs";

const MOCK_PROJECT: Project = {
  id: "proj_test_01",
  name: "Proyek Uji",
  ideaSummary: "Deskripsi ide proyek uji",
  platforms: ["web"],
  complexityTrack: "standard",
  constraintsSummary: "Solo developer",
  createdAt: "2026-10-09T00:00:00Z",
  updatedAt: "2026-10-09T00:00:00Z",
};

const MOCK_ANSWER: ProjectAnswer = {
  id: "ans_test_01",
  projectId: "proj_test_01",
  key: "product.problem",
  value: "Masalah nyata pengujian",
  valueType: "string",
  certainty: "confirmed",
  source: "user",
  updatedAt: "2026-10-09T00:00:00Z",
};

const MOCK_RUN: PromptGenerationRun = {
  id: "run_test_01",
  projectId: "proj_test_01",
  templateId: "P-00-IDEA",
  templateVersion: 1,
  contextSnapshotId: "snap_test_01",
  compiledPrompt: "# Prompt Uji",
  status: "ready",
  validationStatus: "ready",
  validationMessages: [],
  createdAt: "2026-10-09T00:00:00Z",
};

describe("LocalStorageProjectRepository", () => {
  let repo: LocalStorageProjectRepository;

  beforeEach(() => {
    repo = new LocalStorageProjectRepository();
  });

  it("saves and retrieves projects", async () => {
    await repo.saveProject(MOCK_PROJECT);

    const list = await repo.getProjects();
    expect(list.length).toBe(1);
    expect(list[0].id).toBe("proj_test_01");
    expect(list[0].name).toBe("Proyek Uji");

    const single = await repo.getProject("proj_test_01");
    expect(single).not.toBeNull();
    expect(single?.name).toBe("Proyek Uji");
  });

  it("updates existing project if saved with same ID", async () => {
    await repo.saveProject(MOCK_PROJECT);

    const updated = {
      ...MOCK_PROJECT,
      name: "Proyek Uji Diperbarui",
      updatedAt: "2026-10-09T01:00:00Z",
    };
    await repo.saveProject(updated);

    const list = await repo.getProjects();
    expect(list.length).toBe(1);
    expect(list[0].name).toBe("Proyek Uji Diperbarui");
  });

  it("deletes project and its associated answers and runs", async () => {
    await repo.saveProject(MOCK_PROJECT);
    await repo.saveAnswers("proj_test_01", [MOCK_ANSWER]);
    await repo.saveRun(MOCK_RUN);

    expect((await repo.getProjects()).length).toBe(1);
    expect((await repo.getAnswers("proj_test_01")).length).toBe(1);
    expect((await repo.getRuns("proj_test_01")).length).toBe(1);

    await repo.deleteProject("proj_test_01");

    expect((await repo.getProjects()).length).toBe(0);
    expect((await repo.getAnswers("proj_test_01")).length).toBe(0);
    expect((await repo.getRuns("proj_test_01")).length).toBe(0);
  });

  it("exports all data matching the versioned ExportPayloadSchema", async () => {
    await repo.saveProject(MOCK_PROJECT);
    await repo.saveAnswers("proj_test_01", [MOCK_ANSWER]);
    await repo.saveRun(MOCK_RUN);

    const exported = await repo.exportAll();
    expect(exported.version).toBe("1.0");
    expect(exported.source).toBe("forma-browser-storage");
    expect(exported.projects.length).toBe(1);
    expect(exported.answers.length).toBe(1);
    expect(exported.runs.length).toBe(1);
  });

  it("imports valid JSON payload correctly", async () => {
    const payload = {
      version: "1.0",
      exportedAt: "2026-10-09T00:00:00Z",
      source: "forma-browser-storage",
      projects: [MOCK_PROJECT],
      answers: [MOCK_ANSWER],
      runs: [MOCK_RUN],
    };

    const result = await repo.importAll(JSON.stringify(payload));
    expect(result.success).toBe(true);
    expect(result.importedProjectsCount).toBe(1);
    expect(result.errors.length).toBe(0);

    const projects = await repo.getProjects();
    expect(projects.length).toBe(1);
    expect(projects[0].id).toBe(MOCK_PROJECT.id);
  });

  it("rejects invalid JSON payload with descriptive error messages", async () => {
    const invalidPayload = {
      version: "2.0", // Unsupported version
      projects: [{ id: "invalid" }], // Missing required fields
    };

    const result = await repo.importAll(invalidPayload);
    expect(result.success).toBe(false);
    expect(result.importedProjectsCount).toBe(0);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

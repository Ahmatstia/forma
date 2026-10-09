import { describe, expect, it, beforeEach } from "vitest";
import { LocalStorageProjectRepository } from "./local-storage-repository";
import { Project, ProjectAnswer, AgentArtifact } from "@/modules/projects";
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

const MOCK_ARTIFACT: AgentArtifact = {
  id: "art_test_01",
  projectId: "proj_test_01",
  stage: "P-00-IDEA",
  content: "# Discovery Output\nIde tervalidasi.",
  status: "approved",
  createdAt: "2026-10-09T00:00:00Z",
  updatedAt: "2026-10-09T00:00:00Z",
  source: "user_paste",
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

  it("deletes project and its associated answers, runs, and artifacts", async () => {
    await repo.saveProject(MOCK_PROJECT);
    await repo.saveAnswers("proj_test_01", [MOCK_ANSWER]);
    await repo.saveRun(MOCK_RUN);
    await repo.saveArtifact(MOCK_ARTIFACT);

    expect((await repo.getProjects()).length).toBe(1);
    expect((await repo.getAnswers("proj_test_01")).length).toBe(1);
    expect((await repo.getRuns("proj_test_01")).length).toBe(1);
    expect((await repo.getArtifacts("proj_test_01")).length).toBe(1);

    await repo.deleteProject("proj_test_01");

    expect((await repo.getProjects()).length).toBe(0);
    expect((await repo.getAnswers("proj_test_01")).length).toBe(0);
    expect((await repo.getRuns("proj_test_01")).length).toBe(0);
    expect((await repo.getArtifacts("proj_test_01")).length).toBe(0);
  });

  it("saves and retrieves artifacts by stage", async () => {
    await repo.saveProject(MOCK_PROJECT);
    await repo.saveArtifact(MOCK_ARTIFACT);

    const artifact = await repo.getArtifact("proj_test_01", "P-00-IDEA");
    expect(artifact).not.toBeNull();
    expect(artifact?.status).toBe("approved");
    expect(artifact?.content).toContain("Discovery Output");
  });

  it("exports all data matching the versioned ExportPayloadSchema", async () => {
    await repo.saveProject(MOCK_PROJECT);
    await repo.saveAnswers("proj_test_01", [MOCK_ANSWER]);
    await repo.saveRun(MOCK_RUN);
    await repo.saveArtifact(MOCK_ARTIFACT);

    const exported = await repo.exportAll();
    expect(exported.version).toBe("2.0");
    expect(exported.source).toBe("forma-browser-storage");
    expect(exported.projects.length).toBe(1);
    expect(exported.answers.length).toBe(1);
    expect(exported.runs.length).toBe(1);
    expect(exported.artifacts.length).toBe(1);
  });

  it("imports valid v2.0 JSON payload correctly", async () => {
    const payload = {
      version: "2.0",
      exportedAt: "2026-10-09T00:00:00Z",
      source: "forma-browser-storage",
      projects: [MOCK_PROJECT],
      answers: [MOCK_ANSWER],
      runs: [MOCK_RUN],
      artifacts: [MOCK_ARTIFACT],
    };

    const result = await repo.importAll(JSON.stringify(payload));
    expect(result.success).toBe(true);
    expect(result.importedProjectsCount).toBe(1);
    expect(result.errors.length).toBe(0);

    const projects = await repo.getProjects();
    expect(projects.length).toBe(1);
    expect(projects[0].id).toBe(MOCK_PROJECT.id);

    const artifacts = await repo.getArtifacts("proj_test_01");
    expect(artifacts.length).toBe(1);
    expect(artifacts[0].status).toBe("approved");
  });

  it("imports backward-compatible v1.0 JSON payload without artifacts", async () => {
    const v1Payload = {
      version: "1.0",
      exportedAt: "2026-10-09T00:00:00Z",
      source: "forma-browser-storage",
      projects: [MOCK_PROJECT],
      answers: [MOCK_ANSWER],
      runs: [MOCK_RUN],
    };

    const result = await repo.importAll(JSON.stringify(v1Payload));
    expect(result.success).toBe(true);
    expect(result.importedProjectsCount).toBe(1);
    expect(result.errors.length).toBe(0);

    const artifacts = await repo.getArtifacts("proj_test_01");
    expect(artifacts.length).toBe(0);
  });

  it("rejects invalid JSON payload with descriptive error messages", async () => {
    const invalidPayload = {
      version: "3.0", // Unsupported version
      projects: [{ id: "invalid" }], // Missing required fields
    };

    const result = await repo.importAll(invalidPayload);
    expect(result.success).toBe(false);
    expect(result.importedProjectsCount).toBe(0);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

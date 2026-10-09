import { describe, it, expect } from "vitest";
import { unzipSync, strFromU8 } from "fflate";
import { Project, ProjectAnswer, AgentArtifact } from "@/modules/projects";
import {
  defaultTemplateRegistry,
  checkTemplatePrerequisites,
  getStagesForProject,
  isStageRelevantForPlatforms,
  CHAIN_STAGES,
} from "@/modules/templates";
import { compilePrompt } from "@/modules/prompt-compiler";
import { generatePromptPack } from "@/modules/exports";
import { checkRunStaleness } from "@/modules/runs";

function createTestProject(overrides?: Partial<Project>): Project {
  return {
    id: "proj_test_r4",
    name: "Forma Mobile & Web Suite",
    ideaSummary: "Multiplatform developer planner",
    platforms: ["web", "cross_platform_mobile"],
    complexityTrack: "standard",
    createdAt: "2026-10-10T00:00:00Z",
    updatedAt: "2026-10-10T00:00:00Z",
    ...overrides,
  };
}

describe("R4 Integration — P-03, P-04W, P-04M Templates & Prerequisites", () => {
  it("P-03 requires approved P-02-PRD prerequisite", () => {
    const unapproved = checkTemplatePrerequisites(
      "P-03-TECH-STACK",
      ["P-00-IDEA", "P-01-PRODUCT-BRIEF"],
      defaultTemplateRegistry
    );
    expect(unapproved.satisfied).toBe(false);
    expect(unapproved.missingPrerequisites[0].templateId).toBe("P-02-PRD");

    const approved = checkTemplatePrerequisites(
      "P-03-TECH-STACK",
      ["P-00-IDEA", "P-01-PRODUCT-BRIEF", "P-02-PRD"],
      defaultTemplateRegistry
    );
    expect(approved.satisfied).toBe(true);
    expect(approved.missingPrerequisites).toHaveLength(0);
  });

  it("P-04W and P-04M require approved P-03-TECH-STACK prerequisite", () => {
    const p04wCheck = checkTemplatePrerequisites(
      "P-04W-WEB-PLATFORM",
      ["P-02-PRD"],
      defaultTemplateRegistry
    );
    expect(p04wCheck.satisfied).toBe(false);
    expect(p04wCheck.missingPrerequisites[0].templateId).toBe("P-03-TECH-STACK");

    const p04mCheck = checkTemplatePrerequisites(
      "P-04M-MOBILE-PLATFORM",
      ["P-02-PRD"],
      defaultTemplateRegistry
    );
    expect(p04mCheck.satisfied).toBe(false);
    expect(p04mCheck.missingPrerequisites[0].templateId).toBe("P-03-TECH-STACK");

    const p04wMet = checkTemplatePrerequisites(
      "P-04W-WEB-PLATFORM",
      ["P-03-TECH-STACK"],
      defaultTemplateRegistry
    );
    expect(p04wMet.satisfied).toBe(true);

    const p04mMet = checkTemplatePrerequisites(
      "P-04M-MOBILE-PLATFORM",
      ["P-03-TECH-STACK"],
      defaultTemplateRegistry
    );
    expect(p04mMet.satisfied).toBe(true);
  });

  it("P-03 compiles successfully with approved P-02 artifact into upstream context", () => {
    const project = createTestProject();
    const answers: ProjectAnswer[] = [
      {
        id: "ans_1",
        projectId: project.id,
        key: "architecture.preferredStack",
        value: "Next.js 15, TypeScript, TailwindCSS, PostgreSQL",
        valueType: "string",
        certainty: "confirmed",
        source: "user",
        updatedAt: "2026-10-10T00:00:00Z",
      },
    ];

    const p02Artifact: AgentArtifact = {
      id: "art_prd_01",
      projectId: project.id,
      stage: "P-02-PRD",
      content: "# PRD Formal\n## Fitur Inti: Prompt Generation & Chain Execution",
      status: "approved",
      reviewedAt: "2026-10-10T00:00:00Z",
      approvedAt: "2026-10-10T00:00:00Z",
      source: "user_paste",
      createdAt: "2026-10-10T00:00:00Z",
      updatedAt: "2026-10-10T00:00:00Z",
    };

    const result = compilePrompt(project, answers, {
      templateId: "P-03-TECH-STACK",
      artifacts: [p02Artifact],
    });

    expect(result.validationStatus).not.toBe("blocked");
    expect(result.compiledPrompt).toContain("Dokumen PRD yang Disetujui");
    expect(result.compiledPrompt).toContain("Next.js 15, TypeScript");
    expect(result.compiledPrompt).toContain("Fitur Inti: Prompt Generation");
    expect(result.compiledPrompt).toContain("Kontrak Output");
  });

  it("P-04W compiles web-specific requirements", () => {
    const project = createTestProject({ platforms: ["web"] });
    const answers: ProjectAnswer[] = [
      {
        id: "ans_w1",
        projectId: project.id,
        key: "web.renderingModel",
        value: "Hybrid SSR / Server Components dengan Client Interactive Island",
        valueType: "string",
        certainty: "confirmed",
        source: "user",
        updatedAt: "2026-10-10T00:00:00Z",
      },
    ];

    const p03Artifact: AgentArtifact = {
      id: "art_arch_01",
      projectId: project.id,
      stage: "P-03-TECH-STACK",
      content: "# System Architecture\nStack: Next.js + Tailwind",
      status: "approved",
      reviewedAt: "2026-10-10T00:00:00Z",
      approvedAt: "2026-10-10T00:00:00Z",
      source: "user_paste",
      createdAt: "2026-10-10T00:00:00Z",
      updatedAt: "2026-10-10T00:00:00Z",
    };

    const result = compilePrompt(project, answers, {
      templateId: "P-04W-WEB-PLATFORM",
      artifacts: [p03Artifact],
    });

    expect(result.validationStatus).not.toBe("blocked");
    expect(result.compiledPrompt).toContain("P-04W");
    expect(result.compiledPrompt).toContain("Hybrid SSR / Server Components");
    expect(result.compiledPrompt).toContain("STATE_MANAGEMENT_AND_DATA_FETCHING");
  });

  it("P-04M compiles mobile-specific requirements", () => {
    const project = createTestProject({ platforms: ["cross_platform_mobile"] });
    const answers: ProjectAnswer[] = [
      {
        id: "ans_m1",
        projectId: project.id,
        key: "mobile.frameworkChoice",
        value: "React Native / Expo dengan TypeScript",
        valueType: "string",
        certainty: "confirmed",
        source: "user",
        updatedAt: "2026-10-10T00:00:00Z",
      },
    ];

    const p03Artifact: AgentArtifact = {
      id: "art_arch_01",
      projectId: project.id,
      stage: "P-03-TECH-STACK",
      content: "# System Architecture\nMobile core with API backend",
      status: "approved",
      reviewedAt: "2026-10-10T00:00:00Z",
      approvedAt: "2026-10-10T00:00:00Z",
      source: "user_paste",
      createdAt: "2026-10-10T00:00:00Z",
      updatedAt: "2026-10-10T00:00:00Z",
    };

    const result = compilePrompt(project, answers, {
      templateId: "P-04M-MOBILE-PLATFORM",
      artifacts: [p03Artifact],
    });

    expect(result.validationStatus).not.toBe("blocked");
    expect(result.compiledPrompt).toContain("P-04M");
    expect(result.compiledPrompt).toContain("React Native / Expo");
    expect(result.compiledPrompt).toContain("OFFLINE_FIRST_LOCAL_PERSISTENCE_AND_SYNC");
  });
});

describe("R4 Integration — Platform-aware Stages Filter", () => {
  it("filters stages accurately for web-only project", () => {
    const stages = getStagesForProject(["web"]);
    const stageIds = stages.map((s) => s.id);

    expect(stageIds).toContain("P-00-IDEA");
    expect(stageIds).toContain("P-01-PRODUCT-BRIEF");
    expect(stageIds).toContain("P-02-PRD");
    expect(stageIds).toContain("P-03-TECH-STACK");
    expect(stageIds).toContain("P-04W-WEB-PLATFORM");
    expect(stageIds).not.toContain("P-04M-MOBILE-PLATFORM");
  });

  it("filters stages accurately for mobile-only project", () => {
    const stages = getStagesForProject(["android"]);
    const stageIds = stages.map((s) => s.id);

    expect(stageIds).toContain("P-03-TECH-STACK");
    expect(stageIds).toContain("P-04M-MOBILE-PLATFORM");
    expect(stageIds).not.toContain("P-04W-WEB-PLATFORM");
  });

  it("includes both P-04W and P-04M for multiplatform projects", () => {
    const stages = getStagesForProject(["web", "ios"]);
    const stageIds = stages.map((s) => s.id);

    expect(stageIds).toContain("P-04W-WEB-PLATFORM");
    expect(stageIds).toContain("P-04M-MOBILE-PLATFORM");
  });

  it("isStageRelevantForPlatforms correctly evaluates platform requirements", () => {
    const p04wStage = CHAIN_STAGES.find((s) => s.id === "P-04W-WEB-PLATFORM")!;
    const p04mStage = CHAIN_STAGES.find((s) => s.id === "P-04M-MOBILE-PLATFORM")!;

    expect(isStageRelevantForPlatforms(p04wStage, ["web"])).toBe(true);
    expect(isStageRelevantForPlatforms(p04wStage, ["ios"])).toBe(false);

    expect(isStageRelevantForPlatforms(p04mStage, ["ios"])).toBe(true);
    expect(isStageRelevantForPlatforms(p04mStage, ["web"])).toBe(false);
  });
});

describe("R4 Integration — Prompt Pack ZIP Export", () => {
  it("generates a valid ZIP containing README, INDEX, manifest, prompts, and approved artifacts", () => {
    const project = createTestProject({ platforms: ["web"] });
    const answers: ProjectAnswer[] = [
      {
        id: "ans_p00",
        projectId: project.id,
        key: "audience.primaryUser",
        value: "Solo Software Engineers",
        valueType: "string",
        certainty: "confirmed",
        source: "user",
        updatedAt: "2026-10-10T00:00:00Z",
      },
    ];

    const approvedP00: AgentArtifact = {
      id: "art_00",
      projectId: project.id,
      stage: "P-00-IDEA",
      content: "# Discovery Result\nValidated problem.",
      status: "approved",
      reviewedAt: "2026-10-10T00:00:00Z",
      approvedAt: "2026-10-10T00:00:00Z",
      source: "user_paste",
      createdAt: "2026-10-10T00:00:00Z",
      updatedAt: "2026-10-10T00:00:00Z",
    };

    const draftP01: AgentArtifact = {
      id: "art_01",
      projectId: project.id,
      stage: "P-01-PRODUCT-BRIEF",
      content: "# Draft Brief\nUnreviewed draft.",
      status: "captured", // NOT approved
      reviewedAt: "2026-10-10T00:00:00Z",
      source: "user_paste",
      createdAt: "2026-10-10T00:00:00Z",
      updatedAt: "2026-10-10T00:00:00Z",
    };

    const pack = generatePromptPack(project, answers, [approvedP00, draftP01]);

    expect(pack.containsSecrets).toBe(false);
    expect(pack.filename).toMatch(/forma-.*-prompt-pack\.zip/);
    expect(pack.zipData).toBeInstanceOf(Uint8Array);

    // Unzip and inspect files
    const unzipped = unzipSync(pack.zipData);
    const filenames = Object.keys(unzipped);

    expect(filenames).toContain("README.md");
    expect(filenames).toContain("PROMPT_CHAIN_INDEX.md");
    expect(filenames).toContain("manifest.json");
    expect(filenames).toContain("context/PROJECT_CONTEXT.md");

    // Must contain prompts for relevant stages
    expect(filenames).toContain("prompts/0_P-00-IDEA.md");
    expect(filenames).toContain("prompts/1_P-01-PRODUCT-BRIEF.md");
    expect(filenames).toContain("prompts/2_P-02-PRD.md");
    expect(filenames).toContain("prompts/3_P-03-TECH-STACK.md");
    expect(filenames).toContain("prompts/4W_P-04W-WEB-PLATFORM.md");

    // Must NOT contain P-04M prompt for web-only project
    expect(filenames).not.toContain("prompts/4M_P-04M-MOBILE-PLATFORM.md");

    // Approved artifact MUST be included
    expect(filenames).toContain("artifacts/0_P-00-IDEA_APPROVED.md");
    const p00Content = strFromU8(unzipped["artifacts/0_P-00-IDEA_APPROVED.md"]);
    expect(p00Content).toContain("Validated problem.");

    // Unapproved draft artifact MUST NOT be included in artifacts/
    expect(filenames).not.toContain("artifacts/1_P-01-PRODUCT-BRIEF.md");

    // Inspect manifest.json
    const manifestJson = JSON.parse(strFromU8(unzipped["manifest.json"]));
    expect(manifestJson.formatVersion).toBe("1.0");
    expect(manifestJson.project.name).toBe(project.name);
    expect(manifestJson.stages).toBeInstanceOf(Array);

    // Inspect README.md
    const readmeContent = strFromU8(unzipped["README.md"]);
    expect(readmeContent).toContain(project.name);
    expect(readmeContent).toContain("Petunjuk Penggunaan Rantai Prompt");

    // Inspect PROMPT_CHAIN_INDEX.md
    const indexContent = strFromU8(unzipped["PROMPT_CHAIN_INDEX.md"]);
    expect(indexContent).toContain("Status Rantai");
    expect(indexContent).toContain("P-00: Klarifikasi Ide");
  });

  it("detects secrets and flags containsSecrets=true to block export", () => {
    const project = createTestProject();
    const answers: ProjectAnswer[] = [
      {
        id: "ans_leak",
        projectId: project.id,
        key: "tech.leakedKey",
        value: "sk-proj-supersecretkey1234567890abcdefghijklmn",
        valueType: "string",
        certainty: "confirmed",
        source: "user",
        updatedAt: "2026-10-10T00:00:00Z",
      },
    ];

    const pack = generatePromptPack(project, answers, []);
    expect(pack.containsSecrets).toBe(true);
    expect(pack.secretFindings && pack.secretFindings.length).toBeGreaterThan(0);
  });

  it("staleness detection flags stale status when context changes after run snapshot", () => {
    const project = createTestProject();
    const initialAnswers: ProjectAnswer[] = [
      {
        id: "ans_1",
        projectId: project.id,
        key: "audience.primaryUser",
        value: "Developers",
        valueType: "string",
        certainty: "confirmed",
        source: "user",
        updatedAt: "2026-10-10T00:00:00Z",
      },
    ];

    const initialCompile = compilePrompt(project, initialAnswers, {
      templateId: "P-00-IDEA",
    });

    const historicalRun = {
      id: "run_hist_1",
      projectId: project.id,
      templateId: "P-00-IDEA",
      templateVersion: initialCompile.run.templateVersion,
      contextSnapshotId: initialCompile.snapshot.id,
      compiledPrompt: initialCompile.compiledPrompt,
      validationStatus: initialCompile.validationStatus,
      validationMessages: initialCompile.validationMessages,
      status: "ready" as const,
      createdAt: "2026-10-10T00:00:00Z",
    };

    // Before changes: run is fresh
    const freshCheck = checkRunStaleness(
      historicalRun,
      initialCompile.snapshot.contextHash,
      initialCompile.run.templateVersion
    );
    expect(freshCheck.isStale).toBe(false);

    // After answer changes: contextHash changes
    const updatedAnswers: ProjectAnswer[] = [
      {
        ...initialAnswers[0],
        value: "Enterprise Teams",
      },
    ];
    const updatedCompile = compilePrompt(project, updatedAnswers, {
      templateId: "P-00-IDEA",
    });

    const staleCheck = checkRunStaleness(
      historicalRun,
      updatedCompile.snapshot.contextHash,
      updatedCompile.run.templateVersion
    );
    expect(staleCheck.isStale).toBe(true);
    expect(staleCheck.reason).toContain("telah diperbarui");
  });
});

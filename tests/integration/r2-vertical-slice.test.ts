import { describe, expect, it, beforeEach } from "vitest";
import { LocalStorageProjectRepository } from "@/infrastructure/storage-browser";
import { Project, ProjectAnswer } from "@/modules/projects";
import { compilePrompt } from "@/modules/prompt-compiler";
import { PromptGenerationRun } from "@/modules/runs";

describe("R2 MVP Vertical Slice — End-to-End Core Workflow", () => {
  let repo: LocalStorageProjectRepository;

  beforeEach(() => {
    repo = new LocalStorageProjectRepository();
  });

  it("completes full flow: create project -> answer P-00 -> compile -> override -> save run -> export & import", async () => {
    // 1. User creates a new Android project
    const project: Project = {
      id: "proj_flow_01",
      name: "KostCerdas Flow",
      ideaSummary: "Aplikasi mahasiswa kos pencatat pengeluaran bulanan",
      platforms: ["android"],
      complexityTrack: "standard",
      constraintsSummary: "Solo developer, budget terbatas",
      createdAt: "2026-10-09T10:00:00Z",
      updatedAt: "2026-10-09T10:00:00Z",
    };

    await repo.saveProject(project);
    const retrievedProject = await repo.getProject("proj_flow_01");
    expect(retrievedProject).not.toBeNull();
    expect(retrievedProject?.name).toBe("KostCerdas Flow");

    // 2. User answers P-00 questions with explicit certainties
    const answers: ProjectAnswer[] = [
      {
        id: "ans_1",
        projectId: "proj_flow_01",
        key: "product.targetUsers",
        value: "Mahasiswa kos dengan uang saku bulanan terbatas",
        valueType: "string",
        certainty: "confirmed",
        source: "user",
        updatedAt: "2026-10-09T10:05:00Z",
      },
      {
        id: "ans_2",
        projectId: "proj_flow_01",
        key: "product.problem",
        value: "Sering kehabisan uang sebelum akhir bulan",
        valueType: "string",
        certainty: "assumption",
        source: "user",
        updatedAt: "2026-10-09T10:05:00Z",
      },
      {
        id: "ans_3",
        projectId: "proj_flow_01",
        key: "constraints.offlineFirst",
        value: "Harus tetap bisa input saat tidak ada kuota",
        valueType: "string",
        certainty: "preference",
        source: "user",
        updatedAt: "2026-10-09T10:05:00Z",
      },
      {
        id: "ans_4",
        projectId: "proj_flow_01",
        key: "product.authentication",
        value: null,
        valueType: "boolean",
        certainty: "unknown",
        source: "user",
        updatedAt: "2026-10-09T10:05:00Z",
      },
    ];

    await repo.saveAnswers("proj_flow_01", answers);
    const retrievedAnswers = await repo.getAnswers("proj_flow_01");
    expect(retrievedAnswers.length).toBe(4);

    // 3. Compile prompt
    const compileResult = compilePrompt(retrievedProject!, retrievedAnswers);
    expect(compileResult.validationStatus).toBe("ready");
    expect(compileResult.validationMessages.length).toBe(0);

    const compiledText = compileResult.compiledPrompt;

    // Check layer assembly
    expect(compiledText).toContain("# Aturan Kerja");
    expect(compiledText).toContain("# Konteks Proyek");
    expect(compiledText).toContain("Nama proyek: KostCerdas Flow");
    expect(compiledText).toContain("Platform target: Android");

    // Check separation of certainty
    expect(compiledText).toContain("## Fakta terkonfirmasi");
    expect(compiledText).toContain("Mahasiswa kos dengan uang saku bulanan terbatas");
    expect(compiledText).toContain("## Asumsi (belum divalidasi)");
    expect(compiledText).toContain("Sering kehabisan uang sebelum akhir bulan");
    expect(compiledText).toContain("## Preferensi awal (bukan keputusan final)");
    expect(compiledText).toContain("Harus tetap bisa input saat tidak ada kuota");
    expect(compiledText).toContain("## Belum diketahui");
    expect(compiledText).toContain("Kebutuhan login/akun: belum diketahui");

    // Check platform adapter for Android
    expect(compiledText).toContain("Platform Mobile: pertimbangkan konteks perangkat");

    // 4. Run Overrides without corrupting base compiledPrompt
    const compileWithOverrides = compilePrompt(
      retrievedProject!,
      retrievedAnswers,
      {
        userOverrides: "Fokuskan pada pencatatan cepat di bawah 15 detik",
      }
    );
    expect(compileWithOverrides.compiledPrompt).toContain(
      "# Instruksi Tambahan (Run Overrides)"
    );
    expect(compileWithOverrides.compiledPrompt).toContain(
      "Fokuskan pada pencatatan cepat di bawah 15 detik"
    );
    // Base compiledPrompt remains unaffected
    expect(compileResult.compiledPrompt).not.toContain(
      "# Instruksi Tambahan (Run Overrides)"
    );

    // 5. User custom edits for the run: saves run record with immutable snapshot
    const run: PromptGenerationRun = {
      id: "run_flow_01",
      projectId: "proj_flow_01",
      templateId: "P-00-IDEA",
      templateVersion: 1,
      contextSnapshotId: compileResult.snapshot.id,
      compiledPrompt: compileResult.compiledPrompt,
      userEditedPrompt: compiledText + "\n\n<!-- Catatan kustom run developer -->",
      validationStatus: compileResult.validationStatus,
      validationMessages: compileResult.validationMessages,
      status: "ready",
      createdAt: "2026-10-09T10:10:00Z",
    };
    await repo.saveRun(run);

    const savedRuns = await repo.getRuns("proj_flow_01");
    expect(savedRuns.length).toBe(1);
    expect(savedRuns[0].userEditedPrompt).toContain("Catatan kustom run developer");
    // Ensure compiledPrompt inside run matches original
    expect(savedRuns[0].compiledPrompt).toBe(compileResult.compiledPrompt);

    // 6. Export and Import roundtrip
    const exportData = await repo.exportAll();
    expect(exportData.version).toBe("2.0");
    expect(exportData.projects.length).toBe(1);
    expect(exportData.answers.length).toBe(4);
    expect(exportData.runs.length).toBe(1);

    // Simulate clearing data on device
    await repo.deleteProject("proj_flow_01");
    expect((await repo.getProjects()).length).toBe(0);
    expect((await repo.getAnswers("proj_flow_01")).length).toBe(0);
    expect((await repo.getRuns("proj_flow_01")).length).toBe(0);

    // Import from JSON payload
    const importResult = await repo.importAll(JSON.stringify(exportData));
    expect(importResult.success).toBe(true);
    expect(importResult.importedProjectsCount).toBe(1);

    // Verify complete data restoration
    const restoredProjects = await repo.getProjects();
    expect(restoredProjects.length).toBe(1);
    expect(restoredProjects[0].name).toBe("KostCerdas Flow");

    const restoredAnswers = await repo.getAnswers("proj_flow_01");
    expect(restoredAnswers.length).toBe(4);

    const restoredRuns = await repo.getRuns("proj_flow_01");
    expect(restoredRuns.length).toBe(1);
  });

  it("blocks compilation and copy/download when credentials appear in answers", async () => {
    const project: Project = {
      id: "proj_secret_01",
      name: "Secret Project",
      ideaSummary: "Proyek dengan api key tersembunyi",
      platforms: ["web"],
      complexityTrack: "quick",
      createdAt: "2026-10-09T10:00:00Z",
      updatedAt: "2026-10-09T10:00:00Z",
    };

    const leakingAnswers: ProjectAnswer[] = [
      {
        id: "ans_sec_1",
        projectId: "proj_secret_01",
        key: "product.problem",
        value: "Token saya adalah sk-proj-1234567890abcdef1234567890abcdef",
        valueType: "string",
        certainty: "confirmed",
        source: "user",
        updatedAt: "2026-10-09T10:00:00Z",
      },
    ];

    const result = compilePrompt(project, leakingAnswers);
    expect(result.validationStatus).toBe("blocked");
    expect(result.run.status).toBe("blocked");
    expect(
      result.validationMessages.some((m) => m.code === "SECRET_DETECTED")
    ).toBe(true);
  });
});

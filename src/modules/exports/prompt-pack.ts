import { zipSync, strToU8 } from "fflate";
import { Project, ProjectAnswer, AgentArtifact } from "@/modules/projects";
import { compilePrompt, detectSecret } from "@/modules/prompt-compiler";
import {
  TemplateRegistry,
  defaultTemplateRegistry,
  getStagesForProject,
  checkTemplatePrerequisites,
} from "@/modules/templates";
import { PromptPackManifest, PromptPackResult, PromptPackStageSummary } from "./types";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") || "project";
}

export function generatePromptPack(
  project: Project,
  answers: ProjectAnswer[],
  artifacts: AgentArtifact[],
  options?: {
    registry?: TemplateRegistry;
  }
): PromptPackResult {
  const registry = options?.registry || defaultTemplateRegistry;
  const relevantStages = getStagesForProject(project.platforms);
  const approvedStages = artifacts
    .filter((a) => a.status === "approved")
    .map((a) => a.stage);

  const fileMap: Record<string, string> = {};
  const manifestStages: PromptPackStageSummary[] = [];
  const secretFindings: string[] = [];

  // 1. Process stages, generate prompts and export approved artifacts
  for (const stage of relevantStages) {
    const stageArtifact = artifacts.find((a) => a.stage === stage.id);
    const prereqCheck = checkTemplatePrerequisites(stage.id, approvedStages, registry);
    const isApproved = stageArtifact?.status === "approved";

    let promptFileName: string | undefined;
    let artifactFileName: string | undefined;

    // Generate prompt for stage
    try {
      const compileResult = compilePrompt(project, answers, {
        templateId: stage.id,
        artifacts,
      });

      promptFileName = `prompts/${stage.stageNumber}_${stage.id}.md`;
      let promptContent = compileResult.compiledPrompt;

      if (!prereqCheck.satisfied) {
        const missingReasons = prereqCheck.missingPrerequisites
          .map((m) => `- ${m.reason}`)
          .join("\n");
        promptContent = `# [PERINGATAN: PRASYARAT BELUM DISETUJUI]
> Tahap ini (${stage.title}) membutuhkan hasil yang disetujui dari tahap hulu:
${missingReasons}
> Jalankan dan setujui tahap hulu terlebih dahulu sebelum mengeksekusi prompt ini pada AI agent.

---

${promptContent}`;
      }

      fileMap[promptFileName] = promptContent;
    } catch {
      // If compilation fails, prompt file skipped
    }

    // Only export approved artifacts
    if (stageArtifact && isApproved) {
      artifactFileName = `artifacts/${stage.stageNumber}_${stage.id}_APPROVED.md`;
      const artifactContent = `# ${stage.title} — Artefak Disetujui
ID Artefak: ${stageArtifact.id}
Tahap: ${stage.id}
Tanggal Disetujui: ${stageArtifact.approvedAt || stageArtifact.updatedAt}
Sumber: ${stageArtifact.source}

---

${stageArtifact.content}
`;
      fileMap[artifactFileName] = artifactContent;
    }

    manifestStages.push({
      stageId: stage.id,
      stageNumber: stage.stageNumber,
      title: stage.title,
      status: stageArtifact ? stageArtifact.status : "missing",
      isPrerequisiteMet: prereqCheck.satisfied,
      promptFileName,
      artifactFileName,
    });
  }

  // 2. Generate PROJECT_CONTEXT.md
  const contextLines: string[] = [
    `# Konteks Proyek: ${project.name}`,
    `- ID Proyek: ${project.id}`,
    `- Platform Target: ${project.platforms.join(", ")}`,
    `- Jalur Kompleksitas: ${project.complexityTrack}`,
    `- Batasan Proyek: ${project.constraintsSummary || "Tidak ada batasan khusus tercatat."}`,
    "",
    "## Ringkasan Jawaban Kuesioner Terkonfirmasi",
  ];

  const confirmedAnswers = answers.filter((a) => a.certainty === "confirmed");
  if (confirmedAnswers.length > 0) {
    for (const a of confirmedAnswers) {
      contextLines.push(`- **${a.key}**: ${String(a.value ?? "N/A")}`);
    }
  } else {
    contextLines.push("Tidak ada jawaban terkonfirmasi tercatat.");
  }

  contextLines.push("", "## Asumsi Sementara (Belum Tervalidasi)");
  const assumptions = answers.filter((a) => a.certainty === "assumption");
  if (assumptions.length > 0) {
    for (const a of assumptions) {
      contextLines.push(`- **${a.key}**: ${String(a.value ?? "N/A")}`);
    }
  } else {
    contextLines.push("Tidak ada asumsi tercatat.");
  }

  contextLines.push("", "## Preferensi Awal (Bukan Keputusan Final)");
  const preferences = answers.filter((a) => a.certainty === "preference");
  if (preferences.length > 0) {
    for (const a of preferences) {
      contextLines.push(`- **${a.key}**: ${String(a.value ?? "N/A")}`);
    }
  } else {
    contextLines.push("Tidak ada preferensi tercatat.");
  }

  fileMap["context/PROJECT_CONTEXT.md"] = contextLines.join("\n");

  // 3. Generate PROMPT_CHAIN_INDEX.md
  const indexLines: string[] = [
    `# Indeks Rantai Prompt Forma — ${project.name}`,
    `Dibuat secara deterministik oleh Forma Prompt Orchestrator.`,
    "",
    "## Status Rantai Perencanaan",
    "| No | Tahap | Prasyarat | Status Artefak | File Prompt | File Artefak Disetujui |",
    "|:---:|:---|:---|:---:|:---|:---|",
  ];

  for (const s of manifestStages) {
    const prereqLabel = s.isPrerequisiteMet ? "✓ Terpenuhi" : "⚠️ Belum";
    const statusLabel =
      s.status === "approved"
        ? "✓ Approved"
        : s.status === "rejected"
        ? "✗ Rejected"
        : s.status === "in_review" || s.status === "captured"
        ? "Review"
        : "Belum Ada";

    indexLines.push(
      `| ${s.stageNumber} | **${s.title}** (${s.stageId}) | ${prereqLabel} | ${statusLabel} | \`${s.promptFileName || "-"}\` | \`${s.artifactFileName || "-"}\` |`
    );
  }

  indexLines.push(
    "",
    "## Alur Keterhubungan Konteks",
    "1. **P-00: Klarifikasi Ide** → Menghasilkan temuan discovery.",
    "2. **P-01: Product Brief** → Membutuhkan temuan P-00 yang telah disetujui.",
    "3. **P-02: PRD & Requirements** → Membutuhkan Product Brief P-01 yang telah disetujui.",
    "4. **P-03: Tech Stack & Architecture** → Membutuhkan PRD P-02 yang telah disetujui."
  );

  if (project.platforms.includes("web") || project.platforms.includes("multi_platform")) {
    indexLines.push(
      "5. **P-04W: Web Architecture** → Membutuhkan Arsitektur P-03 yang telah disetujui."
    );
  }
  if (
    project.platforms.includes("android") ||
    project.platforms.includes("ios") ||
    project.platforms.includes("cross_platform_mobile") ||
    project.platforms.includes("multi_platform")
  ) {
    indexLines.push(
      "5. **P-04M: Mobile Architecture** → Membutuhkan Arsitektur P-03 yang telah disetujui."
    );
  }

  fileMap["PROMPT_CHAIN_INDEX.md"] = indexLines.join("\n");

  // 4. Generate README.md
  const readmeContent = `# ${project.name} — Forma Prompt Pack

Paket ini berisi rangkaian prompt terstruktur dan dokumen konteks untuk AI coding agent (Claude, Cursor, Copilot, ChatGPT, dll.) yang dihasilkan oleh **Forma**.

## Petunjuk Penggunaan Rantai Prompt

1. **Jalankan Sesuai Urutan:**
   - Buka berkas prompt di folder \`prompts/\` mulai dari nomor urut terendah (P-00).
   - Jangan melompati tahap karena prompt berikutnya membutuhkan konteks hasil tahap sebelumnya yang telah disetujui.

2. **Kirimkan ke AI Agent:**
   - Salin seluruh isi prompt (termasuk instruksi kerja dan kontrak output) ke AI coding agent Anda.
   - Periksa apakah AI agent mematuhi kontrak output yang diminta.

3. **Tinjau dan Setujui di Forma:**
   - Tempelkan atau unggah respon AI agent kembali ke Forma Prompt Studio.
   - Lakukan review, edit bila diperlukan, dan klik **Setujui Hasil (Approve)**.
   - Setelah disetujui, tahap berikutnya akan otomatis aktif dengan konteks terhubung tanpa halusinasi.

## Indeks Berkas dalam Paket
- \`README.md\`: Panduan eksekusi ini.
- \`PROMPT_CHAIN_INDEX.md\`: Matriks status dan alur keterhubungan tahap.
- \`manifest.json\`: Metadata versi dan integritas paket.
- \`context/PROJECT_CONTEXT.md\`: Rangkuman fakta, keputusan, dan batasan proyek.
- \`prompts/\`: Berkas prompt siap pakai per tahap.
- \`artifacts/\`: Dokumen hasil agent yang telah resmi disetujui.

## Integritas & Keamanan
- Paket ini disusun deterministik dari snapshot lokal peramban Anda.
- Hanya dokumen berstatus \`approved\` yang disertakan dalam folder \`artifacts/\`.
- Berkas ini telah melewati pemindaian heuristik secret sebelum diekspor.
`;

  fileMap["README.md"] = readmeContent;

  // 5. Generate manifest.json
  const fileList = Object.keys(fileMap).sort();
  fileList.push("manifest.json");

  const manifest: PromptPackManifest = {
    formatVersion: "1.0",
    formaVersion: "0.1.0",
    exportedAt: new Date().toISOString(),
    project: {
      id: project.id,
      name: project.name,
      platforms: project.platforms,
      complexityTrack: project.complexityTrack,
    },
    stages: manifestStages,
    files: fileList,
  };

  fileMap["manifest.json"] = JSON.stringify(manifest, null, 2);

  // 6. Secret scanning across all generated files
  for (const [filename, content] of Object.entries(fileMap)) {
    if (detectSecret(content)) {
      secretFindings.push(filename);
    }
  }

  // 7. Build ZIP payload using fflate
  const zipEntries: Record<string, Uint8Array> = {};
  for (const [filename, content] of Object.entries(fileMap)) {
    zipEntries[filename] = strToU8(content);
  }

  const zipData = zipSync(zipEntries);
  const filename = `forma-${slugify(project.name)}-prompt-pack.zip`;

  return {
    zipData,
    filename,
    manifest,
    containsSecrets: secretFindings.length > 0,
    secretFindings: secretFindings.length > 0 ? secretFindings : undefined,
  };
}

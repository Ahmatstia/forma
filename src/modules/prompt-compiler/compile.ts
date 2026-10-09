import { Project, ProjectAnswer, AgentArtifact } from "@/modules/projects";
import {
  hashContextSnapshot,
  ProjectContextSnapshot,
  PromptGenerationRun,
  ValidationMessage,
  ValidationStatus,
} from "@/modules/runs";
import { defaultTemplateRegistry, checkTemplatePrerequisites } from "@/modules/templates";
import { SafeTemplateRenderer } from "./engine/safe-renderer";
import { TemplateRenderer } from "./engine/renderer";
import { GLOBAL_AGENT_CONTRACT } from "./layers/global-contract";
import { CONTEXT_ENVELOPE_TEMPLATE } from "./layers/envelope";
import { renderPlatformAdapter } from "./layers/platform-adapters";
import { resolveProjectContext } from "./resolve-context";
import { validateCompilerInputs, validateRenderedOutput } from "./validate";

export interface CompilePromptOptions {
  templateId?: string;
  templateVersion?: number;
  userOverrides?: string;
  renderer?: TemplateRenderer;
  artifacts?: AgentArtifact[];
}

export interface CompilePromptResult {
  compiledPrompt: string;
  snapshot: ProjectContextSnapshot;
  run: PromptGenerationRun;
  validationStatus: ValidationStatus;
  validationMessages: ValidationMessage[];
}

export type CompileResult = CompilePromptResult;

export function compilePrompt(
  project: Project,
  answers: ProjectAnswer[],
  options?: CompilePromptOptions
): CompilePromptResult {
  const templateId = options?.templateId || "P-00-IDEA";
  const template = defaultTemplateRegistry.getTemplate(templateId);
  if (!template) {
    throw new Error(`TemplateNotFound: Template '${templateId}' tidak ditemukan di registri.`);
  }

  const versionNumber = options?.templateVersion || template.currentVersion;
  const version = defaultTemplateRegistry.getVersion(templateId, versionNumber);
  if (!version) {
    throw new Error(
      `TemplateVersionNotFound: Versi ${versionNumber} untuk template '${templateId}' tidak ditemukan.`
    );
  }

  // 1. Resolve context into namespaces answers and derived
  const resolved = resolveProjectContext(project, answers, options?.artifacts);

  // 2. Validate prerequisites for prompt chain
  const prereqCheck = checkTemplatePrerequisites(
    template.id,
    resolved.approvedStages,
    defaultTemplateRegistry
  );
  const prereqMessages: ValidationMessage[] = prereqCheck.missingPrerequisites.map(
    (p) => ({
      level: "error",
      code: "PREREQUISITE_NOT_MET",
      field: p.templateId,
      message: p.reason,
    })
  );

  // 3. Validate input variables
  const inputValidation = validateCompilerInputs(
    version,
    answers,
    resolved.answers
  );

  // 4. Render context envelope
  const renderer = options?.renderer || new SafeTemplateRenderer();
  const renderContext: Record<string, unknown> = {
    template: {
      id: template.id,
      version: version.version,
      name: template.name,
    },
    answers: resolved.answers,
    derived: resolved.derived,
    context: {
      artifact: resolved.artifactsMap,
    },
  };

  const renderedEnvelope = renderer.render(CONTEXT_ENVELOPE_TEMPLATE, renderContext);

  // 5. Render main stage template body
  const renderedBody = renderer.render(version.templateBody, renderContext);

  // 6. Render platform adapter
  const platformFlags = resolved.derived.platform as {
    web: boolean;
    mobile: boolean;
    backend: boolean;
  };
  const renderedPlatformAdapter = renderPlatformAdapter(platformFlags);

  // 7. Assemble layers
  const layers: string[] = [
    GLOBAL_AGENT_CONTRACT,
    renderedEnvelope,
    renderedBody,
  ];

  if (renderedPlatformAdapter.trim().length > 0) {
    layers.push(renderedPlatformAdapter);
  }

  if (options?.userOverrides && options.userOverrides.trim().length > 0) {
    const overrideText = options.userOverrides.trim();
    const matches = overrideText.match(/`+/g) || [];
    let maxBackticks = 0;
    for (const m of matches) {
      if (m.length > maxBackticks) maxBackticks = m.length;
    }
    const fenceLen = Math.max(3, maxBackticks + 1);
    const fence = "`".repeat(fenceLen);
    layers.push(
      `# Instruksi Tambahan (Run Overrides)\nDATA PENGGUNA:\n${fence}text\n${overrideText}\n${fence}`
    );
  }

  const finalPrompt = layers.join("\n\n");

  // 8. Validate rendered output (tokens, secret leaks)
  const outputMessages = validateRenderedOutput(finalPrompt);

  const allMessages = [
    ...prereqMessages,
    ...inputValidation.messages,
    ...outputMessages,
  ];
  const hasError = allMessages.some((m) => m.level === "error");
  const hasWarning = allMessages.some((m) => m.level === "warning");
  const validationStatus: ValidationStatus = hasError
    ? "blocked"
    : hasWarning
    ? "warning"
    : "ready";

  // 9. Produce snapshot and run records
  const contextHash = hashContextSnapshot({
    answers: resolved.answers,
    derived: {
      ...resolved.derived,
      approvedStages: resolved.approvedStages,
      artifacts: resolved.artifactsMap,
    },
  });

  const timestamp = new Date().toISOString();
  const snapshotId = `snap_${contextHash.slice(0, 12)}_${Date.now()}`;
  const runId = `run_${contextHash.slice(0, 8)}_${Date.now()}`;

  const snapshot: ProjectContextSnapshot = {
    id: snapshotId,
    projectId: project.id,
    createdAt: timestamp,
    contextHash,
    answers: resolved.answers,
    derived: resolved.derived,
    openQuestions: resolved.openQuestions,
    warnings: resolved.warnings,
  };

  const run: PromptGenerationRun = {
    id: runId,
    projectId: project.id,
    templateId: template.id,
    templateVersion: version.version,
    contextSnapshotId: snapshotId,
    compiledPrompt: finalPrompt,
    validationStatus,
    validationMessages: allMessages,
    status: validationStatus === "blocked" ? "blocked" : "ready",
    createdAt: timestamp,
  };

  return {
    compiledPrompt: finalPrompt,
    snapshot,
    run,
    validationStatus,
    validationMessages: allMessages,
  };
}

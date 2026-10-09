import { PromptGenerationRun } from "./types";

export interface StalenessCheckResult {
  isStale: boolean;
  reason?: string;
  sourceContextHash: string;
  currentContextHash: string;
}

/**
 * Compares an existing immutable prompt run snapshot against the latest calculated context hash.
 * If the hashes differ, the run is considered stale because its upstream context, answers,
 * or approved artifacts have changed. The historical run record remains untouched.
 */
export function checkRunStaleness(
  run: PromptGenerationRun,
  currentContextHash: string,
  currentTemplateVersion: number
): StalenessCheckResult {
  const isTemplateStale = run.templateVersion !== currentTemplateVersion;
  const hashPrefix = currentContextHash.slice(0, 12);
  const isContextStale = !run.contextSnapshotId.includes(hashPrefix);

  if (isTemplateStale) {
    return {
      isStale: true,
      reason: `Template versi ${run.templateVersion} telah diperbarui ke versi ${currentTemplateVersion}.`,
      sourceContextHash: run.contextSnapshotId,
      currentContextHash,
    };
  }

  if (isContextStale) {
    return {
      isStale: true,
      reason: "Konteks proyek, jawaban kuesioner, atau artefak upstream telah diperbarui sejak run ini dihasilkan.",
      sourceContextHash: run.contextSnapshotId,
      currentContextHash,
    };
  }

  return {
    isStale: false,
    sourceContextHash: run.contextSnapshotId,
    currentContextHash,
  };
}

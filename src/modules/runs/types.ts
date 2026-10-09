import { z } from "zod";
import { canonicalJsonString, deterministicHash } from "@/lib/hash";

export const ValidationStatusSchema = z.enum(["ready", "blocked", "warning"]);
export type ValidationStatus = z.infer<typeof ValidationStatusSchema>;

export const ValidationMessageSchema = z.object({
  level: z.enum(["error", "warning"]),
  code: z.string().min(1),
  message: z.string().min(1),
  field: z.string().optional(),
});
export type ValidationMessage = z.infer<typeof ValidationMessageSchema>;

export const ProjectContextSnapshotSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  createdAt: z.string(),
  contextHash: z.string().min(1),
  answers: z.record(z.string(), z.unknown()),
  derived: z.record(z.string(), z.unknown()),
  openQuestions: z.array(z.string()),
  warnings: z.array(z.string()),
});
export type ProjectContextSnapshot = z.infer<typeof ProjectContextSnapshotSchema>;

export const PromptRunStatusSchema = z.enum([
  "draft",
  "ready",
  "blocked",
  "copied",
  "exported",
  "stale",
]);
export type PromptRunStatus = z.infer<typeof PromptRunStatusSchema>;

export const PromptGenerationRunSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  templateId: z.string().min(1),
  templateVersion: z.number().int().positive(),
  contextSnapshotId: z.string().min(1),
  compiledPrompt: z.string(),
  userEditedPrompt: z.string().optional(),
  validationStatus: ValidationStatusSchema,
  validationMessages: z.array(ValidationMessageSchema),
  status: PromptRunStatusSchema,
  createdAt: z.string(),
});
export type PromptGenerationRun = z.infer<typeof PromptGenerationRunSchema>;

export function hashContextSnapshot(payload: {
  answers: Record<string, unknown>;
  derived: Record<string, unknown>;
}): string {
  const serialized = canonicalJsonString(payload);
  return deterministicHash(serialized);
}

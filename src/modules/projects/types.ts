import { z } from "zod";

export const PlatformSchema = z.enum([
  "web",
  "android",
  "ios",
  "cross_platform_mobile",
  "backend_api",
  "multi_platform",
]);
export type Platform = z.infer<typeof PlatformSchema>;

export const ComplexityTrackSchema = z.enum(["quick", "standard", "advanced"]);
export type ComplexityTrack = z.infer<typeof ComplexityTrackSchema>;

export const CertaintySchema = z.enum([
  "confirmed",
  "assumption",
  "unknown",
  "not_applicable",
  "preference",
]);
export type Certainty = z.infer<typeof CertaintySchema>;

export const ValueTypeSchema = z.enum([
  "string",
  "boolean",
  "number",
  "enum",
  "string_list",
  "object",
]);
export type ValueType = z.infer<typeof ValueTypeSchema>;

export const AnswerSourceSchema = z.enum([
  "user",
  "approved_artifact",
  "approved_decision",
  "ai_suggestion",
  "default",
]);
export type AnswerSource = z.infer<typeof AnswerSourceSchema>;

export const ProjectAnswerSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  key: z.string().min(1),
  value: z.union([
    z.string(),
    z.boolean(),
    z.number(),
    z.array(z.string()),
    z.record(z.string(), z.unknown()),
    z.null(),
  ]),
  valueType: ValueTypeSchema,
  certainty: CertaintySchema,
  source: AnswerSourceSchema,
  updatedAt: z.string(),
});
export type ProjectAnswer = z.infer<typeof ProjectAnswerSchema>;

export const ProjectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  ideaSummary: z.string().min(1),
  platforms: z.array(PlatformSchema).min(1),
  complexityTrack: ComplexityTrackSchema.default("standard"),
  constraintsSummary: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Project = z.infer<typeof ProjectSchema>;

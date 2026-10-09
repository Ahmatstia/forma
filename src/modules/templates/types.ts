import { z } from "zod";
import { PlatformSchema, ComplexityTrackSchema, ValueTypeSchema } from "@/modules/projects";

export const TemplateCategorySchema = z.enum([
  "discovery",
  "product",
  "requirements",
  "ux",
  "data_api",
  "architecture",
  "delivery",
  "implementation",
  "qa",
  "release",
]);
export type TemplateCategory = z.infer<typeof TemplateCategorySchema>;

export const VariableDefinitionSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
  required: z.boolean().default(false),
  supportsUnknown: z.boolean().default(true),
  valueType: ValueTypeSchema,
  defaultValue: z.unknown().optional(),
});
export type VariableDefinition = z.infer<typeof VariableDefinitionSchema>;

export const PromptTemplateVersionSchema = z.object({
  templateId: z.string().min(1),
  version: z.number().int().positive(),
  createdAt: z.string(),
  templateBody: z.string().min(1),
  inputVariables: z.array(VariableDefinitionSchema),
  outputContractSections: z.array(z.string().min(1)),
});
export type PromptTemplateVersion = z.infer<typeof PromptTemplateVersionSchema>;

export const PromptTemplateSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  category: TemplateCategorySchema,
  stage: z.string().min(1),
  supportedPlatforms: z.array(PlatformSchema),
  complexityTracks: z.array(ComplexityTrackSchema),
  status: z.enum(["draft", "published", "deprecated"]),
  currentVersion: z.number().int().positive(),
  prerequisites: z.array(z.string()),
  suggestedNextTemplates: z.array(z.string()),
  versions: z.array(PromptTemplateVersionSchema).min(1),
});
export type PromptTemplate = z.infer<typeof PromptTemplateSchema>;

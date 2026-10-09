import { P00_IDEA_V1 } from "./seeds/p00-idea";
import { P01_PRODUCT_BRIEF_V1 } from "./seeds/p01-product-brief";
import { P02_PRD_V1 } from "./seeds/p02-prd";
import {
  PromptTemplate,
  PromptTemplateSchema,
  PromptTemplateVersion,
} from "./types";

export class TemplateRegistry {
  private templates: Map<string, PromptTemplate> = new Map();

  constructor(initialTemplates?: PromptTemplate[]) {
    if (initialTemplates) {
      for (const t of initialTemplates) {
        this.register(t);
      }
    } else {
      this.register(P00_IDEA_V1);
      this.register(P01_PRODUCT_BRIEF_V1);
      this.register(P02_PRD_V1);
    }
  }

  public register(template: PromptTemplate): void {
    const validated = PromptTemplateSchema.parse(template);
    this.templates.set(validated.id, validated);
  }

  public getTemplate(id: string): PromptTemplate | undefined {
    return this.templates.get(id);
  }

  public getVersion(
    id: string,
    versionNumber: number
  ): PromptTemplateVersion | undefined {
    const template = this.getTemplate(id);
    if (!template) return undefined;
    return template.versions.find((v) => v.version === versionNumber);
  }

  public listTemplates(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }
}

export const defaultTemplateRegistry = new TemplateRegistry();

export interface TemplateRenderer {
  render(
    templateBody: string,
    context: Record<string, unknown>
  ): string;
}

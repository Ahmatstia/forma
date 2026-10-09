export type TemplateFilterFn = (val: unknown, arg?: string) => string;

function isEmpty(val: unknown): boolean {
  if (val === null || val === undefined) return true;
  if (typeof val === "string") return val.trim().length === 0;
  if (Array.isArray(val)) return val.length === 0;
  return false;
}

function formatList(items: unknown[]): string {
  if (items.length === 0) return "";
  return items.map((item) => `- ${String(item)}`).join("\n");
}

export const builtInFilters: Record<string, TemplateFilterFn> = {
  or_unknown: (val: unknown): string => {
    if (isEmpty(val)) return "belum diketahui";
    if (Array.isArray(val)) return formatList(val);
    return String(val);
  },

  format_list_or_unknown: (val: unknown): string => {
    if (isEmpty(val)) return "belum diketahui";
    if (Array.isArray(val)) return formatList(val);
    return `- ${String(val)}`;
  },

  format_list_or_none: (val: unknown): string => {
    if (isEmpty(val)) return "Tidak ada";
    if (Array.isArray(val)) return formatList(val);
    return `- ${String(val)}`;
  },

  or_default: (val: unknown, arg?: string): string => {
    if (isEmpty(val)) return arg !== undefined ? arg : "";
    if (Array.isArray(val)) return formatList(val);
    return String(val);
  },
};

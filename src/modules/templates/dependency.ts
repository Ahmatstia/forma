import { TemplateRegistry } from "./registry";

export interface CycleCheckResult {
  hasCycle: boolean;
  cyclePath?: string[];
}

export interface MissingPrerequisite {
  templateId: string;
  templateName: string;
  reason: string;
}

export interface PrerequisiteCheckResult {
  satisfied: boolean;
  missingPrerequisites: MissingPrerequisite[];
}

/**
 * Checks for circular prerequisites in template definitions across the registry using DFS.
 */
export function checkDependencyCycle(
  registry: TemplateRegistry
): CycleCheckResult {
  const templates = registry.listTemplates();
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const currentPath: string[] = [];

  function dfs(id: string): boolean {
    visited.add(id);
    recursionStack.add(id);
    currentPath.push(id);

    const template = registry.getTemplate(id);
    if (template) {
      for (const prereq of template.prerequisites) {
        if (!visited.has(prereq)) {
          if (dfs(prereq)) return true;
        } else if (recursionStack.has(prereq)) {
          currentPath.push(prereq);
          return true;
        }
      }
    }

    currentPath.pop();
    recursionStack.delete(id);
    return false;
  }

  for (const t of templates) {
    if (!visited.has(t.id)) {
      if (dfs(t.id)) {
        return {
          hasCycle: true,
          cyclePath: [...currentPath],
        };
      }
    }
  }

  return { hasCycle: false };
}

/**
 * Verifies if all prerequisites for a template have been approved.
 */
export function checkTemplatePrerequisites(
  templateId: string,
  approvedStages: string[],
  registry: TemplateRegistry
): PrerequisiteCheckResult {
  const template = registry.getTemplate(templateId);
  if (!template) {
    return { satisfied: true, missingPrerequisites: [] };
  }

  const missing: MissingPrerequisite[] = [];

  for (const prereqId of template.prerequisites) {
    if (!approvedStages.includes(prereqId)) {
      const prereqTemplate = registry.getTemplate(prereqId);
      const name = prereqTemplate?.name || prereqId;
      missing.push({
        templateId: prereqId,
        templateName: name,
        reason: `Hasil tahap '${name}' (${prereqId}) harus berstatus disetujui (approved) sebelum tahap ini dapat diproses.`,
      });
    }
  }

  return {
    satisfied: missing.length === 0,
    missingPrerequisites: missing,
  };
}

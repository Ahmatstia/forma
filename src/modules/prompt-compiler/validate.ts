import { ProjectAnswer } from "@/modules/projects";
import { ValidationMessage, ValidationStatus } from "@/modules/runs";
import { PromptTemplateVersion } from "@/modules/templates";

export const SECRET_PATTERNS = [
  /(?:AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16}/,
  /-----BEGIN[ A-Z0-9_-]*PRIVATE KEY-----/,
  /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/,
  /ghp_[A-Za-z0-9]{36}/,
  /sk-[A-Za-z0-9_-]{20,}/,
  /(?:api[_-]?key|secret|password|passwd|auth[_-]?token)\s*[:=]\s*['"][A-Za-z0-9!@#$%^&*-_]{8,}['"]/i,
];

export function detectSecret(text: string): boolean {
  for (const pattern of SECRET_PATTERNS) {
    if (pattern.test(text)) return true;
  }
  return false;
}

export interface ValidationResult {
  status: ValidationStatus;
  messages: ValidationMessage[];
}

export function validateCompilerInputs(
  templateVersion: PromptTemplateVersion,
  answers: ProjectAnswer[],
  answersDict: Record<string, unknown>
): ValidationResult {
  const messages: ValidationMessage[] = [];

  // 1. Check required variables
  for (const varDef of templateVersion.inputVariables) {
    if (varDef.required) {
      const val = getNestedValue(answersDict, varDef.key);
      const isMissing =
        val === null ||
        val === undefined ||
        (typeof val === "string" && val.trim().length === 0) ||
        (Array.isArray(val) && val.length === 0);

      if (isMissing) {
        messages.push({
          level: "error",
          code: "MISSING_REQUIRED_VARIABLE",
          field: varDef.key,
          message: `Variabel wajib '${varDef.label}' (${varDef.key}) belum diisi.`,
        });
      }
    }
  }

  // 2. Check for duplicate conflicting answers
  const seenKeys = new Map<string, unknown>();
  for (const a of answers) {
    if (seenKeys.has(a.key)) {
      const previous = seenKeys.get(a.key);
      if (previous !== a.value) {
        messages.push({
          level: "warning",
          code: "CONFLICTING_ANSWER",
          field: a.key,
          message: `Terdapat lebih dari satu jawaban yang bertentangan untuk kunci '${a.key}'.`,
        });
      }
    } else {
      seenKeys.set(a.key, a.value);
    }
  }

  // 3. Check for secrets in answers
  for (const a of answers) {
    const str = String(a.value ?? "");
    for (const pattern of SECRET_PATTERNS) {
      if (pattern.test(str)) {
        messages.push({
          level: "error",
          code: "SECRET_DETECTED",
          field: a.key,
          message: `Terindikasi kredensial atau secret sensitif pada masukan '${a.key}'. Kompilasi diblokir.`,
        });
        break;
      }
    }
  }

  const hasError = messages.some((m) => m.level === "error");
  const hasWarning = messages.some((m) => m.level === "warning");
  const status: ValidationStatus = hasError
    ? "blocked"
    : hasWarning
    ? "warning"
    : "ready";

  return { status, messages };
}

export function validateRenderedOutput(renderedPrompt: string): ValidationMessage[] {
  const messages: ValidationMessage[] = [];

  // Check for unresolved template tokens
  if (renderedPrompt.includes("{{") || renderedPrompt.includes("{%")) {
    messages.push({
      level: "error",
      code: "UNRESOLVED_TEMPLATE_TOKEN",
      message:
        "Terdapat placeholder sintaks template yang belum terselesaikan (leftover token) pada prompt hasil kompilasi.",
    });
  }

  // Check for secrets leaked into rendered prompt
  for (const pattern of SECRET_PATTERNS) {
    if (pattern.test(renderedPrompt)) {
      messages.push({
        level: "error",
        code: "SECRET_DETECTED_IN_OUTPUT",
        message:
          "Terindikasi string menyerupai secret atau token sensitif pada output prompt. Copy dan export diblokir.",
      });
      break;
    }
  }

  return messages;
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".");
  let curr: unknown = obj;
  for (const p of parts) {
    if (curr === null || curr === undefined || typeof curr !== "object") {
      return undefined;
    }
    curr = (curr as Record<string, unknown>)[p];
  }
  return curr;
}

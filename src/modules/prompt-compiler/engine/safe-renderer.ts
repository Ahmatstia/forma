import { builtInFilters, TemplateFilterFn } from "./filters";
import { TemplateRenderer } from "./renderer";

const FORBIDDEN_PROPERTIES = new Set(["__proto__", "constructor", "prototype"]);
const ALLOWED_TAGS = new Set([
  "if",
  "else",
  "endif",
  "for",
  "endfor",
  "comment",
  "endcomment",
]);

type ASTNode =
  | { type: "text"; value: string }
  | {
      type: "variable";
      path: string;
      filters: Array<{ name: string; arg?: string }>;
    }
  | {
      type: "if";
      condition: string;
      thenBranch: ASTNode[];
      elseBranch?: ASTNode[];
    }
  | {
      type: "for";
      itemVar: string;
      listPath: string;
      body: ASTNode[];
    };

export class SafeTemplateRenderer implements TemplateRenderer {
  private filters: Record<string, TemplateFilterFn>;

  constructor(customFilters?: Record<string, TemplateFilterFn>) {
    this.filters = {
      ...builtInFilters,
      ...(customFilters || {}),
    };
  }

  public render(templateBody: string, context: Record<string, unknown>): string {
    const ast = this.parse(templateBody);
    return this.evaluate(ast, context);
  }

  private parse(template: string): ASTNode[] {
    const tokens: Array<
      | { type: "text"; value: string }
      | { type: "var"; content: string }
      | { type: "tag"; content: string }
    > = [];

    let cursor = 0;
    while (cursor < template.length) {
      const nextVar = template.indexOf("{{", cursor);
      const nextTag = template.indexOf("{%", cursor);

      let nextIndex = -1;
      let isTag = false;

      if (nextVar !== -1 && nextTag !== -1) {
        if (nextVar < nextTag) {
          nextIndex = nextVar;
          isTag = false;
        } else {
          nextIndex = nextTag;
          isTag = true;
        }
      } else if (nextVar !== -1) {
        nextIndex = nextVar;
        isTag = false;
      } else if (nextTag !== -1) {
        nextIndex = nextTag;
        isTag = true;
      }

      if (nextIndex === -1) {
        tokens.push({ type: "text", value: template.slice(cursor) });
        break;
      }

      if (nextIndex > cursor) {
        tokens.push({ type: "text", value: template.slice(cursor, nextIndex) });
      }

      if (!isTag) {
        const closeIndex = template.indexOf("}}", nextIndex + 2);
        if (closeIndex === -1) {
          throw new Error("SyntaxError: Unclosed variable expression '{{'");
        }
        tokens.push({
          type: "var",
          content: template.slice(nextIndex + 2, closeIndex).trim(),
        });
        cursor = closeIndex + 2;
      } else {
        const closeIndex = template.indexOf("%}", nextIndex + 2);
        if (closeIndex === -1) {
          throw new Error("SyntaxError: Unclosed tag expression '{%'");
        }
        const tagContent = template.slice(nextIndex + 2, closeIndex).trim();
        tokens.push({ type: "tag", content: tagContent });
        cursor = closeIndex + 2;
      }
    }

    let tokenIdx = 0;

    const parseNodes = (stopTags: string[]): ASTNode[] => {
      const nodes: ASTNode[] = [];

      while (tokenIdx < tokens.length) {
        const token = tokens[tokenIdx];

        if (token.type === "text") {
          nodes.push({ type: "text", value: token.value });
          tokenIdx++;
        } else if (token.type === "var") {
          nodes.push(this.parseVariableExpression(token.content));
          tokenIdx++;
        } else if (token.type === "tag") {
          const parts = token.content.split(/\s+/);
          const tagName = parts[0];

          if (!ALLOWED_TAGS.has(tagName)) {
            throw new Error(`SecurityError: Tag '${tagName}' is not allowlisted`);
          }

          if (stopTags.includes(tagName)) {
            return nodes;
          }

          tokenIdx++;

          if (tagName === "if") {
            const condition = token.content.slice(2).trim();
            const thenBranch = parseNodes(["else", "endif"]);

            let elseBranch: ASTNode[] | undefined;
            if (tokenIdx < tokens.length) {
              const currentTag = tokens[tokenIdx];
              if (currentTag.type === "tag" && currentTag.content.trim() === "else") {
                tokenIdx++;
                elseBranch = parseNodes(["endif"]);
              }
            }

            const endIfToken = tokens[tokenIdx];
            if (!endIfToken || endIfToken.type !== "tag" || endIfToken.content.trim() !== "endif") {
              throw new Error("SyntaxError: Missing '{% endif %}' for '{% if %}'");
            }
            tokenIdx++; // consume endif

            nodes.push({ type: "if", condition, thenBranch, elseBranch });
          } else if (tagName === "for") {
            const match = token.content.match(/^for\s+(\w+)\s+in\s+([\w.]+)/);
            if (!match) {
              throw new Error(`SyntaxError: Invalid for loop syntax '${token.content}'`);
            }
            const itemVar = match[1];
            const listPath = match[2];

            const body = parseNodes(["endfor"]);
            const endForToken = tokens[tokenIdx];
            if (!endForToken || endForToken.type !== "tag" || endForToken.content.trim() !== "endfor") {
              throw new Error("SyntaxError: Missing '{% endfor %}' for '{% for %}'");
            }
            tokenIdx++; // consume endfor

            nodes.push({ type: "for", itemVar, listPath, body });
          } else if (tagName === "comment") {
            parseNodes(["endcomment"]);
            if (tokenIdx < tokens.length) tokenIdx++; // consume endcomment
          } else {
            throw new Error(`SyntaxError: Unexpected tag '{% ${token.content} %}'`);
          }
        }
      }

      return nodes;
    };

    return parseNodes([]);
  }

  private parseVariableExpression(expr: string): ASTNode & { type: "variable" } {
    const segments = expr.split("|").map((s) => s.trim());
    const path = segments[0];
    const filters: Array<{ name: string; arg?: string }> = [];

    for (let i = 1; i < segments.length; i++) {
      const filterPart = segments[i];
      const colonIdx = filterPart.indexOf(":");
      if (colonIdx === -1) {
        filters.push({ name: filterPart.trim() });
      } else {
        const name = filterPart.slice(0, colonIdx).trim();
        let arg = filterPart.slice(colonIdx + 1).trim();
        if ((arg.startsWith('"') && arg.endsWith('"')) || (arg.startsWith("'") && arg.endsWith("'"))) {
          arg = arg.slice(1, -1);
        }
        filters.push({ name, arg });
      }
    }

    return { type: "variable", path, filters };
  }

  private evaluate(nodes: ASTNode[], context: Record<string, unknown>): string {
    let result = "";

    for (const node of nodes) {
      if (node.type === "text") {
        result += node.value;
      } else if (node.type === "variable") {
        let value = this.resolvePath(context, node.path);

        for (const f of node.filters) {
          const filterFn = this.filters[f.name];
          if (!filterFn) {
            throw new Error(`Unknown filter: '${f.name}'`);
          }
          value = filterFn(value, f.arg);
        }

        if (value !== null && value !== undefined) {
          result += String(value);
        }
      } else if (node.type === "if") {
        const isTrue = this.evaluateCondition(node.condition, context);
        if (isTrue) {
          result += this.evaluate(node.thenBranch, context);
        } else if (node.elseBranch) {
          result += this.evaluate(node.elseBranch, context);
        }
      } else if (node.type === "for") {
        const listVal = this.resolvePath(context, node.listPath);
        if (Array.isArray(listVal)) {
          for (const item of listVal) {
            const loopContext = { ...context, [node.itemVar]: item };
            result += this.evaluate(node.body, loopContext);
          }
        }
      }
    }

    return result;
  }

  private resolvePath(context: Record<string, unknown>, pathStr: string): unknown {
    if (!pathStr) return undefined;

    const parts = pathStr.split(".");
    let current: unknown = context;

    for (const part of parts) {
      if (FORBIDDEN_PROPERTIES.has(part)) {
        throw new Error(`SecurityError: Access to forbidden property '${part}'`);
      }
      if (current === null || current === undefined || typeof current !== "object") {
        return undefined;
      }
      current = (current as Record<string, unknown>)[part];
    }

    return current;
  }

  private evaluateCondition(condition: string, context: Record<string, unknown>): boolean {
    const trimmed = condition.trim();

    if (trimmed.includes("==")) {
      const [leftPath, rightVal] = trimmed.split("==").map((s) => s.trim());
      const left = this.resolvePath(context, leftPath);
      const right = this.parseLiteral(rightVal);
      return left === right;
    }

    if (trimmed.includes("!=")) {
      const [leftPath, rightVal] = trimmed.split("!=").map((s) => s.trim());
      const left = this.resolvePath(context, leftPath);
      const right = this.parseLiteral(rightVal);
      return left !== right;
    }

    if (trimmed.startsWith("!")) {
      const path = trimmed.slice(1).trim();
      const val = this.resolvePath(context, path);
      return !this.isTruthy(val);
    }

    const val = this.resolvePath(context, trimmed);
    return this.isTruthy(val);
  }

  private isTruthy(val: unknown): boolean {
    if (val === null || val === undefined) return false;
    if (typeof val === "boolean") return val;
    if (typeof val === "number") return val !== 0;
    if (typeof val === "string") return val.trim().length > 0;
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === "object") return Object.keys(val as object).length > 0;
    return true;
  }

  private parseLiteral(valStr: string): unknown {
    if (valStr === "true") return true;
    if (valStr === "false") return false;
    if (valStr === "null") return null;
    if (valStr === "undefined") return undefined;
    if ((valStr.startsWith('"') && valStr.endsWith('"')) || (valStr.startsWith("'") && valStr.endsWith("'"))) {
      return valStr.slice(1, -1);
    }
    const num = Number(valStr);
    if (!isNaN(num)) return num;
    return valStr;
  }
}

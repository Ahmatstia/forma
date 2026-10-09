<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Forma — Agent Instructions

Forma is a **prompt-generation and orchestration web app** for solo developers. User answers become structured context, which a deterministic compiler turns into complete, connected prompts for AI coding agents. It is **not** a Jira/Linear clone and **not** a general chatbot.

This file summarizes `01_AI_AGENT_MASTER_PROMPT.md`. If they disagree, the master prompt and the approved decisions win; record the conflict instead of choosing silently.

## Source of truth (read before changing anything)

1. `00_PRODUCT_BLUEPRINT.md` — product requirements.
2. `01_AI_AGENT_MASTER_PROMPT.md` — working rules.
3. `03_PROMPT_TEMPLATE_CATALOG.md` — compiler/template contract.
4. `docs/architecture/TECHNICAL_DECISIONS.md` — approved vs recommended decisions (labels matter).
5. `docs/architecture/IMPLEMENTATION_ROADMAP.md` and `docs/architecture/REPOSITORY_STRUCTURE.md`.
6. `04_EXAMPLE_PROMPT_CHAIN.md` is **illustrative only**; it is not a second contract.

Keep these separate in everything you write: confirmed fact · user-approved decision · assumption · recommendation · open question.

## Non-negotiable rules

- **Work in small vertical slices** following the roadmap. Current phase: R0 done → next is R1 (pure compiler). Do not start a phase without being asked.
- **The compiler must not depend on** an AI API, React, Next.js, storage, the browser, the filesystem or the network. It must work without any API key. This is enforced by ESLint (`eslint.config.mjs`) and proven by `src/lib/eslint-boundaries.test.ts`.
- **No `eval`, `new Function`, or arbitrary code in templates.** Template syntax is allowlisted.
- **Never fabricate** requirements, research, test results, versions or decisions. Unknown values stay explicit `unknown`.
- **Immutability:** a prompt run keeps its template version and context snapshot; later edits never change old runs.
- **Approval:** only user-approved agent results may feed downstream prompts.
- **Secrets:** never commit keys/tokens. If a secret is detected, block copy/export until the user handles it explicitly. Detection is heuristic and never a guarantee.
- Do not add dependencies, change the database/auth/AI provider, or move source documents without a recorded decision. Do not use `any` or non-null assertions without a written reason.
- Do not disable tests or lint rules to get green. Report real command output only.

## Repository conventions

- Domain logic lives in `src/modules/<name>` (each exposes a public `index.ts`). `src/app` and `src/components` are presentation only. Rules: `docs/architecture/REPOSITORY_STRUCTURE.md`.
- Import across modules via `@/modules/<name>` only; keep imports inside a module relative.
- Template language: Bahasa Indonesia with common English technical terms.
- Commands (all real, run from the repo root): `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, or `npm run verify` for all four.
- Package manager: npm. Node >= 22.12.

## Definition of done for any change

Acceptance criteria verified · lint, typecheck, tests, build actually run and results reported · security impact checked (secrets, XSS, template injection) · docs/ADR updated · limitations stated honestly.

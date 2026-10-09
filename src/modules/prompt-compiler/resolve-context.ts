import { Project, ProjectAnswer, AgentArtifact } from "@/modules/projects";

const NONE_RECORDED = "Tidak ada item tercatat.";

const PLATFORM_LABELS: Record<string, string> = {
  web: "Web",
  android: "Android",
  ios: "iOS",
  cross_platform_mobile: "Cross-platform Mobile",
  backend_api: "Backend / API",
  multi_platform: "Multi-platform",
};

const TRACK_LABELS: Record<string, string> = {
  quick: "Quick Track",
  standard: "Standard Track",
  advanced: "Advanced Track",
};

const FIELD_HUMAN_LABELS: Record<string, string> = {
  "project.name": "Nama proyek",
  "project.ideaSummary": "Ide produk",
  "product.targetUsers": "Target pengguna awal",
  "product.problem": "Masalah",
  "product.currentAlternatives": "Alternatif/workaround saat ini",
  "project.constraintsSummary": "Batasan proyek",
  "project.deliveryConstraints": "Batasan waktu & kapasitas developer",
  "constraints.offlineFirst": "Preferensi offline-first",
  "architecture.technologyPreference": "Teknologi",
  "architecture.preferredStack": "Preferensi tech stack",
  "architecture.dataScale": "Skala data & beban sistem",
  "architecture.hostingTarget": "Target hosting/infrastruktur",
  "architecture.cloudSync": "Kebutuhan sinkronisasi cloud",
  "web.renderingModel": "Model rendering web",
  "web.authStrategy": "Strategi autentikasi web",
  "web.stateManagement": "State management web",
  "web.deploymentTarget": "Target deployment web",
  "mobile.frameworkChoice": "Framework mobile",
  "mobile.offlineSyncStrategy": "Strategi offline & sinkronisasi",
  "mobile.devicePermissions": "Izin perangkat (permissions)",
  "mobile.targetStores": "Target app store",
  "product.authentication": "Kebutuhan login/akun",
  "business.monetization": "Model monetisasi",
  "research.evidence": "Bukti riset",
  "product.unknowns": "Hal yang belum diketahui",
};

export interface ResolvedContext {
  answers: Record<string, unknown>;
  derived: Record<string, unknown>;
  artifactsMap: Record<string, { approvedContent: string; status: string; id?: string }>;
  approvedStages: string[];
  openQuestions: string[];
  warnings: string[];
}

export function resolveProjectContext(
  project: Project,
  answers: ProjectAnswer[],
  artifacts?: AgentArtifact[]
): ResolvedContext {
  const answersDict: Record<string, unknown> = {};

  // Seed standard project answers
  answersDict["project.name"] = project.name;
  answersDict["project.ideaSummary"] = project.ideaSummary;
  answersDict["project.platforms"] = project.platforms;
  answersDict["project.complexityTrack"] = project.complexityTrack;
  if (project.constraintsSummary) {
    answersDict["project.constraintsSummary"] = project.constraintsSummary;
  }

  // Populate answer items
  for (const a of answers) {
    answersDict[a.key] = a.value;
  }

  // Build nested object for answers namespace (e.g. answers.project.name)
  const nestedAnswers: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(answersDict)) {
    const parts = key.split(".");
    let curr: Record<string, unknown> = nestedAnswers;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!curr[parts[i]] || typeof curr[parts[i]] !== "object") {
        curr[parts[i]] = {};
      }
      curr = curr[parts[i]] as Record<string, unknown>;
    }
    curr[parts[parts.length - 1]] = value;
  }

  // Group by certainty
  const facts: string[] = [];
  const assumptions: string[] = [];
  const preferences: string[] = [];
  const unknowns: string[] = [];
  const openQuestions: string[] = [];
  const warnings: string[] = [];

  // Project defaults in categorization
  facts.push(`Nama proyek: ${project.name}`);
  if (project.constraintsSummary) {
    facts.push(`Batasan proyek: ${project.constraintsSummary}`);
  }

  for (const a of answers) {
    const label = FIELD_HUMAN_LABELS[a.key] || a.key;
    const valStr = formatValue(a.value);

    if (a.key === "product.unknowns" && Array.isArray(a.value)) {
      for (const item of a.value) {
        if (typeof item === "string" && item.trim().length > 0) {
          const trimmed = item.trim();
          if (!unknowns.includes(trimmed)) {
            unknowns.push(trimmed);
          }
          if (!openQuestions.includes(trimmed)) {
            openQuestions.push(trimmed);
          }
        }
      }
    } else if (a.certainty === "confirmed") {
      facts.push(`${label}: ${valStr}`);
    } else if (a.certainty === "assumption") {
      assumptions.push(`${label}: ${valStr}`);
    } else if (a.certainty === "preference") {
      preferences.push(`${label}: ${valStr}`);
    } else if (a.certainty === "unknown") {
      unknowns.push(`${label}: belum diketahui`);
      openQuestions.push(label);
    }
  }

  // Platforms flag evaluation
  const platforms = project.platforms;
  const isWeb = platforms.includes("web") || platforms.includes("multi_platform");
  const isMobile =
    platforms.includes("android") ||
    platforms.includes("ios") ||
    platforms.includes("cross_platform_mobile") ||
    platforms.includes("multi_platform");
  const isBackend =
    platforms.includes("backend_api") || platforms.includes("multi_platform");

  const platformsText = platforms
    .map((p) => PLATFORM_LABELS[p] || p)
    .join(", ");
  const complexityTrackText =
    TRACK_LABELS[project.complexityTrack] || project.complexityTrack;

  const derived: Record<string, unknown> = {
    project: {
      platformsText,
      complexityTrackText,
    },
    platform: {
      web: isWeb,
      mobile: isMobile,
      backend: isBackend,
    },
    factsText: facts.length > 0 ? facts.map((f) => `- ${f}`).join("\n") : NONE_RECORDED,
    assumptionsText:
      assumptions.length > 0
        ? assumptions.map((a) => `- ${a}`).join("\n")
        : NONE_RECORDED,
    preferencesText:
      preferences.length > 0
        ? preferences.map((p) => `- ${p}`).join("\n")
        : NONE_RECORDED,
    unknownsText:
      unknowns.length > 0
        ? unknowns.map((u) => `- ${u}`).join("\n")
        : NONE_RECORDED,
    approvedDecisionsText: NONE_RECORDED,
    approvedArtifactsText: NONE_RECORDED,
    conflictsAndWarningsText: NONE_RECORDED,
  };

  const artifactsMap: Record<
    string,
    { approvedContent: string; status: string; id?: string }
  > = {};
  const approvedStages: string[] = [];

  const stageKeys = [
    { canonical: "P-00-IDEA", aliases: ["P00", "P00_IDEA"] },
    { canonical: "P-01-PRODUCT-BRIEF", aliases: ["P01", "P01_PRODUCT_BRIEF"] },
    { canonical: "P-02-PRD", aliases: ["P02", "P02_PRD"] },
    { canonical: "P-03-TECH-STACK", aliases: ["P03", "P03_TECH_STACK"] },
    { canonical: "P-04W-WEB-PLATFORM", aliases: ["P04W", "P04W_WEB_PLATFORM", "P04W_WEB"] },
    { canonical: "P-04M-MOBILE-PLATFORM", aliases: ["P04M", "P04M_MOBILE_PLATFORM", "P04M_MOBILE"] },
  ];

  for (const s of stageKeys) {
    const art = (artifacts || []).find((a) => a.stage === s.canonical);
    if (art && art.status === "approved") {
      approvedStages.push(s.canonical);
      const content = art.content.trim();
      const entry = { approvedContent: content, status: "approved", id: art.id };
      artifactsMap[s.canonical] = entry;
      for (const alias of s.aliases) {
        artifactsMap[alias] = entry;
      }
    } else {
      const entry = {
        approvedContent: "Belum ada hasil yang disetujui untuk tahap ini.",
        status: art?.status || "missing",
        id: art?.id,
      };
      artifactsMap[s.canonical] = entry;
      for (const alias of s.aliases) {
        artifactsMap[alias] = entry;
      }
    }
  }

  const approvedArtifacts = (artifacts || []).filter((a) => a.status === "approved");
  const approvedArtifactsText =
    approvedArtifacts.length > 0
      ? approvedArtifacts
          .map((a) => `- ${a.stage}: Disetujui (${a.content.length} karakter)`)
          .join("\n")
      : NONE_RECORDED;

  derived.approvedArtifactsText = approvedArtifactsText;

  return {
    answers: nestedAnswers,
    derived,
    artifactsMap,
    approvedStages,
    openQuestions,
    warnings,
  };
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return "belum ditentukan";
  if (Array.isArray(val)) return val.join(", ");
  return String(val);
}

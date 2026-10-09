"use client";

import React, { useEffect, useState, useMemo, useRef, use } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import {
  Certainty,
  Project,
  ProjectAnswer,
  AgentArtifact,
  ArtifactStatus,
} from "@/modules/projects";
import { getProjectRepository } from "@/infrastructure/storage-browser";
import {
  CHAIN_STAGES,
  ChainStageInfo,
  P00QuestionDef,
  defaultTemplateRegistry,
  checkTemplatePrerequisites,
} from "@/modules/templates";
import { compilePrompt, CompileResult } from "@/modules/prompt-compiler";
import {
  PromptGenerationRun,
  ValidationMessage,
  checkRunStaleness,
} from "@/modules/runs";

const CERTAINTY_OPTIONS: {
  id: Certainty;
  label: string;
  badge: string;
  desc: string;
}[] = [
  {
    id: "confirmed",
    label: "Fakta Terkonfirmasi",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    desc: "Sudah pasti atau diverifikasi langsung.",
  },
  {
    id: "assumption",
    label: "Asumsi (Belum Divalidasi)",
    badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    desc: "Dugaan awal yang berisiko dan perlu diuji.",
  },
  {
    id: "preference",
    label: "Preferensi Awal",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800",
    desc: "Kecenderungan teknis/alat, bukan keputusan final.",
  },
  {
    id: "unknown",
    label: "Belum Diketahui",
    badge: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
    desc: "Informasi belum tersedia; AI tidak boleh mengarang.",
  },
  {
    id: "not_applicable",
    label: "Tidak Relevan",
    badge: "bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
    desc: "Tidak berlaku untuk jenis proyek ini.",
  },
];

export default function PromptStudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const [project, setProject] = useState<Project | null>(null);
  const [activeStageId, setActiveStageId] = useState<string>("P-00-IDEA");
  const [answers, setAnswers] = useState<Record<string, { value: string; certainty: Certainty }>>({});
  const [artifacts, setArtifacts] = useState<AgentArtifact[]>([]);
  const [runs, setRuns] = useState<PromptGenerationRun[]>([]);

  // Capture artifact editor state for active stage
  const [artifactDraftContent, setArtifactDraftContent] = useState("");
  const [artifactFeedback, setArtifactFeedback] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });

  const [userOverrides, setUserOverrides] = useState("");
  const [customPromptText, setCustomPromptText] = useState("");
  const [activeTab, setActiveTab] = useState<"questions" | "preview" | "artifact">("questions");
  const [previewMode, setPreviewMode] = useState<"compiled" | "custom" | "overrides">("compiled");
  const [isSaving, setIsSaving] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState<"saved" | "unsaved">("saved");
  const [copyToast, setCopyToast] = useState(false);
  const [loading, setLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active stage configuration
  const currentStage: ChainStageInfo = useMemo(() => {
    return CHAIN_STAGES.find((s) => s.id === activeStageId) || CHAIN_STAGES[0];
  }, [activeStageId]);

  // Load project, answers, artifacts, and runs
  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        const repo = getProjectRepository();
        const p = await repo.getProject(projectId);
        if (ignore) return;
        if (!p) {
          setLoading(false);
          return;
        }
        setProject(p);

        const existingAnswers = await repo.getAnswers(projectId);
        if (ignore) return;
        const ansMap: Record<string, { value: string; certainty: Certainty }> = {};

        // Populate defaults from all chain stages
        for (const stage of CHAIN_STAGES) {
          for (const q of stage.questions) {
            ansMap[q.key] = { value: "", certainty: q.defaultCertainty };
          }
        }

        // Overwrite with stored answers
        for (const a of existingAnswers) {
          let strVal = "";
          if (Array.isArray(a.value)) {
            strVal = a.value.join(", ");
          } else if (a.value !== null && a.value !== undefined) {
            strVal = String(a.value);
          }
          ansMap[a.key] = {
            value: strVal,
            certainty: a.certainty,
          };
        }
        setAnswers(ansMap);

        const existingArtifacts = await repo.getArtifacts(projectId);
        if (ignore) return;
        setArtifacts(existingArtifacts);
        const currentArt = existingArtifacts.find((a) => a.stage === "P-00-IDEA");
        if (currentArt) {
          setArtifactDraftContent(currentArt.content);
        }

        const existingRuns = await repo.getRuns(projectId);
        if (ignore) return;
        setRuns(existingRuns);
      } catch (err) {
        console.error("Gagal memuat data:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadData();
    return () => {
      ignore = true;
    };
  }, [projectId]);

  const handleSelectStage = (stageId: string) => {
    setActiveStageId(stageId);
    const existing = artifacts.find((a) => a.stage === stageId);
    setArtifactDraftContent(existing ? existing.content : "");
    setArtifactFeedback({ type: null, message: "" });
  };

  // Approved stages list for prerequisite validation
  const approvedStages = useMemo(() => {
    return artifacts.filter((a) => a.status === "approved").map((a) => a.stage);
  }, [artifacts]);

  // Prerequisite check for current stage
  const prereqCheck = useMemo(() => {
    return checkTemplatePrerequisites(activeStageId, approvedStages, defaultTemplateRegistry);
  }, [activeStageId, approvedStages]);

  // Current stage's artifact
  const currentStageArtifact = useMemo(() => {
    return artifacts.find((a) => a.stage === activeStageId) || null;
  }, [artifacts, activeStageId]);

  // Convert answers state to ProjectAnswer[] for compiler
  const projectAnswersList: ProjectAnswer[] = useMemo(() => {
    return Object.entries(answers).map(([key, item], index) => {
      let parsedValue:
        | string
        | number
        | boolean
        | string[]
        | Record<string, unknown>
        | null = item.value.trim();

      const allQuestions = CHAIN_STAGES.flatMap((s) => s.questions);
      const qDef = allQuestions.find((q) => q.key === key);

      if (item.certainty === "unknown") {
        parsedValue = null;
      } else if (qDef?.valueType === "string_list") {
        parsedValue = item.value
          .split(/[\n,]+/)
          .map((s) => s.trim())
          .filter(Boolean);
      }

      return {
        id: `ans_${projectId}_${index}`,
        projectId,
        key,
        value: parsedValue,
        valueType: qDef?.valueType || "string",
        certainty: item.certainty,
        source: "user",
        updatedAt: new Date().toISOString(),
      };
    });
  }, [answers, projectId]);

  // Live compilation via pure compiler with chain artifacts
  const compileResult: CompileResult | null = useMemo(() => {
    if (!project) return null;
    try {
      return compilePrompt(project, projectAnswersList, {
        templateId: activeStageId,
        userOverrides: userOverrides.trim() ? userOverrides : undefined,
        artifacts,
      });
    } catch (err) {
      console.error("Compile error:", err);
      return null;
    }
  }, [project, projectAnswersList, activeStageId, userOverrides, artifacts]);

  // Staleness detection for the latest saved run of this stage
  const latestRunForStage = useMemo(() => {
    return runs.find((r) => r.templateId === activeStageId) || null;
  }, [runs, activeStageId]);

  const runStaleness = useMemo(() => {
    if (!latestRunForStage || !compileResult) return null;
    return checkRunStaleness(
      latestRunForStage,
      compileResult.snapshot.contextHash,
      compileResult.run.templateVersion
    );
  }, [latestRunForStage, compileResult]);

  // Handle questionnaire changes
  const handleAnswerChange = (key: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [key]: {
        value,
        certainty: prev[key]?.certainty || "confirmed",
      },
    }));
    setSaveIndicator("unsaved");
  };

  const handleCertaintyChange = (key: string, certainty: Certainty) => {
    setAnswers((prev) => ({
      ...prev,
      [key]: {
        value: certainty === "unknown" ? "" : prev[key]?.value || "",
        certainty,
      },
    }));
    setSaveIndicator("unsaved");
  };

  const saveAnswersToStorage = async () => {
    if (!project) return;
    setIsSaving(true);
    try {
      const repo = getProjectRepository();
      await repo.saveAnswers(projectId, projectAnswersList);
      setSaveIndicator("saved");
    } catch (err) {
      alert("Gagal menyimpan jawaban: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Agent Artifact submission & review
  const handleSaveArtifact = async (newStatus: ArtifactStatus) => {
    if (!project) return;
    if (!artifactDraftContent.trim()) {
      setArtifactFeedback({
        type: "error",
        message: "Konten hasil agent tidak boleh kosong.",
      });
      return;
    }

    // Security check: validate size (max 500KB)
    if (artifactDraftContent.length > 500 * 1024) {
      setArtifactFeedback({
        type: "error",
        message: "Ukuran berkas melebihi batas maksimal 500 KB.",
      });
      return;
    }

    // Security check: secret scanning
    const hasSecretPattern =
      /(?:AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16}/.test(artifactDraftContent) ||
      /sk-[A-Za-z0-9_-]{20,}/.test(artifactDraftContent) ||
      /ghp_[A-Za-z0-9]{36}/.test(artifactDraftContent) ||
      /-----BEGIN[ A-Z0-9_-]*PRIVATE KEY-----/.test(artifactDraftContent);

    if (hasSecretPattern) {
      setArtifactFeedback({
        type: "error",
        message:
          "Terdeteksi string menyerupai kredensial/API key dalam hasil agent. Hapus kunci rahasia sebelum menyetujui dokumen ini.",
      });
      return;
    }

    try {
      const repo = getProjectRepository();
      const now = new Date().toISOString();
      const artifact: AgentArtifact = {
        id: currentStageArtifact?.id || `art_${projectId}_${activeStageId}_${Date.now()}`,
        projectId,
        stage: activeStageId,
        content: artifactDraftContent.trim(),
        status: newStatus,
        reviewedAt: now,
        approvedAt: newStatus === "approved" ? now : currentStageArtifact?.approvedAt,
        source: "user_paste",
        createdAt: currentStageArtifact?.createdAt || now,
        updatedAt: now,
      };

      await repo.saveArtifact(artifact);
      const updatedList = await repo.getArtifacts(projectId);
      setArtifacts(updatedList);

      setArtifactFeedback({
        type: "success",
        message:
          newStatus === "approved"
            ? `Hasil tahap ${activeStageId} berhasil DISETUJUI (Approved). Konteks ini kini aktif untuk tahap selanjutnya!`
            : `Status hasil diperbarui menjadi '${newStatus}'.`,
      });
    } catch (err) {
      setArtifactFeedback({
        type: "error",
        message:
          "Gagal menyimpan artefak: " +
          (err instanceof Error ? err.message : String(err)),
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      alert("Ukuran berkas maksimal 500 KB.");
      return;
    }

    try {
      const text = await file.text();
      setArtifactDraftContent(text);
      setArtifactFeedback({
        type: "success",
        message: `Berkas '${file.name}' berhasil dimuat ke editor. Silakan tinjau dan klik 'Setujui Hasil' jika sudah sesuai.`,
      });
    } catch (err) {
      alert("Gagal membaca berkas: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const currentDisplayPrompt = useMemo(() => {
    if (previewMode === "custom" && customPromptText.trim().length > 0) {
      return customPromptText;
    }
    return compileResult?.compiledPrompt || "";
  }, [previewMode, customPromptText, compileResult]);

  const handleCopy = async () => {
    if (!compileResult || compileResult.validationStatus === "blocked") return;
    try {
      await navigator.clipboard.writeText(currentDisplayPrompt);
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 2500);
    } catch {
      alert("Gagal menyalin ke clipboard. Silakan salin secara manual.");
    }
  };

  const handleDownloadMarkdown = () => {
    if (!compileResult || !project || compileResult.validationStatus === "blocked") return;
    const blob = new Blob([currentDisplayPrompt], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.name.toLowerCase().replace(/\s+/g, "-")}-${activeStageId}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleSaveRun = async () => {
    if (!compileResult || !project) return;
    try {
      const repo = getProjectRepository();
      const run: PromptGenerationRun = {
        id: `run_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        projectId,
        templateId: activeStageId,
        templateVersion: compileResult.run.templateVersion,
        contextSnapshotId: compileResult.snapshot.id,
        compiledPrompt: compileResult.compiledPrompt,
        userEditedPrompt: customPromptText.trim() ? customPromptText : undefined,
        validationStatus: compileResult.validationStatus,
        validationMessages: compileResult.validationMessages,
        status: "ready",
        createdAt: new Date().toISOString(),
      };
      await repo.saveRun(run);
      const updatedRuns = await repo.getRuns(projectId);
      setRuns(updatedRuns);
      alert(`Snapshot run untuk tahap ${activeStageId} berhasil disimpan!`);
    } catch (err) {
      alert("Gagal menyimpan run: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-sm text-zinc-500">
          Memuat Prompt Studio & Chain Stages...
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Proyek Tidak Ditemukan
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Proyek ini tidak ditemukan di penyimpanan browser perangkat Anda.
          </p>
          <Link
            href="/"
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition"
          >
            Kembali ke Daftar Proyek
          </Link>
        </div>
      </div>
    );
  }

  const isBlocked = compileResult?.validationStatus === "blocked";
  const hasWarnings = compileResult?.validationStatus === "warning";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col font-sans">
      <Navbar />

      {/* Studio Header Bar */}
      <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium"
            >
              ← Proyek
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <h1 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {project.name}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-medium">
              Chain Flow P-00 → P-02
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-xs flex items-center gap-1.5 ${
                saveIndicator === "saved"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-600 dark:text-amber-400 font-medium"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  saveIndicator === "saved" ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              {saveIndicator === "saved"
                ? "Tersimpan di Browser"
                : "Ada Perubahan Belum Disimpan"}
            </span>

            <button
              type="button"
              onClick={saveAnswersToStorage}
              disabled={isSaving}
              className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition cursor-pointer"
            >
              {isSaving ? "Menyimpan..." : "💾 Simpan Jawaban"}
            </button>
          </div>
        </div>
      </div>

      {/* R3 Prompt Chain Stage Stepper */}
      <div className="bg-zinc-100/80 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 px-4 py-2 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {CHAIN_STAGES.map((stage, idx) => {
              const isSelected = stage.id === activeStageId;
              const isApproved = approvedStages.includes(stage.id);
              const stageArtifact = artifacts.find((a) => a.stage === stage.id);
              const isRejected = stageArtifact?.status === "rejected";
              const isInReview = stageArtifact?.status === "captured" || stageArtifact?.status === "in_review";
              const isPrereqMet = !stage.prerequisiteId || approvedStages.includes(stage.prerequisiteId);

              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => handleSelectStage(stage.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer border ${
                    isSelected
                      ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border-indigo-500/60 shadow-xs ring-1 ring-indigo-500/30"
                      : "bg-white/50 dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800"
                  }`}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{stage.title}</span>

                  {/* Status Badge */}
                  {isApproved && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                      ✓ Approved
                    </span>
                  )}
                  {isRejected && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                      ✗ Rejected
                    </span>
                  )}
                  {isInReview && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                      In Review
                    </span>
                  )}
                  {!stageArtifact && !isPrereqMet && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      Locked
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 flex">
        <button
          type="button"
          onClick={() => setActiveTab("questions")}
          className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition ${
            activeTab === "questions"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          1. Kuesioner Tahap Ini
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition ${
            activeTab === "preview"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          2. Prompt & Validasi
          {isBlocked && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px]">
              Blocked
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("artifact")}
          className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition ${
            activeTab === "artifact"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          3. Tangkap Hasil Agent
        </button>
      </div>

      {/* Main Studio Work Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Prerequisite Missing Warning Banner */}
        {!prereqCheck.satisfied && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50/90 dark:border-amber-900/60 dark:bg-amber-950/30 p-4 sm:p-5 text-amber-900 dark:text-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <span>⚠️</span>
              <span>Prasyarat Tahap Ini Belum Terpenuhi</span>
            </div>
            <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300">
              {currentStage.title} memerlukan hasil yang disetujui dari tahap sebelumnya (
              <strong>{currentStage.prerequisiteName}</strong>) agar prompt memiliki konteks terhubung dan tidak berhalusinasi.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (currentStage.prerequisiteId) {
                    handleSelectStage(currentStage.prerequisiteId);
                  }
                }}
                className="rounded-lg bg-amber-800 text-white px-3 py-1.5 text-xs font-semibold hover:bg-amber-700 transition cursor-pointer"
              >
                ← Buka {currentStage.prerequisiteName} untuk Review & Approve
              </button>
            </div>
          </div>
        )}

        {/* Staleness Banner if current context differs from saved run */}
        {runStaleness?.isStale && (
          <div className="rounded-xl border border-amber-300/80 bg-amber-50/70 p-3.5 dark:border-amber-900/40 dark:bg-amber-950/20 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>🔄</span>
              <span>
                <strong>Run Sebelumnya Menjadi Stale:</strong> {runStaleness.reason}
              </span>
            </div>
            <span className="text-[11px] text-amber-700 dark:text-amber-400 italic">
              Snapshot run lama tetap aman tersimpan.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Kiri: Kuesioner Tahap Ini */}
          <div
            className={`lg:col-span-5 space-y-6 ${
              activeTab === "questions" ? "block" : "hidden lg:block"
            }`}
          >
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-xs space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    {currentStage.badge}
                  </span>
                  <span className="text-xs text-zinc-400">
                    Tahap {currentStage.stageNumber}
                  </span>
                </div>
                <h2 className="mt-1 text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {currentStage.title}
                </h2>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {currentStage.description}
                </p>
              </div>

              {/* Questions List for Current Stage */}
              <div className="space-y-5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                {currentStage.questions.map((q: P00QuestionDef) => {
                  const answerState = answers[q.key] || {
                    value: "",
                    certainty: q.defaultCertainty,
                  };
                  const isUnknown = answerState.certainty === "unknown";
                  const isNA = answerState.certainty === "not_applicable";

                  return (
                    <div
                      key={q.key}
                      className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/50 dark:bg-zinc-950/40 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                        <div>
                          <label
                            htmlFor={q.key}
                            className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                          >
                            {q.label}
                          </label>
                          <p className="text-[11px] text-zinc-500 mt-0.5">
                            {q.description}
                          </p>
                        </div>

                        {/* Certainty Selector */}
                        <div className="flex items-center gap-1.5 self-start sm:self-center">
                          <label htmlFor={`certainty-${q.key}`} className="sr-only">
                            Status Kepastian
                          </label>
                          <select
                            id={`certainty-${q.key}`}
                            value={answerState.certainty}
                            onChange={(e) =>
                              handleCertaintyChange(
                                q.key,
                                e.target.value as Certainty
                              )
                            }
                            className="text-xs font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                          >
                            {CERTAINTY_OPTIONS.map((opt) => (
                              <option key={opt.id} value={opt.id}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Input Field */}
                      {!isUnknown && !isNA ? (
                        <textarea
                          id={q.key}
                          rows={2}
                          value={answerState.value}
                          onChange={(e) => handleAnswerChange(q.key, e.target.value)}
                          placeholder={q.placeholder}
                          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-indigo-600 focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
                        />
                      ) : (
                        <div className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-xs text-zinc-500 italic flex items-center gap-2">
                          <span>🔒</span>
                          <span>
                            {isUnknown
                              ? "Ditandai sebagai 'Belum Diketahui' — nilai tidak akan dikarang."
                              : "Ditandai sebagai 'Tidak Relevan' untuk tahap ini."}
                          </span>
                        </div>
                      )}

                      <div className="text-[11px] text-zinc-400 pt-0.5">
                        {q.helpText}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Kolom Tengah/Kanan: Prompt Preview & Tangkap Hasil Agent */}
          <div
            className={`lg:col-span-7 space-y-6 ${
              activeTab !== "questions" ? "block" : "hidden lg:block"
            }`}
          >
            {/* Validation Banner */}
            {compileResult && (
              <div
                className={`rounded-xl border p-4 text-xs sm:text-sm ${
                  isBlocked
                    ? "bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-200"
                    : hasWarnings
                    ? "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-200"
                    : "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-200"
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  <span>{isBlocked ? "⛔" : hasWarnings ? "⚠️" : "✅"}</span>
                  <span>
                    {isBlocked
                      ? "Penyusunan Prompt Terblokir"
                      : hasWarnings
                      ? "Prompt Siap (Dengan Peringatan)"
                      : "Prompt Siap Digunakan"}
                  </span>
                </div>

                {compileResult.validationMessages.length > 0 && (
                  <ul className="mt-2 list-disc list-inside space-y-1 text-xs">
                    {compileResult.validationMessages.map(
                      (msg: ValidationMessage, i: number) => (
                        <li key={i}>
                          <strong>[{msg.code}]</strong> {msg.message}
                        </li>
                      )
                    )}
                  </ul>
                )}
                {isBlocked && (
                  <p className="mt-2 text-xs font-semibold underline">
                    Tindakan salin dan unduh dinonaktifkan sampai prasyarat atau kesalahan variabel diselesaikan.
                  </p>
                )}
              </div>
            )}

            {/* Prompt Actions & Mode Bar */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("compiled")}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                      previewMode === "compiled"
                        ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                    }`}
                  >
                    Hasil Kompilasi {activeStageId}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("custom")}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                      previewMode === "custom"
                        ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                    }`}
                  >
                    Edit Run Ini
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("overrides")}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                      previewMode === "overrides"
                        ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                    }`}
                  >
                    Instruksi Tambahan
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={isBlocked}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {copyToast ? "✓ Tersalin!" : "📋 Salin Prompt"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadMarkdown}
                    disabled={isBlocked}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    📥 Unduh .md
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveRun}
                    disabled={isBlocked}
                    title="Simpan snapshot run untuk audit"
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                  >
                    📌 Snapshot
                  </button>
                </div>
              </div>

              {/* Mode Views */}
              {previewMode === "compiled" && (
                <div className="relative">
                  <pre className="w-full max-h-[380px] overflow-auto rounded-xl bg-zinc-900 p-4 text-xs font-mono text-zinc-100 whitespace-pre-wrap leading-relaxed border border-zinc-800">
                    {compileResult?.compiledPrompt || "Prompt belum selesai dikompilasi."}
                  </pre>
                  <div className="mt-2 text-[11px] text-zinc-500 flex items-center justify-between">
                    <span>Kompilasi deterministik dari 7 lapisan Forma.</span>
                    <span>Template: {activeStageId} v1</span>
                  </div>
                </div>
              )}

              {previewMode === "custom" && (
                <div className="space-y-2">
                  <textarea
                    rows={15}
                    value={
                      customPromptText || compileResult?.compiledPrompt || ""
                    }
                    onChange={(e) => setCustomPromptText(e.target.value)}
                    placeholder="Tulis editan prompt untuk run ini..."
                    className="w-full rounded-xl bg-zinc-900 p-4 text-xs font-mono text-zinc-100 leading-relaxed border border-zinc-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                  <div className="flex justify-between items-center text-xs">
                    <button
                      type="button"
                      onClick={() => setCustomPromptText("")}
                      className="text-xs text-rose-500 underline cursor-pointer"
                    >
                      Reset ke Hasil Kompilasi Asli
                    </button>
                    <span className="text-[11px] text-zinc-400">
                      Teks kustom ini tidak mengubah template asli.
                    </span>
                  </div>
                </div>
              )}

              {previewMode === "overrides" && (
                <div className="space-y-2">
                  <textarea
                    rows={6}
                    value={userOverrides}
                    onChange={(e) => setUserOverrides(e.target.value)}
                    placeholder="Instruksi tambahan yang dibungkus berpagar aman di DATA PENGGUNA..."
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-3 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>

            {/* R3 Capture & Review Agent Output Section */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      Tangkap & Tinjau Hasil Agent ({activeStageId})
                    </h3>
                    {currentStageArtifact?.status === "approved" && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        ✓ APPROVED
                      </span>
                    )}
                    {currentStageArtifact?.status === "rejected" && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        ✗ REJECTED
                      </span>
                    )}
                    {(currentStageArtifact?.status === "captured" ||
                      currentStageArtifact?.status === "in_review") && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        PERLU REVIEW
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Tempelkan respon dari AI coding agent atau unggah file Markdown (.md). Hanya hasil yang <strong>disetujui</strong> yang akan diteruskan ke prompt tahap selanjutnya.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".md,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                  >
                    📂 Unggah .md
                  </button>
                </div>
              </div>

              {artifactFeedback.type && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center justify-between border ${
                    artifactFeedback.type === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
                      : "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300"
                  }`}
                >
                  <span>{artifactFeedback.message}</span>
                  <button
                    type="button"
                    onClick={() => setArtifactFeedback({ type: null, message: "" })}
                    className="font-bold underline ml-2 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Artifact Markdown Content Editor */}
              <div className="space-y-2">
                <textarea
                  rows={10}
                  value={artifactDraftContent}
                  onChange={(e) => setArtifactDraftContent(e.target.value)}
                  placeholder={`Tempelkan hasil markdown dari agent untuk tahap ${activeStageId} di sini (misal: ${currentStage.expectedArtifactTitle})...`}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 p-3 text-xs font-mono text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                  <span className="text-[11px] text-zinc-400">
                    Input diperlakukan sebagai data pasif (untrusted data) dengan isolasi pagar kode.
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveArtifact("rejected")}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60 transition cursor-pointer"
                    >
                      ✗ Tolak Hasil
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveArtifact("in_review")}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg text-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition cursor-pointer"
                    >
                      Simpan Draf Review
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveArtifact("approved")}
                      className="px-4 py-1.5 text-xs font-bold rounded-lg text-white bg-emerald-600 hover:bg-emerald-500 shadow-xs transition cursor-pointer"
                    >
                      ✓ Setujui Hasil (Approve)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

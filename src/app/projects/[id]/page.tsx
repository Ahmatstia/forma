"use client";

import React, { useEffect, useState, useMemo, use } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import {
  Certainty,
  Project,
  ProjectAnswer,
  getProjectRepository,
} from "@/modules/projects";
import {
  P00_QUESTIONS,
  P00_QUESTION_GROUPS,
  P00QuestionDef,
} from "@/modules/templates";
import { compilePrompt, CompileResult } from "@/modules/prompt-compiler";
import { PromptGenerationRun, ValidationMessage } from "@/modules/runs";

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
  const [answers, setAnswers] = useState<Record<string, { value: string; certainty: Certainty }>>({});
  const [userOverrides, setUserOverrides] = useState("");
  const [customPromptText, setCustomPromptText] = useState("");
  const [activeTab, setActiveTab] = useState<"questions" | "preview">("questions");
  const [previewMode, setPreviewMode] = useState<"compiled" | "custom" | "overrides">("compiled");
  const [isSaving, setIsSaving] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState<"saved" | "unsaved">("saved");
  const [copyToast, setCopyToast] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load project & answers
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

        // Populate defaults from questions def
        for (const q of P00_QUESTIONS) {
          ansMap[q.key] = { value: "", certainty: q.defaultCertainty };
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
      const qDef = P00_QUESTIONS.find((q) => q.key === key);

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

  // Live compilation via pure R1 compiler
  const compileResult: CompileResult | null = useMemo(() => {
    if (!project) return null;
    try {
      return compilePrompt(project, projectAnswersList, {
        userOverrides: userOverrides.trim() ? userOverrides : undefined,
      });
    } catch (err) {
      console.error("Compile error:", err);
      return null;
    }
  }, [project, projectAnswersList, userOverrides]);

  // Handle answering field
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

  // Auto-save debounced or on-demand
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
    link.download = `${project.name.toLowerCase().replace(/\s+/g, "-")}-P-00.md`;
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
        templateId: "P-00-IDEA",
        templateVersion: 1,
        contextSnapshotId: compileResult.snapshot.id,
        compiledPrompt: compileResult.compiledPrompt,
        userEditedPrompt: customPromptText.trim() ? customPromptText : undefined,
        validationStatus: compileResult.validationStatus,
        validationMessages: compileResult.validationMessages,
        status: "ready",
        createdAt: new Date().toISOString(),
      };
      await repo.saveRun(run);
      alert("Snapshot run berhasil disimpan ke riwayat proyek!");
    } catch (err) {
      alert("Gagal menyimpan run: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-sm text-zinc-500">
          Memuat Prompt Studio...
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
            Proyek dengan ID ini tidak ada di penyimpanan browser perangkat Anda.
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
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              P-00 Klarifikasi Ide
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
          1. Kuesioner P-00
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
          2. Hasil Prompt & Validasi
          {isBlocked && (
            <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px]">
              Blocked
            </span>
          )}
        </button>
      </div>

      {/* Main Studio Work Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Kiri: Kuesioner P-00 */}
          <div
            className={`lg:col-span-6 space-y-6 ${
              activeTab === "questions" ? "block" : "hidden lg:block"
            }`}
          >
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-xs space-y-8">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Pertanyaan P-00: Klarifikasi Ide
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                  Isi data yang Anda miliki. Pilih status kepastian untuk setiap jawaban. Informasi yang belum Anda ketahui akan dijaga tanpa dikarang oleh AI agent.
                </p>
              </div>

              {/* Questionnaire Groups */}
              {P00_QUESTION_GROUPS.map((group) => {
                const groupQuestions = P00_QUESTIONS.filter(
                  (q) => q.group === group.id
                );
                return (
                  <div key={group.id} className="space-y-5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                    <div>
                      <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                        {group.title}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {group.description}
                      </p>
                    </div>

                    <div className="space-y-6">
                      {groupQuestions.map((q: P00QuestionDef) => {
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
                                  className="text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                                >
                                  {q.label}
                                </label>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                  {q.description}
                                </p>
                              </div>

                              {/* Certainty Selector */}
                              <div className="flex items-center gap-1.5 self-start sm:self-center">
                                <label
                                  htmlFor={`certainty-${q.key}`}
                                  className="sr-only"
                                >
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
                                  className="text-xs font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
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
                                onChange={(e) =>
                                  handleAnswerChange(q.key, e.target.value)
                                }
                                placeholder={q.placeholder}
                                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-indigo-600 focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
                              />
                            ) : (
                              <div className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-xs text-zinc-500 italic flex items-center gap-2">
                                <span>🔒</span>
                                <span>
                                  {isUnknown
                                    ? "Ditandai sebagai 'Belum Diketahui' — AI agent akan mencatat ini sebagai pertanyaan terbuka."
                                    : "Ditandai sebagai 'Tidak Relevan' untuk proyek ini."}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                              <span>{q.helpText}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Kolom Kanan: Hasil Prompt & Validasi */}
          <div
            className={`lg:col-span-6 space-y-6 ${
              activeTab === "preview" ? "block" : "hidden lg:block"
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
                  <span>
                    {isBlocked ? "⛔" : hasWarnings ? "⚠️" : "✅"}
                  </span>
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
                    Tindakan salin dan unduh dinonaktifkan sampai kredensial rahasia atau kesalahan variabel diperbaiki.
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
                    Hasil Kompilasi (Asli)
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
                  <pre className="w-full max-h-[640px] overflow-auto rounded-xl bg-zinc-900 p-4 text-xs font-mono text-zinc-100 whitespace-pre-wrap leading-relaxed border border-zinc-800">
                    {compileResult?.compiledPrompt || "Prompt belum selesai dikompilasi."}
                  </pre>
                  <div className="mt-2 text-[11px] text-zinc-500">
                    Kompilasi deterministik dari 7 lapisan kontrak Forma. Tidak bergantung pada koneksi internet atau API eksternal.
                  </div>
                </div>
              )}

              {previewMode === "custom" && (
                <div className="space-y-2">
                  <p className="text-xs text-zinc-500">
                    Kustomisasi prompt secara bebas khusus untuk run kali ini. Perubahan di sini <strong>tidak akan menimpa</strong> hasil kompilasi asli.
                  </p>
                  <textarea
                    rows={22}
                    value={
                      customPromptText ||
                      compileResult?.compiledPrompt ||
                      ""
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
                      Teks kustom ini yang akan disalin / diunduh saat mode ini aktif.
                    </span>
                  </div>
                </div>
              )}

              {previewMode === "overrides" && (
                <div className="space-y-2">
                  <p className="text-xs text-zinc-500">
                    Tambahkan instruksi spesifik untuk model AI (misal: bahasa Indonesia santai, batasi ke 3 fitur, dsb). Teks ini akan dibungkus secara aman di dalam blok berpagar <code>DATA PENGGUNA</code>.
                  </p>
                  <textarea
                    rows={8}
                    value={userOverrides}
                    onChange={(e) => setUserOverrides(e.target.value)}
                    placeholder="Contoh: Fokuskan solusi pada pencatatan harian yang bisa dilakukan dalam waktu kurang dari 30 detik tanpa registrasi akun."
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-3 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                  <div className="text-[11px] text-zinc-400">
                    Instruksi tambahan akan otomatis dimasukkan ke dalam Layer 5 prompt terkompilasi.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

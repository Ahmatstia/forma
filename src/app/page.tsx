"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Project, getProjectRepository } from "@/modules/projects";
import { Navbar } from "@/components/navbar";
import { StorageNotice } from "@/components/storage-notice";
import { ConfirmModal } from "@/components/confirm-modal";
import {
  KOSTCERDAS_PROJECT,
  KOSTCERDAS_ANSWERS,
} from "../../tests/fixtures/kostcerdas.fixture";

const PLATFORM_BADGES: Record<string, { label: string; color: string }> = {
  web: { label: "Web", color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800" },
  android: { label: "Android", color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800" },
  ios: { label: "iOS", color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800" },
  cross_platform_mobile: { label: "Cross-platform Mobile", color: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800" },
  backend_api: { label: "Backend / API", color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800" },
  multi_platform: { label: "Multi-platform", color: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800" },
};

const TRACK_LABELS: Record<string, string> = {
  quick: "Quick Track",
  standard: "Standard Track",
  advanced: "Advanced Track",
};

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadProjects = async () => {
    try {
      const repo = getProjectRepository();
      const list = await repo.getProjects();
      setProjects(list);
    } catch (err) {
      console.error("Gagal memuat proyek:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    getProjectRepository()
      .getProjects()
      .then((list) => {
        if (!ignore) {
          setProjects(list);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Gagal memuat proyek:", err);
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const repo = getProjectRepository();
      await repo.deleteProject(deletingId);
      setDeletingId(null);
      await loadProjects();
    } catch (err) {
      alert("Gagal menghapus proyek: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleExport = async () => {
    try {
      const repo = getProjectRepository();
      const payload = await repo.exportAll();
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(payload, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute(
        "download",
        `forma-backup-${new Date().toISOString().slice(0, 10)}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setImportStatus({
        type: "success",
        message: "Data cadangan JSON berhasil diunduh.",
      });
    } catch (err) {
      setImportStatus({
        type: "error",
        message:
          "Gagal mengekspor data: " +
          (err instanceof Error ? err.message : String(err)),
      });
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const repo = getProjectRepository();
      const result = await repo.importAll(text);
      if (result.success) {
        setImportStatus({
          type: "success",
          message: `Berhasil mengimpor ${result.importedProjectsCount} proyek.`,
        });
        await loadProjects();
      } else {
        setImportStatus({
          type: "error",
          message: `Gagal mengimpor file: ${result.errors.join(", ")}`,
        });
      }
    } catch (err) {
      setImportStatus({
        type: "error",
        message:
          "File tidak dapat dibaca: " +
          (err instanceof Error ? err.message : String(err)),
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleLoadDemo = async () => {
    try {
      const repo = getProjectRepository();
      await repo.saveProject(KOSTCERDAS_PROJECT);
      await repo.saveAnswers(KOSTCERDAS_PROJECT.id, KOSTCERDAS_ANSWERS);
      await loadProjects();
      setImportStatus({
        type: "success",
        message: "Proyek demo KostCerdas berhasil dimuat!",
      });
    } catch (err) {
      alert("Gagal memuat demo: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <StorageNotice />

        {importStatus.type && (
          <div
            className={`p-4 rounded-xl text-sm flex items-center justify-between border ${
              importStatus.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300"
                : "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-300"
            }`}
          >
            <span>{importStatus.message}</span>
            <button
              onClick={() => setImportStatus({ type: null, message: "" })}
              className="text-xs font-semibold underline hover:opacity-80 ml-4 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Daftar Proyek
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Kelola ide aplikasi dan hasilkan rangkaian prompt berkualitas untuk AI coding agent.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-zinc-700 shadow-xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              📥 Impor JSON
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={projects.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-zinc-700 shadow-xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              📤 Ekspor JSON
            </button>
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-xs hover:bg-indigo-500 transition cursor-pointer"
            >
              + Buat Proyek Baru
            </Link>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="py-20 text-center text-sm text-zinc-500 animate-pulse">
            Memuat data proyek dari penyimpanan lokal...
          </div>
        ) : projects.length === 0 ? (
          /* Empty State */
          <div className="rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-8 sm:p-12 text-center bg-white/50 dark:bg-zinc-900/40">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-2xl text-indigo-600 dark:text-indigo-400">
              ✨
            </div>
            <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Belum ada proyek tersimpan
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
              Forma membantu solo developer mengubah ide mentah menjadi prompt terstruktur tanpa berhalusinasi. Mulai proyek pertama Anda sekarang.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/projects/new"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 transition cursor-pointer"
              >
                + Buat Proyek Pertama
              </Link>
              <button
                type="button"
                onClick={handleLoadDemo}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition cursor-pointer"
              >
                🚀 Muat Contoh KostCerdas (Demo P-00)
              </button>
            </div>
          </div>
        ) : (
          /* Projects Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-xs transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                    {project.name}
                  </h2>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 whitespace-nowrap">
                    {TRACK_LABELS[project.complexityTrack] || project.complexityTrack}
                  </span>
                </div>

                <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed flex-1">
                  {project.ideaSummary}
                </p>

                {/* Platform Badges */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.platforms.map((plat) => {
                    const badge = PLATFORM_BADGES[plat] || {
                      label: plat,
                      color: "bg-zinc-100 text-zinc-700 border-zinc-200",
                    };
                    return (
                      <span
                        key={plat}
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    );
                  })}
                </div>

                <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                    Diperbarui {new Date(project.updatedAt).toLocaleDateString("id-ID")}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDeletingId(project.id)}
                      className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 font-medium px-2 py-1 rounded transition cursor-pointer"
                      title="Hapus proyek"
                    >
                      Hapus
                    </button>
                    <Link
                      href={`/projects/${project.id}`}
                      className="inline-flex items-center rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900 transition"
                    >
                      Buka Studio →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <ConfirmModal
        isOpen={Boolean(deletingId)}
        title="Hapus Proyek Ini?"
        message="Proyek dan seluruh data jawaban P-00 serta riwayat prompt yang tersimpan secara lokal di browser ini akan dihapus permanen. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Ya, Hapus Proyek"
        cancelLabel="Batal"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}

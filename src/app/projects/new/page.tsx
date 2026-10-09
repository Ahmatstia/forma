"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import {
  ComplexityTrack,
  Platform,
  Project,
  getProjectRepository,
} from "@/modules/projects";

const AVAILABLE_PLATFORMS: { id: Platform; label: string; desc: string }[] = [
  { id: "web", label: "Web", desc: "Aplikasi browser desktop & responsif" },
  { id: "android", label: "Android", desc: "Aplikasi mobile native / Android platform" },
  { id: "ios", label: "iOS", desc: "Aplikasi mobile iPhone / iPad platform" },
  { id: "cross_platform_mobile", label: "Cross-platform Mobile", desc: "Flutter, React Native, dsb." },
  { id: "backend_api", label: "Backend / API", desc: "Server, REST/GraphQL API, arsitektur headless" },
];

const TRACK_OPTIONS: { id: ComplexityTrack; title: string; desc: string }[] = [
  {
    id: "quick",
    title: "Quick Track (Eksplorasi Cepat)",
    desc: "Untuk prototipe, MVP mini, atau validasi cepat ide sederhana.",
  },
  {
    id: "standard",
    title: "Standard Track (Rekomendasi)",
    desc: "Alur seimbang: problem discovery, brief, PRD, dan implementasi terarah.",
  },
  {
    id: "advanced",
    title: "Advanced Track (Mendalam)",
    desc: "Untuk aplikasi kompleks dengan arsitektur data, modul ganda, dan kepatuhan ketat.",
  },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [ideaSummary, setIdeaSummary] = useState("");
  const [platforms, setPlatforms] = useState<Platform[]>(["web"]);
  const [complexityTrack, setComplexityTrack] = useState<ComplexityTrack>("standard");
  const [constraintsSummary, setConstraintsSummary] = useState("");
  const [isUnknownConstraints, setIsUnknownConstraints] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const togglePlatform = (p: Platform) => {
    if (platforms.includes(p)) {
      if (platforms.length === 1) return; // minimal 1
      setPlatforms(platforms.filter((item) => item !== p));
    } else {
      setPlatforms([...platforms, p]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Nama proyek wajib diisi.");
      return;
    }
    if (!ideaSummary.trim()) {
      setErrorMessage("Deskripsi ide awal wajib diisi.");
      return;
    }
    if (platforms.length === 0) {
      setErrorMessage("Pilih minimal satu target platform.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const now = new Date().toISOString();
      const projectId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const newProject: Project = {
        id: projectId,
        name: name.trim(),
        ideaSummary: ideaSummary.trim(),
        platforms,
        complexityTrack,
        constraintsSummary: isUnknownConstraints
          ? undefined
          : constraintsSummary.trim() || "Dikembangkan oleh satu developer",
        createdAt: now,
        updatedAt: now,
      };

      const repo = getProjectRepository();
      await repo.saveProject(newProject);

      // Seed standard default answers from project form
      await repo.saveAnswers(projectId, [
        {
          id: `ans_${Date.now()}_1`,
          projectId,
          key: "project.name",
          value: newProject.name,
          valueType: "string",
          certainty: "confirmed",
          source: "user",
          updatedAt: now,
        },
        {
          id: `ans_${Date.now()}_2`,
          projectId,
          key: "project.ideaSummary",
          value: newProject.ideaSummary,
          valueType: "string",
          certainty: "confirmed",
          source: "user",
          updatedAt: now,
        },
      ]);

      router.push(`/projects/${projectId}`);
    } catch (err) {
      setErrorMessage(
        "Gagal menyimpan proyek: " +
          (err instanceof Error ? err.message : String(err))
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 space-y-6">
        <div>
          <Link
            href="/"
            className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 mb-2"
          >
            ← Kembali ke Daftar Proyek
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Buat Proyek Baru
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Tentukan fondasi ide Anda. Konteks ini akan menjadi amplop acuan bagi semua template prompt.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 text-sm">
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6"
        >
          {/* Nama Proyek */}
          <div className="space-y-1.5">
            <label
              htmlFor="projectName"
              className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
            >
              Nama Proyek <span className="text-rose-500">*</span>
            </label>
            <input
              id="projectName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: KostCerdas, FlowPulse, QuickBill"
              required
              className="w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-900 shadow-xs placeholder:text-zinc-400 focus:border-indigo-600 focus:outline-hidden focus:ring-1 focus:ring-indigo-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
            <p className="text-xs text-zinc-500">
              Nama sementara aplikasi atau produk yang sedang Anda rancang.
            </p>
          </div>

          {/* Deskripsi Ide Awal */}
          <div className="space-y-1.5">
            <label
              htmlFor="ideaSummary"
              className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
            >
              Deskripsi Ide Awal <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="ideaSummary"
              rows={3}
              value={ideaSummary}
              onChange={(e) => setIdeaSummary(e.target.value)}
              placeholder="Contoh: Aplikasi untuk membantu mahasiswa kos mengatur pengeluaran bulanan agar tidak kehabisan uang sebelum akhir bulan."
              required
              className="w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-900 shadow-xs placeholder:text-zinc-400 focus:border-indigo-600 focus:outline-hidden focus:ring-1 focus:ring-indigo-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
            <p className="text-xs text-zinc-500">
              Tuliskan dalam bahasa bebas. Ide awal boleh masih mentah dan belum tervalidasi.
            </p>
          </div>

          {/* Platform Target */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Target Platform Awal <span className="text-rose-500">*</span>
            </label>
            <p className="text-xs text-zinc-500">
              Pilih satu atau lebih platform. Compiler akan otomatis memasukkan aturan platform adapter yang sesuai.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {AVAILABLE_PLATFORMS.map((plat) => {
                const isSelected = platforms.includes(plat.id);
                return (
                  <button
                    key={plat.id}
                    type="button"
                    onClick={() => togglePlatform(plat.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition cursor-pointer ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 dark:border-indigo-500 ring-1 ring-indigo-600"
                        : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mt-1 h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <div>
                      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {plat.label}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {plat.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Jalur Kompleksitas */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Jalur Kompleksitas (Complexity Track)
            </label>
            <div className="space-y-2 pt-1">
              {TRACK_OPTIONS.map((track) => {
                const isSelected = complexityTrack === track.id;
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => setComplexityTrack(track.id)}
                    className={`flex items-start gap-3 w-full p-3 rounded-xl border text-left transition cursor-pointer ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 dark:border-indigo-500 ring-1 ring-indigo-600"
                        : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
                    }`}
                  >
                    <input
                      type="radio"
                      checked={isSelected}
                      onChange={() => {}}
                      name="complexityTrack"
                      className="mt-1 h-4 w-4 border-zinc-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <div>
                      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {track.title}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {track.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Batasan Awal Proyek */}
          <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <label
                htmlFor="constraints"
                className="text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              >
                Batasan Proyek Awal
              </label>
              <label className="flex items-center gap-2 text-xs text-zinc-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUnknownConstraints}
                  onChange={(e) => setIsUnknownConstraints(e.target.checked)}
                  className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600"
                />
                Tandai sebagai belum diketahui
              </label>
            </div>
            {!isUnknownConstraints ? (
              <input
                id="constraints"
                type="text"
                value={constraintsSummary}
                onChange={(e) => setConstraintsSummary(e.target.value)}
                placeholder="Contoh: Dikembangkan oleh satu developer; biaya operasi server mendekati nol"
                className="w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-900 shadow-xs placeholder:text-zinc-400 focus:border-indigo-600 focus:outline-hidden focus:ring-1 focus:ring-indigo-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            ) : (
              <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 text-xs text-zinc-500 italic">
                Batasan proyek ditandai belum diketahui. AI agent tidak akan berasumsi atau mengarang batasan.
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <Link
              href="/"
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan & Buka Prompt Studio →"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

import Link from "next/link";

export function Navbar() {
  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80 sticky top-0 z-40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg tracking-tight text-zinc-900 dark:text-zinc-100 hover:opacity-80 transition"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-mono text-sm shadow-sm">
              F
            </div>
            <span>Forma</span>
          </Link>
          <span className="hidden sm:inline-block text-xs font-medium px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
            MVP Core (R2)
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden md:inline">Penyimpanan Browser Lokal</span>
          </div>

          <Link
            href="/projects/new"
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs sm:text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition"
          >
            + Proyek Baru
          </Link>
        </div>
      </div>
    </header>
  );
}

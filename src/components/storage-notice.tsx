export function StorageNotice() {
  return (
    <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 p-4 dark:border-amber-900/40 dark:bg-amber-950/20 text-xs sm:text-sm text-amber-900 dark:text-amber-200 flex items-start gap-3">
      <span className="text-base select-none mt-0.5">ℹ️</span>
      <div className="flex-1 space-y-1">
        <p className="font-semibold text-amber-950 dark:text-amber-100">
          Data Tersimpan di Browser Perangkat Ini (Offline-First)
        </p>
        <p className="text-amber-800 dark:text-amber-300/90 leading-relaxed">
          Forma MVP berjalan tanpa database server demi privasi data Anda. Jika Anda
          membersihkan cache/riwayat browser atau berpindah perangkat, gunakan tombol{" "}
          <strong className="underline">Ekspor JSON</strong> untuk mengunduh cadangan, dan{" "}
          <strong className="underline">Impor JSON</strong> untuk memulihkannya kapan saja.
        </p>
      </div>
    </div>
  );
}

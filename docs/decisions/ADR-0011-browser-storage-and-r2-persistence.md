# ADR-0011: Browser Storage, Offline-First Persistence, dan Pengamanan Pagar Data Pengguna (R2)

- **Status:** APPROVED
- **Tanggal:** 2026-10-09
- **Fase:** R2 (MVP Vertical Slice)
- **Konteks:** Mengimplementasikan MVP Core yang memungkinkan solo developer membuat proyek, menjawab pertanyaan P-00, mengompilasi prompt, mengedit per-run, dan mencadangkan data tanpa database server atau API AI eksternal.

---

## 1. Konteks dan Masalah

Fase R2 membutuhkan penyimpanan persisten untuk `Project`, `ProjectAnswer`, dan `PromptGenerationRun` yang:
1. Tidak membutuhkan setup database server (SQLite/PostgreSQL/Prisma ditunda ke multi-user cloud).
2. Berfungsi sepenuhnya offline di browser pengguna dengan privasi maksimal.
3. Memiliki fallback dan mekanisme pemulihan data jika cache browser dibersihkan.
4. Mencegah potensi pembajakan blok prompt (`DATA PENGGUNA`) saat pengguna memasukkan karakter triple backticks (\`\`\`).
5. Memastikan jalur hashing kompatibel lintas-runtime (browser, Node, Web Worker).

---

## 2. Keputusan yang Ditetapkan

### 2.1 Interface `ProjectRepository` Berbasis `localStorage`
- Memisahkan kontrak repositori (`ProjectRepository`) dari implementasi konkret (`LocalStorageProjectRepository`).
- Menyediakan in-memory fallback saat berjalan di lingkungan SSR Next.js atau test suite tanpa DOM `window`.
- Validasi ketat pada setiap pembacaan dan penulisan menggunakan skema Zod (`ProjectSchema`, `ProjectAnswerSchema`, `PromptGenerationRunSchema`).
- Penanganan error kehabisan kuota penyimpanan browser (`QuotaExceededError`) dengan pesan yang memandu pengguna mengekspor data cadangan.

### 2.2 Format Cadangan Ekspor/Impor JSON Terversi (`v1.0`)
- Skema terstruktur `ExportPayloadSchema` berisi metadata versi (`1.0`), stempel waktu (`exportedAt`), daftar proyek, jawaban, dan riwayat run.
- File JSON divalidasi penuh sebelum diimpor ke penyimpanan; payload yang korup atau tidak sesuai skema ditolak dengan daftar error yang jelas.

### 2.3 Pengamanan Dinamis Pagar Data Pengguna (Dynamic Code Fence)
- Mencegah string pengguna yang mengandung \`\`\` (triple backticks) merusak blok markdown berlabel `DATA PENGGUNA`.
- Filter `fence_data` dan helper compiler menghitung jumlah backtick berurutan terpanjang dalam input ($M$). Pagar luar secara dinamis menggunakan panjang pagar $\max(3, M + 1)$ (misal \`\`\`\`text jika ada \`\`\` di dalam input).
- Berdasarkan spesifikasi CommonMark/GFM, pagar penutup yang lebih pendek dari pembuka tidak akan menutup blok kode, sehingga input pengguna tetap terisolasi sepenuhnya sebagai data pasif.

### 2.4 Hashing Lintas-Runtime Tanpa Ketergantungan `node:crypto`
- Mempertahankan algoritma kanonik 64-bit FNV-1a dengan `Math.imul` murni di `src/lib/hash.ts` yang berjalan identik dan instan di browser client, Node.js, dan worker tanpa polusi dependensi sistem.

---

## 3. Konsekuensi

- **Positif:**
  - Pengguna dapat langsung menggunakan aplikasi tanpa instalasi database server atau akun login.
  - Privasi data ide aplikasi terjamin 100% di browser pengguna.
  - Kompilasi prompt responsif real-time tanpa latensi jaringan.
  - Skema ekspor/impor melindungi data dari risiko pembersihan cache browser.
- **Batasan:**
  - Kapasitas penyimpanan `localStorage` terbatas pada kuota browser (umumnya ~5MB teks, mencukupi puluhan proyek).
  - Sinkronisasi lintas perangkat memerlukan proses Ekspor dan Impor manual melalui JSON.

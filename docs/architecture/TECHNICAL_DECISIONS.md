# Forma — Technical Decisions

**Tanggal update:** 9 Oktober 2026  
**Status dokumen:** Status keputusan resmi diperbarui sesuai arahan persetujuan Pemilik Produk (R0).  
**Terkait:** [INITIAL_AUDIT](../audits/INITIAL_AUDIT.md) · [IMPLEMENTATION_ROADMAP](IMPLEMENTATION_ROADMAP.md) · [REPOSITORY_STRUCTURE](REPOSITORY_STRUCTURE.md) · [P-00_CANONICAL_PROMPT](P-00_CANONICAL_PROMPT.md)

Label resmi:
* **APPROVED**: Keputusan produk & teknis yang telah secara eksplisit disetujui dan menjadi kontrak kerja.
* **RECOMMENDED**: Rekomendasi teknis yang menunggu validasi/spike atau fase implementasi relevan.
* **ASSUMPTION**: Asumsi operasional sementara yang tidak memblokir implementasi.
* **OPEN**: Pertanyaan yang belum terjawab.

---

## 1. Keputusan Produk yang Disetujui (APPROVED)

12 keputusan utama yang disahkan untuk memandu implementasi:

| ID | Keputusan yang Disetujui | Status | Dokumen Rujukan / ADR |
|---|---|---|---|
| **A-01** | **Pemisahan MVP-Core dari MVP-Full:** MVP-Core diprioritaskan terlebih dahulu untuk membuktikan alur nilai inti sebelum membangun fungsionalitas luas. | **APPROVED** | [ADR-0001](../decisions/ADR-0001-scope-mvp-core.md) |
| **A-02** | **Alur Inti MVP-Core:** Alur harus membuktikan membuat proyek → menjawab P-00 → menyusun konteks terstruktur → mengompilasi prompt → preview/edit per run → copy/download Markdown. | **APPROVED** | [ADR-0001](../decisions/ADR-0001-scope-mvp-core.md) |
| **A-03** | **Kemurnian dan Kemandirian Compiler:** Prompt compiler deterministik murni di TypeScript; tidak boleh bergantung pada AI API, React, Next.js, storage/database, browser API, filesystem, atau jaringan. | **APPROVED** | [ADR-0003](../decisions/ADR-0003-pure-compiler-boundary.md) |
| **A-04** | **Penyimpanan Browser untuk MVP-Core:** Menggunakan penyimpanan browser (localStorage/IndexedDB) di balik antarmuka `ProjectRepository`, dilengkapi fitur Export/Import JSON dan peringatan eksplisit bahwa data tersimpan di browser ini. | **APPROVED** | [ADR-0002](../decisions/ADR-0002-mvp-core-browser-storage.md) |
| **A-05** | **Penundaan Database Server, Multi-user, dan Autentikasi:** Database server terpusat, deployment multi-user, dan autentikasi ditunda hingga kebutuhan hosting dan deployment multi-user ditetapkan secara nyata. | **APPROVED** | [ADR-0002](../decisions/ADR-0002-mvp-core-browser-storage.md) |
| **A-06** | **Kosakata Kepastian (Certainty):** Mendukung 5 nilai: `confirmed`, `assumption`, `unknown`, `not_applicable`, serta `preference` (untuk membedakan preferensi awal dari keputusan final). | **APPROVED** | [ADR-0004](../decisions/ADR-0004-certainty-vocabulary-and-preferences.md) |
| **A-07** | **Bahasa Prompt:** Template bawaan MVP menggunakan Bahasa Indonesia dengan istilah teknis yang lazim dalam Bahasa Inggris. Kunci output contract (`IDEA_SUMMARY`, dll.) tetap dalam format kapital/snake case untuk stabilitas parsing. | **APPROVED** | [ADR-0005](../decisions/ADR-0005-prompt-language-indonesian.md) |
| **A-08** | **Immutabilitas Prompt Run:** Setiap hasil kompilasi prompt menyimpan snapshot konteks dan versi template secara immutable (append-only); perubahan konteks kemudian hari tidak mengubah run lama secara diam-diam. | **APPROVED** | [ADR-0006](../decisions/ADR-0006-run-immutability-and-snapshots.md) |
| **A-09** | **Persetujuan Hasil Agent (Approval Gate):** Hanya hasil AI coding agent eksternal yang telah di-review dan di-approve oleh pengguna yang boleh masuk menjadi konteks resmi prompt downstream. | **APPROVED** | [ADR-0007](../decisions/ADR-0007-approved-agent-results-only.md) |
| **A-10** | **Deteksi Secret dan Pemblokiran:** Deteksi secret wajib diuji. Jika terdeteksi indikasi secret, copy/export diblokir sampai ditangani pengguna secara eksplisit. Deteksi bersifat heuristik dan tidak menjamin 100% bebas secret. | **APPROVED** | [ADR-0008](../decisions/ADR-0008-secret-detection-policy.md) |
| **A-11** | **Evaluasi Template Engine (LiquidJS vs Minimal Renderer):** LiquidJS hanya boleh dipilih jika spike teknis membuktikan kontrol operasi allowlist dan keamanan sesuai kontrak compiler. Jika gagal, gunakan renderer minimal yang terbatas dan teruji. | **APPROVED** | [ADR-0009](../decisions/ADR-0009-template-engine-evaluation-liquidjs.md) |
| **A-12** | **AI Assistance Bersifat Opsional:** Fitur integrasi AI (interviewer adaptif, ekstraksi) bersifat opsional dan compiler tidak boleh memiliki ketergantungan pada API key atau provider AI eksternal. | **APPROVED** | [ADR-0010](../decisions/ADR-0010-ai-assistance-optional.md) |
| **A-13** | **Persistensi Browser & Pengamanan Pagar Data (R2):** Gunakan localStorage di balik interface ProjectRepository dengan Zod schema validation dan format cadangan ekspor/impor JSON v1.0. Terapkan pagar dinamis berpagar panjang ganda (dynamic code fence) untuk mencegah injeksi triple backticks. | **APPROVED** | [ADR-0011](../decisions/ADR-0011-browser-storage-and-r2-persistence.md) |
| **A-14** | **Prompt Chain Foundation & Offline-First Artifact Lifecycle (R3):** Rantai prompt P-00 → P-01 → P-02 terhubung deterministik di penyimpanan browser tanpa server DB/AI API. Hanya artefak berstatus `approved` yang masuk konteks downstream. Deteksi staleness dihitung on-the-fly tanpa memutasi snapshot historis. Siklus dependency ditolak. Ekspor/impor mendukung v1.0 dan v2.0. | **APPROVED** | ADR-0012-prompt-chain-foundation |
| **A-15** | **Prompt Pack Export & Platform-Gated Technical Architecture (R4):** Ekspor berkas paket ZIP menggunakan library `fflate` (zero-dependency, Node & browser safe). Paket berisi README instruksi, PROMPT_CHAIN_INDEX, manifest v1.0, PROJECT_CONTEXT, prompt terkompilasi, dan hanya artefak yang approved. Ekspor diblokir jika secret terdeteksi. Tahap P-03 (Tech Stack) memerlukan P-02 approved; P-04W dan P-04M dikondisikan dinamis sesuai platform target proyek. | **APPROVED** | ADR-0013-prompt-pack-and-architecture-chain |

---

## 2. Baseline Arsitektur Terverifikasi (R0)

| Komponen | Pilihan Terverifikasi | Bukti Verifikasi |
|---|---|---|
| **Runtime & Package Manager** | Node.js `v22.23.0`, npm `10.9.8` | Perintah lokal terverifikasi |
| **Framework Web** | Next.js `16.4.0` (App Router, Turbopack) | `npm run build` sukses di R0 |
| **UI Styling** | Tailwind CSS `v4` | Terpasang via official scaffold |
| **Bahasa & Typing** | TypeScript `v5.9.3` | `npm run typecheck` sukses di R0 |
| **Testing** | Vitest `v5.0.3` (environment `node`) | `npm run test` (12 tests) sukses di R0 |
| **Validasi Schema** | Zod `v4.6.5` | Smoke test terverifikasi di R0 |
| **Lint & Boundary Rules** | ESLint `v9.39.5` (flat config) | 10 negative tests membuktikan boundary di R0 |

---

## 3. Rekomendasi Teknis yang Menunggu Spike (RECOMMENDED)

1. **R1 Template Engine Spike:** Membuktikan LiquidJS dapat dibatasi dari mengeksekusi tag yang tidak diizinkan atau mengakses runtime. Jika tidak memungkinkan secara aman, bangun `MiniTemplateRenderer` (AST parser sederhana).
2. **Namespace Penamaan:** `answers.*` untuk nilai masukan pengguna dan `derived.*` untuk nilai komputasi/resolusi konteks.
3. **Format Golden P-00:** Draft kontrak 7 lapisan di [P-00_CANONICAL_PROMPT.md](P-00_CANONICAL_PROMPT.md) menunggu review akhir sebelum dikunci menjadi fixture otomatis.

---

## 4. Asumsi Operasional (ASSUMPTION)

* **AS-01:** Target pengguna MVP-Core adalah single-user di satu browser desktop/laptop modern (Chrome, Edge, Firefox, Safari).
* **AS-02:** Penyimpanan browser localStorage mencukupi untuk puluhan proyek awal teks ringkas; Export/Import JSON menjadi mekanisme cadangan pemulihan data.

---

## 5. Pertanyaan Terbuka (OPEN)

1. Kapan dan ke platform cloud mana deployment multi-user akan diarahkan (Vercel, Cloud Run, VPS)? *(Menentukan pilihan DB server dan auth di fase R3)*.
2. Review akhir atas teks draf golden output P-00 di `P-00_CANONICAL_PROMPT.md`.

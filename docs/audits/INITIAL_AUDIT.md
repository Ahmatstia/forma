# Forma — Initial Audit (Phase 0)

**Tanggal audit:** 9 Oktober 2026
**Lingkup:** repository + 6 dokumen sumber (`00`–`04`, `README.md`) + `05_FIRST_RUN_PROMPT.md`
**Status:** Selesai. Tidak ada kode, dependency, atau migrasi yang dibuat.

Label yang dipakai di seluruh dokumen audit/arsitektur:

| Label | Arti |
|---|---|
| **FACT** | Diperiksa langsung (file, perintah, atau dokumentasi resmi) pada sesi audit ini |
| **APPROVED** | Keputusan yang tertulis di dokumen sumber sebagai keputusan produk |
| **RECOMMENDATION** | Usulan auditor; belum disetujui |
| **ASSUMPTION** | Dugaan sementara yang tidak memblokir; belum disetujui |
| **OPEN** | Pertanyaan yang belum terjawab |

---

## 1. Keadaan repository

| Pemeriksaan | Hasil | Label |
|---|---|---|
| Isi root | 7 file Markdown saja: `00`–`05` dan `README.md` (dicek dengan `Get-ChildItem -Force`, termasuk file tersembunyi) | FACT |
| Source code | Tidak ada. Tidak ada `package.json`, lockfile, `src/`, `app/`, config build/test/lint | FACT |
| Git | **Bukan git repository** (`fatal: not a git repository`). Tidak ada `.git`, `.gitignore` | FACT |
| Instruksi agent lokal | Tidak ada `AGENTS.md`, `.agents/`, `.cursorrules`, `.gemini/` di workspace | FACT |
| Instruksi agent global | `C:\Users\ACER\.gemini\config` **tidak dapat dibaca** (diblokir sistem). Isinya tidak diketahui | FACT (keterbatasan audit) |
| Environment lokal | Node.js `v22.23.0`, npm `10.9.8` | FACT |
| Docs folder | Belum ada sebelum audit ini. `docs/audits/` dan `docs/architecture/` dibuat oleh audit ini | FACT |

**Kesimpulan:** repository **greenfield** (hanya spesifikasi). Tidak ada proyek yang harus dipetakan, di-rewrite, atau dijaga kompatibilitasnya.

### Baseline checks

| Check | Status | Alasan |
|---|---|---|
| Install dependency | not applicable | Belum ada `package.json`; juga dilarang pada fase ini |
| Lint | not applicable | Belum ada config/source |
| Type check | not applicable | Belum ada `tsconfig` |
| Unit / integration / E2E tests | not applicable | Belum ada test |
| Production build | not applicable | Belum ada aplikasi |
| Database migration | not applicable | Belum ada DB; dilarang pada fase ini |
| Secret scan | **belum dijalankan** | Tidak ada tool terpasang; dilakukan manual: dokumen berisi nol credential (pencarian visual saat membaca) |
| Peta fitur vs blueprint | 0% terimplementasi | Tidak ada kode |

Tidak ada klaim test/build berhasil karena memang tidak ada yang dijalankan.

### Pemetaan area yang diminta (semua kosong)

Struktur folder, package scripts, dependency, routing, design system, persistence/database, auth, tests, environment, deployment: **tidak ada**. Semua ditentukan dari nol di dokumen arsitektur.

---

## 2. Verifikasi teknologi terhadap sumber terkini

Sumber: `npm view` ke registry npm (hari audit) dan dokumentasi resmi. `npm view` hanya membaca metadata; tidak ada yang terpasang.

### Fakta terverifikasi

| Item | Hasil | Sumber |
|---|---|---|
| Next.js | `16.4.0` (dist-tag latest), `engines.node >=20.9.0` | npm registry |
| Next.js minimum Node | 20.9; browser minimum antara lain Chrome 111+ | docs resmi `nextjs.org/docs/app/getting-started/installation` |
| `create-next-app` default | TypeScript, Tailwind CSS, ESLint, App Router, Turbopack, alias `@/*`, dan **menyertakan `AGENTS.md`** untuk agent. Opsi non-interaktif: `--yes` | docs resmi yang sama |
| Dev server | `next dev` memakai Turbopack sebagai bundler default | docs resmi yang sama |
| React | `19.3.0` | npm registry |
| TypeScript | `7.0.2` (latest) | npm registry |
| Tailwind CSS | `4.3.3` | npm registry |
| LiquidJS | `10.30.0`, `engines.node >=16` | npm registry |
| LiquidJS opsi keamanan | `strictVariables`, `strictFilters`, `ownPropertyOnly` (default `true`), `outputEscape` ada di dokumentasi opsi | `liquidjs.com/tutorials/options.html` |
| Zod | `4.6.5` | npm registry |
| Vitest | `5.0.3`, `engines.node ^22.12.0 \|\| ^24.0.0 \|\| >=26.0.0` — **Node 22.23.0 lokal memenuhi** | npm registry |
| Playwright Test | `1.64.0`, `engines.node >=20` | npm registry |
| ESLint | `10.12.0` | npm registry |
| Prisma | dist-tag latest = **`8.0.0-rc.22`** (release candidate), `engines.node >=22.18.0` | npm registry |
| Drizzle ORM | `0.45.4` (belum 1.0) | npm registry |
| better-sqlite3 | `13.0.3`, `engines.node >=22` | npm registry |
| fflate / jszip | `0.8.3` / `3.10.2` | npm registry |
| Auth libs | `better-auth 1.7.7`, `@auth/core 0.41.3` | npm registry (hanya keberadaan; tidak dievaluasi mendalam) |
| Template engine alternatif | `handlebars 4.7.10` (aktif), `mustache 4.2.0` (terakhir 2024), `nunjucks 3.2.4` (terakhir 2023) | npm registry |

### Belum terverifikasi (jangan dianggap fakta)

- Kompatibilitas Next.js 16.4 dengan **TypeScript 7.0.2** dan `typescript-eslint`. Versi TypeScript 7 sangat baru; belum diperiksa. → Biarkan `create-next-app` memilih versi, lalu jalankan typecheck/build sebagai bukti.
- Apakah LiquidJS dapat **dibatasi ke allowlist tag** (blueprint §5A.5 mewajibkan "allowlist operasi"). Opsi `ownPropertyOnly` dan `strictFilters` terverifikasi; **pembatasan tag belum**. → Spike di Slice R1.
- Perilaku "Cache Components" yang muncul di prompt `create-next-app` (disebut di docs sebagai bagian "recommended defaults"). Dampaknya pada aplikasi ini belum dianalisis.
- Maintenance/security advisory tiap package. Tidak diperiksa (`npm audit` butuh project).
- Seluruh tautan referensi di `02_RESEARCH_AND_STANDARDS.md` (Atlassian, OWASP, NIST, dll.): **tidak dibuka satu per satu**. Hanya dokumen Next.js dan LiquidJS yang dibuka.
- Harga/kuota hosting, provider AI: tidak diperiksa (bukan bagian MVP inti).

---

## 3. Kecukupan blueprint untuk membangun MVP

**Penilaian:** visi, prinsip, dan kontrak compiler **cukup spesifik**. Spesifikasi MVP **terlalu luas** dan beberapa kontraknya saling bertentangan. Detail ada di §4.

Yang sudah baik:
- Kontrak compiler (katalog §4–§5, §10) jelas, testable, dan punya 10 fixture wajib.
- Aturan "unknown tidak dikarang", "approved only", "snapshot immutable", "tanpa API key" konsisten di semua dokumen.
- Seed template P-00…P-12 dan contoh rantai `KostCerdas` memberi bahan uji konkret.

Yang kurang:
- Tidak ada **keputusan deployment/persistence** → menghambat Phase 2.
- Tidak ada **definisi minimum entity** untuk MVP (25+ entitas kandidat di blueprint §13).
- Tidak ada **bahasa prompt** yang diputuskan (campuran Indonesia/Inggris).
- Banyak acceptance criteria tanpa ukuran (lihat §5).

---

## 4. Konflik, kekurangan, dan spesifikasi tidak realistis

Setiap temuan: **dampak → opsi → rekomendasi**. Semua rekomendasi belum disetujui kecuali disebut lain. ID `C-xx` dipakai di dokumen lain.

### Konflik antar dokumen

**C-01 — Urutan fase bertentangan (blueprint §18 vs master prompt).**
Blueprint: Fase 4 = artifact/requirements/traceability, Fase 5 = prompt chain. Master prompt: Fase 4 = prompt chain, Fase 5 = artifacts. Selain itu, keduanya menaruh **UI shell (Fase 1) dan persistence (Fase 2) sebelum compiler (Fase 3)**, padahal kedua dokumen juga menegaskan compiler adalah "vertical slice produk pertama".
- Dampak: tanpa keputusan, agent bisa menghabiskan dua fase membangun dashboard/CRUD sebelum nilai inti terbukti — persis yang dilarang.
- Rekomendasi: compiler lebih dulu sebagai pustaka murni (R1), lalu UI minimal (R2). Chain sebelum artifact (urutan master prompt). Lihat roadmap.

**C-02 — Kriteria MVP blueprint §16 (20 butir) jauh lebih lebar dari "MVP utama" di brief ini.**
Butir 4, 5, 6, 14 (editor artefak, gate/blocker workflow, versi & restore artefak), 9–13 (chain, agent result, zip pack), 15 (IDOR) mencakup 5+ fase. Brief ini mendefinisikan MVP utama = proyek → jawab → konteks → compile → preview/edit → copy/download.
- Opsi A: seluruh 20 butir = satu MVP (berbulan-bulan untuk solo dev; risiko scope creep tinggi).
- Opsi B: pisah **MVP-Core** (flow di brief) dan **MVP-Full** (20 butir).
- Rekomendasi: **B**. Butir 4, 5, 6, 14 diturunkan ke "setelah MVP-Core", karena tidak dibutuhkan untuk menghasilkan prompt.

**C-03 — Kosakata `certainty` berbeda antara katalog dan contoh.**
Katalog §3: `confirmed | assumption | unknown | not_applicable`. Contoh `04` memakai `certainty: preference` (Flutter) dan "Confirmed preference".
- Dampak: compiler akan menolak nilai `preference` atau menulis Flutter sebagai fakta final.
- Opsi: (a) tambah nilai `preference`; (b) petakan preference → `assumption` + tag sumber; (c) pisahkan dimensi `kind`.
- Rekomendasi: **(a)**, karena contoh chain mensyaratkan prompt "Flutter adalah preferensi awal, belum keputusan final". Perlu persetujuan karena mengubah kontrak katalog.

**C-04 — Template P-00 di katalog ≠ prompt final di contoh.**
Katalog P-00 hanya punya bagian Role/Objective/Initial idea/Known input/Work steps/Output contract. Contoh `04` menampilkan prompt dengan "Project Context", "Known facts, assumptions, and open questions", dan urutan output berbeda (`CURRENT_ALTERNATIVES_TO_INVESTIGATE` vs `ALTERNATIVES_AND_WORKAROUNDS`, `LOW_COST_VALIDATION_PLAN` vs `VALIDATION_PLAN`). Global contract dan Context Envelope (katalog §5–§6) juga tidak ada di body template.
- Dampak: tidak ada "golden output" yang tunggal untuk dites.
- Rekomendasi: jadikan katalog sebagai sumber kebenaran template; revisi `04` menjadi **ilustratif**; golden fixture dibuat dari katalog + envelope + contract, lalu diberi persetujuan sekali. (Tidak memodifikasi dokumen sumber pada fase ini.)

**C-05 — "Semua variable harus dideklarasikan di schema" vs variable turunan.**
Katalog §4.2 mewajibkan itu, tetapi seed template memakai variable turunan yang tidak merupakan jawaban pengguna: `context.confirmedFacts`, `context.artifact.P00.approvedContent`, `context.currentSliceSources`, dst. Nama path `context.artifact.P00` juga mengikat ke ID tahap, bukan ke ID template (`P-00-IDEA`).
- Rekomendasi: dua namespace yang jelas: `answers` (disimpan pengguna, bertipe, ber-certainty) dan `derived` (dihitung resolver, read-only). Template mendeklarasikan keduanya. Penamaan `context.artifact.*` diseragamkan saat implementasi (perlu konfirmasi).

**C-06 — Sintaks template campuran/belum final.**
Katalog §4 menyerahkan pemilihan engine ke ADR tetapi seed memakai Liquid-style (`{% if %}`, filter `or_default: "..."`). Filter kustom wajib: `or_unknown`, `format_list_or_unknown`, `format_list_or_none`, `or_default`. Beberapa template menyisipkan array mentah (`{{ project.platforms }}`) tanpa filter format.
- Rekomendasi: LiquidJS diuji lewat spike (verifikasi allowlist tag); fallback = renderer minimal buatan sendiri yang hanya mendukung `{{ }}`, `if/else`, `for`, dan 4 filter itu. Lihat keputusan D-04.

**C-07 — Granularitas approval hasil agent.**
Contoh `04` §3: pengguna dapat "menyetujui bagian tertentu". Blueprint/katalog: status `AgentResult` per hasil.
- Rekomendasi: MVP = approve **per hasil**, setelah pengguna mengedit teksnya (isi yang disetujui = salinan hasil edit). Approval per bagian ditunda.

**C-08 — Struktur folder blueprint §11 vs §12 ambigu.**
Domain `prompt-compiler` muncul di `src/lib/prompt-compiler/`; `template-registry`, `prompt-chain`, `prompt-studio` di `src/features/`; ada juga `src/domain/` dan `src/server/`. Tidak jelas di mana logika murni vs UI.
- Rekomendasi: lihat `REPOSITORY_STRUCTURE.md` (satu tempat per modul + aturan dependensi yang dicek ESLint).

**C-09 — Lokasi dokumen vs instruksi.**
README langkah 2 dan master prompt "Required working documents" mengharapkan `docs/product/00_PRODUCT_BLUEPRINT.md`, `docs/prompts/PROMPT_TEMPLATE_CATALOG.md` (tanpa awalan angka), sedangkan dokumen sekarang di root dengan awalan angka dan saling merujuk dengan nama root.
- Rekomendasi: **tidak memindahkan apa pun sekarang** (sesuai brief). Pemindahan menjadi tugas housekeeping terpisah (R0) yang memperbarui semua tautan, hanya jika disetujui.

**C-10 — Redaksi vs blokir secret.**
Blueprint §9.9 menyebut "tidak ada credential di prompt" (blokir); master prompt/katalog menyebut "secret redaction". Dua perilaku berbeda.
- Rekomendasi: deteksi → status `blocked` + tawaran redaksi eksplisit oleh pengguna. Dokumentasikan bahwa deteksi heuristik **tidak menjamin** bebas secret.

### Kekurangan / keputusan yang belum dibuat

**G-01 — Persistence & deployment belum ditentukan** (blueprint §21 #7). Memblokir Phase 2, bukan Slice pertama. Lihat D-02/D-03.
**G-02 — Bahasa prompt.** Template bercampur (heading Inggris, isi Indonesia, P-10 sepenuhnya Inggris). Blueprint: produk awal Bahasa Indonesia, "siap dilokalkan". Perlu keputusan sebelum menulis seed template (D-06).
**G-03 — Minimum entity.** 25+ entitas kandidat; MVP-Core hanya perlu 6 (lihat TECHNICAL_DECISIONS §3).
**G-04 — Batas "konteks terlalu besar"** (validasi compiler §5A.1 langkah 6) tanpa angka. Jangan mengarang threshold; jadikan konfigurasi, default ditentukan saat ada data nyata.
**G-05 — Penentuan stale.** Katalog menyimpan `stale` sebagai status run; stale sebenarnya turunan dari perbandingan hash konteks/versi upstream. Perlu aturan: `stale` dihitung, bukan ditulis ulang pada run immutable (D-09).
**G-06 — Siapa yang menjadi "owner"** jika tanpa auth (butir 15 blueprint tentang IDOR). Lihat R-05.
**G-07 — Pertanyaan per template.** Katalog memberi daftar *input fields* tetapi bukan teks pertanyaan, contoh, alasan "kenapa ditanya", atau tipe/validasi tiap field. UI Prompt Studio (§9 katalog) membutuhkan itu. Harus ditulis sebagai bagian slice R1/R2, bukan diasumsikan.
**G-08 — Conflict detection tidak didefinisikan.** "Konflik antar sumber setara" butuh aturan konkret (misal dua jawaban `approved` berbeda untuk key yang sama). MVP-Core cukup: konflik antar jawaban key sama / keputusan approved vs jawaban; sisanya ditunda.

### Bagian terlalu luas / scope creep

- Modul 9.1–9.8 (dashboard, gates, artifact workspace, traceability, risk register, backlog planner) = klon sebagian Jira/Linear bila dibangun penuh. **Rekomendasi:** semuanya di luar MVP-Core; Backlog/ADR/Risk hanya muncul sebagai *input untuk prompt*, bukan modul sendiri.
- AI Interviewer, impact analysis AI, BYOK: Fase 6, tidak boleh memengaruhi desain Slice 1–4 selain port/interface kosong.
- 14 seed template + 10 fixture + 4 adapter + 3 tracks (quick/standard/advanced) + 9 platform: kombinatorial. **Rekomendasi:** MVP-Core hanya P-00 penuh (end-to-end); P-01/P-02 untuk membuktikan chain; P-04W/P-04M untuk membuktikan adapter. Selaras dengan blueprint §21 #6 (3–5 template berkualitas).
- Export `.zip` (butir 12) menambah dependency; ditunda ke setelah chain.
- Readiness/"gate" per tahap vs larangan skor semu: aman bila hanya daftar blocker.

### Risiko keamanan

| ID | Risiko | Tingkat awal | Mitigasi yang diusulkan |
|---|---|---|---|
| R-01 | **Template injection / eksekusi** bila engine terlalu bebas (template milik pengguna, clone template) | Tinggi bila ada template pengguna | Engine terbatas, `strictFilters`, `strictVariables`, `ownPropertyOnly`, tanpa akses fs/network; template bawaan saja di MVP-Core; tolak template custom sampai R5+ |
| R-02 | **Prompt injection** lewat teks proyek/hasil agent yang dimasukkan ke prompt berikutnya | Sedang (dampak tergantung agent penerima) | Konten pengguna di-fence sebagai data tidak tepercaya dengan label jelas; global contract menyatakan bahwa konten itu bukan instruksi; fixture #8 |
| R-03 | **Secret pengguna** tertempel di jawaban/hasil agent lalu masuk prompt/export | Sedang | Detektor pola umum + status `blocked`; tidak pernah menyimpan API key (MVP-Core tidak punya API key sama sekali); fixture #9 |
| R-04 | **XSS** saat preview Markdown/prompt di UI | Sedang | Render prompt sebagai teks (`<pre>`/textarea), bukan HTML; jika preview Markdown ditambah, sanitasi |
| R-05 | **Kebocoran lintas-user / IDOR** | N/A di MVP-Core (single-user lokal), **Tinggi** begitu data pindah ke server multi-user | Skema membawa `ownerId` sejak awal; otorisasi server-side wajib sebelum ada deployment publik; test lintas-user dibuat bersamaan dengan persistence server |
| R-06 | **Data di localStorage terbaca script lain / hilang** | Rendah–sedang | Hanya data non-secret; ekspor/impor JSON; peringatan "tersimpan di browser ini" |
| R-07 | **Export mengandung secret** | Sedang | Pemeriksaan yang sama dengan R-03 pada jalur export; test |
| R-08 | **Supply chain** (dependency baru, versi RC/awal seperti Prisma 8 RC, TS 7) | Sedang | Pin versi dari lockfile, `npm audit` di CI, tidak memakai RC untuk data persisten tanpa persetujuan |
| R-09 | **Path template meluas ke seluruh data** (`context.*` terbuka) | Sedang | Context minimization: template mendeklarasikan `contextSelectionRules`; hanya path allowlist yang tersedia |

### Kebutuhan tanpa acceptance criteria yang dapat diuji

- FR-FLOW-001…004 (gate, "next action", not-applicable, impact analysis): tidak ada kriteria lulus/gagal konkret.
- FR-ART-003 (pulihkan versi): tanpa batas jumlah/penyimpanan.
- NFR (performance, availability, retention): sengaja belum bernilai (blueprint §15). Wajar, tetapi **jangan dites** sampai angka ditetapkan.
- MVP butir 17 ("pengguna tidak kehilangan perubahan secara diam-diam") dan 18 (desktop/mobile browser): tidak ada matriks browser/viewport. Usulan minimum: Chrome/Edge/Firefox/Safari versi stabil terbaru + viewport 360 px dan 1280 px (**ASSUMPTION**, belum disetujui).
- FR-PROMPT-009 "risiko secrets": tidak ada daftar pola; didefinisikan di R1.

---

## 5. Hal yang sudah ditetapkan oleh dokumen (APPROVED)

Diambil dari blueprint §4 dan master prompt; tidak diubah oleh audit ini:

1. Web app responsif, satu aplikasi.
2. Satu core workflow + platform track/adapter.
3. Prompt Compiler deterministik adalah mesin inti; **tanpa API AI key**.
4. Prompt (bukan dokumen) adalah keluaran utama; Markdown portabel.
5. Modular monolith; tanpa microservices.
6. Hanya hasil agent berstatus `approved` menjadi konteks resmi.
7. Prompt run immutable dengan versi template + snapshot konteks.
8. Tidak ada `eval`/arbitrary JS di template.

Hal lain di blueprint (stack, PostgreSQL, shadcn/ui, Zod, Vitest, Playwright) ditandai **"baseline yang perlu divalidasi"** oleh blueprint sendiri — jadi **bukan keputusan final**.

---

## 6. Keterbatasan audit ini

- Tidak membaca instruksi global agent (akses diblokir).
- Tidak membuka semua tautan referensi riset.
- Tidak menjalankan `npm audit`, lint, atau build (tidak ada proyek).
- Perilaku LiquidJS (allowlist tag) dan kompatibilitas TypeScript 7 + Next 16.4 belum dibuktikan.
- Angka versi adalah snapshot 9 Oktober 2026 dan harus dicek ulang saat scaffolding.

## 7. Dokumen turunan

- [`../architecture/TECHNICAL_DECISIONS.md`](../architecture/TECHNICAL_DECISIONS.md)
- [`../architecture/IMPLEMENTATION_ROADMAP.md`](../architecture/IMPLEMENTATION_ROADMAP.md)
- [`../architecture/REPOSITORY_STRUCTURE.md`](../architecture/REPOSITORY_STRUCTURE.md)

# Forma

Forma adalah **aplikasi web pembuat dan pengelola rangkaian prompt profesional untuk AI coding agent**. Pengguna menjawab pertanyaan terstruktur mengenai ide, batasan, platform, dan keputusan proyek; sebuah prompt compiler deterministik kemudian mengompilasi jawaban tersebut menjadi instruksi operasional yang lengkap, kontekstual, dan saling terhubung antar-tahap.

Forma dirancang untuk **solo developer** agar tidak kehilangan konteks saat bekerja dengan AI coding agent (seperti Codex, Claude, Cursor, Antigravity).

---

## Sumber Kebenaran & Dokumentasi

Dokumen perancangan dan arsitektur tersusun sebagai berikut:

1. **Spesifikasi Produk:**
   * [`00_PRODUCT_BLUEPRINT.md`](00_PRODUCT_BLUEPRINT.md) — Visi, model produk prompt-first, workflow, domain, dan acceptance criteria.
   * [`01_AI_AGENT_MASTER_PROMPT.md`](01_AI_AGENT_MASTER_PROMPT.md) — Aturan kerja tim lintas fungsi untuk coding agent.
   * [`02_RESEARCH_AND_STANDARDS.md`](02_RESEARCH_AND_STANDARDS.md) — Acuan standar rekayasa, keamanan (OWASP/NIST), dan arsitektur (C4).
   * [`03_PROMPT_TEMPLATE_CATALOG.md`](03_PROMPT_TEMPLATE_CATALOG.md) — Kontrak compiler, skema variabel, katalog seed template P-00 s.d. P-12, dan fixture pengujian.
   * [`04_EXAMPLE_PROMPT_CHAIN.md`](04_EXAMPLE_PROMPT_CHAIN.md) — Contoh konkret ilustratif alur data rantai prompt (KostCerdas).
2. **Audit & Arsitektur:**
   * [`docs/audits/INITIAL_AUDIT.md`](docs/audits/INITIAL_AUDIT.md) — Audit baseline repository dan inventarisasi gap/konflik.
   * [`docs/architecture/IMPLEMENTATION_ROADMAP.md`](docs/architecture/IMPLEMENTATION_ROADMAP.md) — Roadmap tahapan implementasi vertikal (R0 s.d. R8).
   * [`docs/architecture/TECHNICAL_DECISIONS.md`](docs/architecture/TECHNICAL_DECISIONS.md) — Catatan keputusan teknis terverifikasi dan status persetujuannya.
   * [`docs/architecture/REPOSITORY_STRUCTURE.md`](docs/architecture/REPOSITORY_STRUCTURE.md) — Struktur folder modular dan aturan batas ketergantungan.
   * [`docs/architecture/P-00_CANONICAL_PROMPT.md`](docs/architecture/P-00_CANONICAL_PROMPT.md) — Draf kontrak kanonis 7 lapisan dan target golden output untuk template P-00.
   * [`docs/decisions/`](docs/decisions/) — Rekaman Keputusan Arsitektur resmi (ADR-0001 s.d. ADR-0010).

---

## Persyaratan Lingkungan (Prerequisites)

* **Node.js**: `>= 22.12.0` (terverifikasi lokal dengan `v22.23.0`).
* **npm**: `>= 10.9.0` (terverifikasi lokal dengan `10.9.8`).
* Tidak memerlukan API key atau konfigurasi database server untuk menjalankan MVP-Core.

---

## Instalasi & Menjalankan Aplikasi

1. **Clone repository & pasang dependensi:**
   ```bash
   npm install
   ```

2. **Jalankan server pengembangan lokal:**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

---

## Perintah Verifikasi Kualitas

Semua perintah berikut wajib dijalankan dan diverifikasi nyata:

```bash
# Menjalankan linter dengan aturan batas dependensi modul
npm run lint

# Menjalankan pemeriksaan tipe statis TypeScript
npm run typecheck

# Menjalankan unit & integration tests menggunakan Vitest
npm run test

# Menjalankan pengujian berulang (watch mode)
npm run test:watch

# Membangun bundle produksi Next.js
npm run build

# Menjalankan keempat pemeriksaan kualitas sekaligus (Gate DoD)
npm run verify
```

---

## Struktur Kode & Batas Modul (Modular Monolith)

Logika inti Forma berada di dalam `src/modules/` yang terisolasi dari antarmuka presentasi:

```text
src/
├── app/                       # Rute, layout, dan halaman (Next.js App Router)
├── components/
│   ├── ui/                    # Komponen primitif antarmuka
│   └── shared/                # Komponen bersama lintas tampilan
├── modules/
│   ├── prompt-compiler/       # ★ Mesin kompilasi deterministik (Pure TypeScript)
│   ├── templates/             # Katalog & registri versi template
│   ├── projects/              # Domain proyek dan jawaban terstruktur
│   └── runs/                  # Riwayat run immutable dan snapshot konteks
├── infrastructure/            # Implementasi persistensi (localStorage/IndexedDB)
└── lib/                       # Utilitas kecil bebas efek samping
```

### Aturan Batas Dependensi (Enforced via ESLint)
* Modul `prompt-compiler` dan `templates` **dilarang keras** mengimpor `react`, `next`, modul filesystem `node:fs`, `http`, maupun API browser (`window`, `localStorage`, `fetch`).
* Modul domain dilarang mengimpor komponen UI (`app/` atau `components/`).
* Penggunaan `eval`, `new Function`, dan manipulasi kode dinamis dilarang keras di seluruh codebase.
* Kepatuhan aturan ini diuji secara negatif lewat [`src/lib/eslint-boundaries.test.ts`](src/lib/eslint-boundaries.test.ts).

---

## Status Proyek

* **Fase Saat Ini:** **Fase R0 Selesai (Fondasi Toolchain & Repo)**.
* **Fase Berikutnya:** **Fase R1 (Pure Prompt Compiler & 10 Fixture Katalog)**.
* **Fitur MVP-Core (R2):** Alur penuh input jawaban P-00 → kompilasi prompt → preview/edit → copy/download `.md`.

# Forma — Prompt-First Starter Pack

Paket ini adalah spesifikasi produk untuk membangun **web app pembuat dan pengelola prompt profesional bagi AI coding agent**. Jawaban pengguna menjadi context terstruktur yang dikompilasi ke template prompt. Prompt dari setiap tahap tersambung melalui project context dan hasil agent yang di-review serta di-approve.

## Source documents

- `00_PRODUCT_BLUEPRINT.md` — source of truth untuk visi, scope, workflow, prompt-first product model, kebutuhan, domain, arsitektur awal, dan roadmap.
- `01_AI_AGENT_MASTER_PROMPT.md` — instruksi untuk coding agent yang membangun aplikasi dengan pendekatan audit, vertical slice, security, dan tests.
- `02_RESEARCH_AND_STANDARDS.md` — ringkasan riset dan tautan sumber resmi untuk product discovery, engineering, security, platform, dan prompt engineering.
- `03_PROMPT_TEMPLATE_CATALOG.md` — kontrak template registry/compiler, variable schema, global prompt contract, seed template P-00 sampai P-12, platform adapters, dan Definition of Done.
- `04_EXAMPLE_PROMPT_CHAIN.md` — contoh langkah konkret dari jawaban form ke prompt final dan bagaimana hasil tahap sebelumnya mengisi prompt tahap berikutnya.

## Cara menggunakan

1. Buat repository baru untuk aplikasinya atau siapkan repository yang sudah ada.
2. Salin lima dokumen selain README ini ke folder dokumentasi yang jelas, misalnya `docs/product/` dan `docs/prompts/`.
3. Buka repository dengan Codex, Cursor, Antigravity, atau agent coding lain.
4. Berikan `01_AI_AGENT_MASTER_PROMPT.md` sebagai instruksi utama.
5. Minta agent memulai **Phase 0 — audit dan implementation plan**, bukan langsung membangun semua modul.
6. Minta implementasi slice pertama: isi jawaban → compile prompt → preview → copy/download `.md`. Slice ini harus bekerja tanpa API AI.
7. Uji prompt untuk minimal: web-only, Android/mobile, jawaban unknown, required answer yang kosong, conflict, dan data sensitif.
8. Setelah compiler inti terbukti, lanjutkan prompt chain, capture hasil eksternal, review/approval, stale context detection, template versioning, dan baru kemudian AI assistance opsional.

## Prinsip yang tidak boleh hilang

- Jawaban pengguna harus mengubah prompt output, bukan sekadar disimpan dalam form.
- Prompt output adalah produk inti; checklist dan dokumen menjadi pendukungnya.
- Satu shared core dengan platform-specific adapters.
- Prompt compile/copy/export tidak boleh bergantung pada API AI key.
- Hasil agent eksternal tidak menjadi konteks resmi sampai pengguna menyetujuinya.
- Semua prompt generation mencatat versi template dan snapshot konteks.
- Jangan membangun satu prompt raksasa untuk semua kebutuhan.
- Jangan mengarang keputusan, riset, codebase state, atau test results.
- Jangan langsung membuat seluruh produk dalam satu agent call; implementasikan secara bertahap dan teruji.

## Status

Ini merupakan fondasi produk dan kontrak implementasi awal, bukan source code aplikasi final. Keputusan teknis perlu diverifikasi terhadap repository nyata, kebutuhan aktual, dokumentasi resmi terkini, serta hasil pengujian.

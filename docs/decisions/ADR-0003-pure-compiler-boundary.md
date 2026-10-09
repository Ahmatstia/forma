# ADR-0003: Kemandirian dan Kemurnian Prompt Compiler

* **Status:** Disetujui (APPROVED)
* **Tanggal:** 9 Oktober 2026
* **Pengambil Keputusan:** Pemilik Produk & Tim Arsitektur Forma

## Konteks

`00_PRODUCT_BLUEPRINT.md` §4.4, §5A.3 dan `01_AI_AGENT_MASTER_PROMPT.md` §D menegaskan bahwa prompt compiler adalah mesin deterministik inti. Nilai Forma bergantung pada kehandalan compiler dalam menghasilkan prompt yang benar dari konteks terstruktur tanpa harus terhubung ke internet atau penyedia AI.

## Keputusan

1. Modul compiler (`src/modules/prompt-compiler` dan `src/modules/templates`) wajib berupa pustaka TypeScript murni (pure functional logic).
2. Compiler tidak boleh bergantung pada:
   * AI API atau LLM network calls.
   * Framework UI: React, Next.js.
   * Runtime APIs: `window`, `document`, `localStorage`, browser DOM.
   * Environment I/O: Filesystem (`fs`), `child_process`, `net`, `http`, `fetch`.
3. Batasan ini ditegakkan melalui aturan ESLint `no-restricted-imports` dan `no-restricted-globals`, serta dibuktikan lewat pengujian otomatis negatif (`src/lib/eslint-boundaries.test.ts`).

## Konsekuensi

* **Positif:** Compiler dapat diuji seratus persen secara deterministik, sangat cepat di Vitest, dan dapat dijalankan di lingkungan mana pun (Node, browser worker, edge runtime, atau CLI).
* **Trade-off:** Data eksternal atau konfigurasi harus disiapkan dan diinjeksi dari luar (dependency injection) sebelum diteruskan ke compiler.

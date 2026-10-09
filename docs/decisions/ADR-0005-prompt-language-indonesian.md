# ADR-0005: Konvensi Bahasa pada Template Prompt dan Kontrak Output

* **Status:** Disetujui (APPROVED)
* **Tanggal:** 9 Oktober 2026
* **Pengambil Keputusan:** Pemilik Produk & Tim Arsitektur Forma

## Konteks

`00_PRODUCT_BLUEPRINT.md` §1 menyatakan bahasa produk awal adalah Bahasa Indonesia yang siap dilokalkan. Namun agen AI coding umumnya beroperasi dengan istilah teknis rekayasa perangkat lunak standar (Inggris). Di katalog template, beberapa heading menggunakan bahasa Inggris, sedangkan isi instruksi berbahasa Indonesia.

## Keputusan

1. Seluruh template bawaan pada MVP-Core menggunakan Bahasa Indonesia sebagai bahasa pengantar dan instruksi kerja.
2. Istilah teknis yang umum dan lazim di industri (misalnya: *discovery*, *offline-first*, *backend*, *acceptance criteria*, *dependency*) tetap dipertahankan dalam Bahasa Inggris agar tidak menimbulkan ambiguitas terjemahan.
3. Kunci kontrak luaran (`Output Contract`, misalnya `IDEA_SUMMARY`, `PROBLEM_STATEMENT`, `VALIDATION_PLAN`) wajib menggunakan format kapital / snake-case dalam bahasa Inggris agar stabil saat diuraikan (parsed) oleh parser hasil agen eksternal di fase berikutnya.

## Konsekuensi

* **Positif:** Prompt mudah dipahami dan dikontrol oleh solo developer pengguna Forma di Indonesia, sembari tetap kompatibel dengan agen coding AI global (Claude, GPT, Codex).
* **Trade-off:** Struktur kode disiapkan dengan field `locale: 'id'` agar di masa depan siap mendukung template multibahasa.

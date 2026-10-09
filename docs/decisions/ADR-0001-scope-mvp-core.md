# ADR-0001: Pemisahan MVP-Core dari MVP-Full dan Prioritas Rantai Alur Inti

* **Status:** Disetujui (APPROVED)
* **Tanggal:** 9 Oktober 2026
* **Pengambil Keputusan:** Pemilik Produk & Tim Arsitektur Forma

## Konteks

`00_PRODUCT_BLUEPRINT.md` §16 dan §18 mencakup 20 kriteria penerimaan awal yang sangat luas, meliputi editor artefak Markdown, gate workflow, manajemen resiko, backlog, autentikasi, dan database server. Membangun seluruh cakupan ini sekaligus sebelum membuktikan alur nilai inti menciptakan resiko scope creep yang tinggi dan memperlambat umpan balik nyata bagi solo developer.

## Keputusan

1. Memisahkan cakupan menjadi **MVP-Core** (Fase R0–R2) dan **MVP-Full** (Fase R3 ke atas).
2. MVP-Core memprioritaskan alur:
   `Buat Proyek` → `Jawab Pertanyaan P-00` → `Simpan Konteks Terstruktur` → `Compile Prompt` → `Preview/Edit Per-Run` → `Copy/Download Markdown`.
3. Seluruh fitur dashboard dekoratif, editor dokumen artefak penuh, dan manajemen tiket ditunda sampai alur prompt compiler terbukti berjalan end-to-end.

## Konsekuensi

* **Positif:** Nilai produk inti terbukti cepat; umpan balik terhadap format prompt dapat diperoleh lebih awal; resiko overengineering berkurang drastis.
* **Trade-off:** Beberapa butir blueprint §16 (manajemen artefak dan status gate) baru diselesaikan pada fase lanjutan setelah compiler terbukti stabil.

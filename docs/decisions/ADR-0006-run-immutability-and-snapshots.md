# ADR-0006: Immutabilitas Riwayat Prompt Run dan Snapshot Konteks

* **Status:** Disetujui (APPROVED)
* **Tanggal:** 9 Oktober 2026
* **Pengambil Keputusan:** Pemilik Produk & Tim Arsitektur Forma

## Konteks

`00_PRODUCT_BLUEPRINT.md` §13 dan `03_PROMPT_TEMPLATE_CATALOG.md` §3 menetapkan aturan penting: ketika sebuah prompt dikompilasi, hasil tersebut menjadi catatan sejarah yang tidak boleh berubah secara diam-diam saat jawaban proyek atau versi template di kemudian hari diperbarui.

## Keputusan

1. Setiap hasil kompilasi prompt disimpan sebagai `PromptGenerationRun` yang bersifat append-only (immutable).
2. `PromptGenerationRun` wajib mengikat:
   * `templateId` dan `templateVersion`.
   * `contextSnapshotId` beserta salinan snapshot jawaban dan hash deterministik konteks (`contextHash`).
   * `compiledPrompt` (hasil murni kompilasi) dan `userEditedPrompt` (opsional teks kustom per eksekusi).
3. Status keterusangan (*stale*) dihitung secara dinamis melalui perbandingan hash konteks saat ini dengan hash pada run lama, bukan dengan memutasi record run lama.

## Konsekuensi

* **Positif:** Jejak audit akurat; pengguna selalu dapat melihat kembali apa yang sebenarnya dikirim ke AI coding agent minggu lalu tanpa distorsi perubahan baru.
* **Trade-off:** Ukuran penyimpanan bertambah secara append-only untuk setiap proses kompilasi yang disimpan.

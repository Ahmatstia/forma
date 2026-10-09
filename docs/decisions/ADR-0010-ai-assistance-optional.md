# ADR-0010: Sifat Opsional Layanan AI dan Kemandirian Sistem Inti

* **Status:** Disetujui (APPROVED)
* **Tanggal:** 9 Oktober 2026
* **Pengambil Keputusan:** Pemilik Produk & Tim Arsitektur Forma

## Konteks

`00_PRODUCT_BLUEPRINT.md` §4.4 dan §5A.3 menegaskan bahwa Forma bukanlah antarmuka chat LLM umum. Nilai utama Forma adalah kompilasi terstruktur dan deterministik dari masukan pengguna ke template prompt profesional. Integrasi AI (seperti pewawancara cerdas atau ekstraksi dokumen otomatis) adalah fasilitas pembantu (*copilot*), bukan syarat utama agar sistem dapat digunakan.

## Keputusan

1. Seluruh fungsi pembuatan proyek, pengisian kuesioner, kompilasi prompt, preview, edit per-run, copy teks, dan unduh Markdown wajib beroperasi seratus persen tanpa konfigurasi API key atau koneksi internet ke model AI.
2. Domain `ai-assistance` (Fase R7) diperlakukan sebagai modul pelengkap opsional di balik abstraksi `AiProvider`.
3. Kegagalan atau ketiadaan provider AI tidak boleh menghentikan atau merusak pengalaman kompilasi template manual.

## Konsekuensi

* **Positif:** Pengguna dapat langsung memakai Forma tanpa harus membayar token API atau memiliki akun penyedia LLM; privasi data ide terjaga di perangkat pengguna.
* **Trade-off:** Pengguna pada tahap MVP-Core menyusun deskripsi idenya sendiri melalui form terstruktur tanpa bantuan wawancara otomatis.

# ADR-0008: Kebijakan Deteksi dan Penanganan Kredensial / Secret

* **Status:** Disetujui (APPROVED)
* **Tanggal:** 9 Oktober 2026
* **Pengambil Keputusan:** Pemilik Produk & Tim Arsitektur Forma

## Konteks

`00_PRODUCT_BLUEPRINT.md` §11 dan `01_AI_AGENT_MASTER_PROMPT.md` §F melarang keras credential, token API, private key, atau secret masuk ke dalam teks prompt yang dikompilasi atau file ekspor Markdown/ZIP. Namun, pengguna sering tidak sengaja menempelkan teks mentah konfigurasi atau error log yang memuat secret ke dalam form jawaban atau hasil review.

## Keputusan

1. Compiler mengimplementasikan modul validator secret berbasis pola heuristik umum (misalnya: pola token API platform umum, header `BEGIN PRIVATE KEY`, JWT pattern, `password=`, `api_key=`).
2. Jika terdeteksi indikasi secret pada jawaban atau konteks:
   * Status kompilasi ditandai sebagai `blocked`.
   * Tombol `Salin Prompt (Copy)` dan `Unduh Markdown (Download)` dinonaktifkan.
   * Ditampilkan peringatan jelas yang menunjuk field yang terindikasi serta opsi redaksi eksplisit oleh pengguna.
3. Dokumentasi dan antarmuka menegaskan bahwa deteksi ini bersifat heuristik dan **tidak pernah menjamin seratus persen** pencegahan kebocoran secret. Tanggung jawab kerahasiaan data tetap berada pada pengguna.

## Konsekuensi

* **Positif:** Mengurangi drastis insiden kebocoran kunci API pribadi secara tidak sengaja ke platform AI pihak ketiga.
* **Trade-off:** Kemungkinan terjadinya false positive pada string acak (misal hash atau contoh kode), yang dapat diatasi melalui persetujuan/override eksplisit.

# ADR-0002: Penyimpanan Browser untuk MVP-Core dan Penundaan Database Server / Autentikasi

* **Status:** Disetujui (APPROVED)
* **Tanggal:** 9 Oktober 2026
* **Pengambil Keputusan:** Pemilik Produk & Tim Arsitektur Forma

## Konteks

`00_PRODUCT_BLUEPRINT.md` §11 menyebutkan PostgreSQL sebagai baseline jika aplikasi digunakan lintas perangkat. Namun, pada tahap MVP-Core, target pengguna adalah solo developer yang menguji alur pembuatan prompt secara lokal. Memasang database server (PostgreSQL/SQLite), migrasi DB, dan autentikasi multi-user di awal akan menambah beban setup, ketergantungan deployment, dan kompleksitas tanpa memberikan nilai tambahan bagi pengujian alur prompt compiler.

## Keputusan

1. Untuk **MVP-Core**, gunakan penyimpanan browser (localStorage atau IndexedDB) di balik antarmuka repository (`ProjectRepository` dan `RunRepository`).
2. Sediakan fitur Export dan Import JSON untuk pencadangan serta pemulihan data proyek.
3. Berikan indikator/peringatan jelas pada UI bahwa data tersimpan di browser perangkat lokal ini.
4. Tunda penyediaan database server, autentikasi pengguna, dan kontrol otorisasi multi-user hingga kebutuhan deployment multi-user ditetapkan pada fase R3.

## Konsekuensi

* **Positif:** Nol konfigurasi server/database untuk mencoba Forma; tidak ada biaya hosting database pada tahap validasi awal; antarmuka domain terisolasi dari detail persistensi.
* **Trade-off:** Data tidak sinkron otomatis lintas perangkat pada versi awal. Fitur Export/Import JSON menjadi mitigasi utama resiko kehilangan data lokal.

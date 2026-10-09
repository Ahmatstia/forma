# ADR-0004: Kosakata Status Kepastian (Certainty) dan Penanganan Preferensi

* **Status:** Disetujui (APPROVED)
* **Tanggal:** 9 Oktober 2026
* **Pengambil Keputusan:** Pemilik Produk & Tim Arsitektur Forma

## Konteks

`03_PROMPT_TEMPLATE_CATALOG.md` §3 awalnya mendefinisikan nilai `certainty` pada `ProjectAnswer`: `confirmed`, `assumption`, `unknown`, `not_applicable`. Namun pada contoh praktis `04_EXAMPLE_PROMPT_CHAIN.md`, terdapat preferensi pengguna awal (seperti "preferensi Flutter" atau "preferensi offline-first") yang bukan merupakan keputusan final yang mengikat, tetapi juga bukan sekadar dugaan masalah (asumsi). Memetakan preferensi menjadi asumsi membuat nuansa arahan hilang, sedangkan memetakannya menjadi fakta membuat agen coding menganggap pilihan stack telah final.

## Keputusan

1. Menambahkan nilai `preference` ke dalam enum kosakata `certainty`:
   `certainty: 'confirmed' | 'assumption' | 'unknown' | 'not_applicable' | 'preference'`.
2. Pada prompt yang dihasilkan:
   * `confirmed` masuk ke bagian Fakta Terkonfirmasi.
   * `assumption` masuk ke bagian Asumsi (belum divalidasi).
   * `preference` masuk ke bagian Preferensi Awal (bukan keputusan final) disertai instruksi eksplisit kepada agen coding agar tidak menguncinya tanpa evaluasi kebutuhan.
   * `unknown` masuk ke bagian Belum Diketahui dengan larangan mengarang nilai.

## Konsekuensi

* **Positif:** Kontrak skema Zod dan katalog selaras dengan contoh nyata rantai prompt `04`; agen coding memahami batas antara preferensi awal vs keputusan arsitektur final.
* **Trade-off:** Satu cabang logika tambahan dalam resolver konteks dan pengelompokan daftar pada envelope prompt.

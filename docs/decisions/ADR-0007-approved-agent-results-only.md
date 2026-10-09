# ADR-0007: Kebijakan Persetujuan Manusia untuk Hasil Agen Eksternal (Approval Gate)

* **Status:** Disetujui (APPROVED)
* **Tanggal:** 9 Oktober 2026
* **Pengambil Keputusan:** Pemilik Produk & Tim Arsitektur Forma

## Konteks

Dalam alur rantai prompt berantai (misal `P-00 Idea` → `P-01 Product Brief` → `P-02 PRD`), hasil kerja agen coding (seperti analisis masalah atau usulan fitur) akan menjadi bahan masukan untuk tahap berikutnya. Jika teks mentah agen langsung otomatis dijadikan konteks resmi, halusinasi atau asumsi liar AI akan mencemari seluruh prompt arsitektur dan implementasi berikutnya.

## Keputusan

1. Teks hasil dari agen eksternal disimpan dengan status awal `captured` atau `in_review`.
2. Pengguna memiliki kendali penuh untuk meninjau, mengedit teks tersebut, dan secara eksplisit menekan tombol **Setujui (Approve)** atau **Tolak (Reject)**.
3. Hanya data yang berstatus `approved` yang diizinkan oleh resolver konteks untuk masuk ke lapisan `upstream context pack` pada kompilasi tahap downstream.
4. Pada MVP, approval dilakukan pada tingkat unit hasil yang telah ditinjau/diedit pengguna (bukan persetujuan mikro per kalimat/paragraf).

## Konsekuensi

* **Positif:** Mencegah kontaminasi halusinasi AI ke dalam rancangan arsitektur; pengguna tetap menjadi pengambil keputusan tertinggi (human-in-the-loop).
* **Trade-off:** Menuntut interaksi pengguna di setiap pergantian tahap rantai prompt (sesuai filosofi produk Forma).

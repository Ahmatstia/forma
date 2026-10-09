# Example Prompt Chain — Dari Jawaban Pengguna ke Prompt Siap Pakai

**Tujuan:** menunjukkan secara konkret bagaimana form, project context, template, prompt compilation, dan hasil lintas tahap saling terhubung.  
**Contoh fiktif:** `KostCerdas`, aplikasi untuk membantu mahasiswa mengatur pengeluaran bulanan.  
**Catatan:** contoh ini menjelaskan perilaku produk; bukan klaim bahwa ide atau data telah divalidasi oleh riset nyata.

---

## 1. Jawaban yang dimasukkan pengguna

### Project profile

| Pertanyaan | Jawaban pengguna | Status |
|---|---|---|
| Nama sementara | KostCerdas | Confirmed |
| Ide awal | Aplikasi untuk membantu mahasiswa kos mengatur pengeluaran bulanan | Confirmed |
| Target platform | Android terlebih dahulu | Confirmed |
| Target pengguna | Mahasiswa yang tinggal di kos dan punya anggaran terbatas | Confirmed sebagai sasaran awal |
| Masalah | Sering tidak sadar uang habis sebelum akhir bulan | Hipotesis pengguna, belum tervalidasi |
| Konektivitas | Aplikasi sebaiknya tetap bisa dipakai tanpa internet | Confirmed preference |
| Akun pengguna | Belum tahu apakah perlu login | Unknown |
| Sinkronisasi cloud | Belum diputuskan | Unknown |
| Pilihan teknologi | Preferensi Flutter, tetapi terbuka jika ada alasan kuat | Preference, bukan keputusan final |
| Batasan | Dikembangkan sendiri, ingin biaya operasi rendah | Confirmed |
| Monetisasi | Belum diputuskan | Unknown |

Sistem menyimpan jawaban menggunakan key terstruktur. Contoh ringkas:

```yaml
project:
  name: KostCerdas
  ideaSummary: Aplikasi untuk membantu mahasiswa kos mengatur pengeluaran bulanan
  platforms: [android]
  complexityTrack: standard
  constraints:
    soloDeveloper: true
    lowOperatingCost: true
    offlinePreferred: true
product:
  targetUsers: Mahasiswa yang tinggal di kos dengan anggaran terbatas
  problem:
    value: Sering tidak sadar uang habis sebelum akhir bulan
    certainty: assumption
  authentication:
    value: null
    certainty: unknown
architecture:
  technologyPreference:
    value: Flutter
    certainty: preference
  cloudSync:
    value: null
    certainty: unknown
```

Kunci `certainty` mempengaruhi prompt. Sistem tidak boleh menulis seolah masalah sudah terbukti atau Flutter sudah menjadi keputusan final.

---

## 2. Tahap pertama: compile P-00 Idea Clarification

### Apa yang dilakukan compiler?

- Mengambil instruksi global.
- Mengambil template `P-00-IDEA` versi tertentu.
- Mengisi nama, ide, target user, platform, constraint, dan unknowns.
- Mengaktifkan cabang pertanyaan karena masalah masih hipotesis.
- Tidak mengaktifkan section arsitektur/database sebagai keputusan final karena belum dibutuhkan pada tahap discovery.
- Menyimpan context snapshot untuk prompt run ini.

### Contoh prompt final yang dilihat pengguna

```markdown
# Role
Bertindak sebagai Product Discovery Lead dan Business Analyst yang membimbing solo developer. Bantu saya berpikir sistematis dengan bahasa yang jelas. Jangan menganggap ide saya sudah tervalidasi.

# Project Context
- Nama proyek: KostCerdas
- Ide: Aplikasi untuk membantu mahasiswa kos mengatur pengeluaran bulanan.
- Platform target awal: Android.
- Target pengguna: Mahasiswa yang tinggal di kos dan punya anggaran terbatas.
- Constraints: Dikembangkan oleh satu developer, biaya operasi rendah, dan preferensi offline-first.
- Teknologi: Flutter adalah preferensi awal, belum keputusan final.
- Status masalah: Hipotesis pengguna, belum tervalidasi.

# Known facts, assumptions, and open questions
- Confirmed: sasaran awal mahasiswa kos; developer bekerja sendiri; biaya operasi ingin rendah.
- Assumption: pengguna sering tidak sadar uang habis sebelum akhir bulan.
- Unknown: apakah akun/login dibutuhkan.
- Unknown: apakah sinkronisasi cloud dibutuhkan.
- Unknown: model monetisasi.
- Unknown: seberapa sering pengguna mencatat transaksi dan bagaimana mereka melakukannya sekarang.

# Objective
Perjelas ide dan tentukan masalah yang sebaiknya diuji sebelum saya mulai merancang UI atau menulis kode.

# Work steps
1. Rangkum ide saya tanpa menambahkan fitur baru.
2. Pisahkan masalah dengan solusi yang baru dibayangkan.
3. Identifikasi asumsi terbesar dan risiko membangun produk yang tidak dibutuhkan.
4. Rumuskan pertanyaan discovery yang akan memberi informasi paling bernilai tentang kebiasaan keuangan mahasiswa kos.
5. Sarankan eksperimen ringan yang bisa dilakukan developer solo dengan biaya rendah. Jangan membuat hasil wawancara atau angka pasar fiktif.
6. Bandingkan alternatif seperti pencatatan manual, spreadsheet, aplikasi lain, atau tidak mencatat—sebagai alternatif yang perlu diperiksa, bukan bukti kompetitor yang sudah diteliti.
7. Susun problem statement dan hipotesis nilai.
8. Beri rekomendasi informasi yang harus dikumpulkan sebelum PRD dibuat.

# Output contract
Buat Markdown dengan bagian:
1. IDEA_SUMMARY
2. PROBLEM_STATEMENT
3. TARGET_USERS_AND_SITUATIONS
4. FACTS_ASSUMPTIONS_OPEN_QUESTIONS
5. CURRENT_ALTERNATIVES_TO_INVESTIGATE
6. VALUE_HYPOTHESES
7. LOW_COST_VALIDATION_PLAN
8. MVP_DIRECTION_OPTIONS
9. RECOMMENDED_NEXT_STEP

Jangan menyatakan ide tervalidasi tanpa evidence. Jika ada hal yang belum diketahui tetapi belum menghalangi product brief, tandai sebagai asumsi/pertanyaan terbuka dan tetap berikan langkah berikutnya.
```

Prompt di atas berbeda dari template statis karena telah memuat jawaban, status kepastian, platform, dan batasan dari form. Jika nama, platform, atau prioritas offline diubah, prompt hasil kompilasi akan ikut berubah.

---

## 3. Agent memberikan hasil; pengguna meninjau sebelum approve

Misalnya pengguna menjalankan prompt di AI coding agent dan memasukkan respons kembali ke KostCerdas Prompt Studio.

Sistem menyimpan teks agent sebagai `AgentResult` dengan status `captured` atau `in_review`. Sistem boleh membantu mengekstrak ringkasan, tetapi tidak otomatis mengubah asumsi menjadi fakta.

Contoh hasil sementara dari agent:

- Problem statement yang lebih jelas.
- Daftar asumsi yang paling berisiko.
- Rencana validasi berupa percakapan singkat dengan calon pengguna atau prototipe catatan transaksi.
- Keputusan sementara bahwa aplikasi versi awal bisa mengeksplorasi alur pencatatan tanpa login untuk mengurangi friksi; ini baru usulan, belum keputusan pengguna.

Pengguna bisa:

- mengedit hasil;
- menyetujui bagian tertentu;
- menolak bagian yang tidak sesuai;
- menandai rekomendasi sebagai asumsi;
- menyimpan hasil tanpa approve jika masih ingin melakukan riset.

Hanya bagian yang disetujui menjadi upstream context resmi.

---

## 4. Tahap kedua: compile P-01 Product Brief

Setelah output discovery disetujui, compiler mengambil:

1. Jawaban awal yang masih relevan.
2. Problem framing yang telah di-approve.
3. Asumsi/unknowns yang masih terbuka.
4. Constraint solo developer, low cost, Android-first, offline preference.
5. Template `P-01-PRODUCT-BRIEF`.

Compiler tidak perlu menanyakan ulang sasaran pengguna atau constraint yang sudah tersimpan. Form tahap Product Brief hanya menampilkan pertanyaan tambahan yang masih kosong atau memang spesifik terhadap tahap tersebut.

Output AI kemudian direview menjadi `PRODUCT_BRIEF.md`. Misalnya pengguna menyetujui MVP awal berisi pencatatan pemasukan/pengeluaran, kategori dasar, ringkasan sisa anggaran, dan histori transaksi. Pilihan fitur tersebut hanya masuk ke konteks resmi setelah pengguna meng-approve; sistem tidak menganggapnya benar hanya karena AI menuliskannya.

---

## 5. Tahap ketiga: compile P-02 PRD

Prompt PRD yang dihasilkan akan secara otomatis membawa context ringkas berikut:

```markdown
## Approved Product Brief Context
- Project: KostCerdas
- Primary platform: Android.
- Target user: Mahasiswa kos dengan anggaran terbatas.
- Product problem: menggunakan problem statement discovery yang sudah di-approve.
- Approved MVP scope: menggunakan daftar fitur yang sudah disetujui pengguna.
- Constraints: solo developer, biaya operasi rendah, offline-first sebagai preferensi penting.
- Unresolved: kebutuhan login, cloud sync, monetisasi, dan sebagian asumsi perilaku pengguna.

## Instructions for this PRD task
- Turunkan hanya scope yang sudah approved.
- Tandai rekomendasi baru sebagai PROPOSED.
- Untuk fitur yang bergantung pada keputusan login/cloud, jelaskan opsi dan trade-off; jangan menganggapnya sudah diputuskan.
- Masukkan acceptance criteria, error/empty states, data lifecycle, dan quality needs yang relevan.
```

Dengan ini PRD tidak memulai dari prompt kosong. Prompt memuat ringkasan product brief yang disetujui beserta hal-hal yang belum diputuskan.

Setelah PRD dihasilkan dan disetujui, prompt berikutnya dapat membawa requirement yang benar-benar approved. Jika pengguna menolak sebuah fitur, fitur itu tidak seharusnya muncul lagi seolah-olah bagian MVP di prompt berikutnya.

---

## 6. Tahap platform: P-04M Mobile UX

Karena target platform mencakup Android, template `P-04M-MOBILE-UX` tersedia. Template web tidak dimasukkan ke prompt ini kecuali proyek kemudian menambahkan web sebagai platform.

Konteks mobile tambahan dapat meliputi:

- preferensi offline-first;
- apakah data harus tersimpan lokal;
- kebutuhan sinkronisasi yang masih unknown;
- kemampuan perangkat yang memang dibutuhkan;
- dukungan ukuran layar, font scaling, navigation, permission, dan lifecycle.

Sementara kebutuhan business rule dan acceptance criteria yang sudah disetujui tetap berasal dari PRD/requirements shared core. Inilah perbedaan **shared core + platform-specific adapter**: pertanyaan dasar produk tidak diulang, tetapi UX dan implementasi platform mendapatkan prompt khusus.

---

## 7. Tahap arsitektur: P-05 Data/API dan P-06 Architecture

Prompt data/API akan mengandung MVP dan flow yang approved, serta fakta bahwa offline-first menjadi kebutuhan penting. Compiler tidak boleh menetapkan PostgreSQL, Firebase, SQLite, atau database lain hanya karena template menyebutnya.

Karena login dan cloud sync masih `unknown`, prompt harus meminta analisis alternatif seperti:

- local-only dengan penyimpanan perangkat;
- offline-first dengan sinkronisasi cloud pada tahap berikutnya;
- akun/cloud sejak versi pertama apabila ada kebutuhan nyata yang disetujui.

Setiap alternatif perlu membandingkan kompleksitas, biaya operasional, privasi, backup/restore, migrasi, dan konsekuensi lintas perangkat. Pilihan final direkam sebagai keputusan yang perlu disetujui, bukan diam-diam menjadi source of truth.

Setelah pengguna menyetujui model data/arsitektur, context itu menjadi bahan untuk backlog dan prompt implementasi.

---

## 8. Tahap implementasi: P-09 One Vertical Slice

Prompt implementasi tidak meminta agent membuat seluruh aplikasi. Compiler mengambil satu task backlog yang sudah dipilih, misalnya `SLICE-001: Catat pengeluaran lokal`, bersama acceptance criteria, keputusan penyimpanan yang disetujui, aturan UI yang relevan, dan batasan scope.

Prompt hasil akhir harus menyebut:

- satu outcome pengguna;
- file/modul terkait hanya jika dapat diketahui dari audit repository, atau dinyatakan sebagai target untuk diperiksa agent;
- requirement dan acceptance criteria;
- apa yang tidak boleh dikerjakan pada slice tersebut;
- tests dan commands yang harus dijalankan;
- instruksi membaca ADR/context terkait;
- format laporan hasil dan blocker.

Jika repository belum dibuat, prompt meminta agent mengaudit kondisi aktual terlebih dahulu, bukan mengarang struktur file yang seolah sudah ada.

---

## 9. Contoh perubahan konteks dan stale prompt

Misalnya prompt arsitektur telah dibuat ketika cloud sync berstatus `unknown`. Kemudian pengguna memutuskan bahwa sinkronisasi cloud wajib ada pada MVP.

Sistem harus:

1. Menyimpan keputusan baru sebagai versi approved.
2. Mengidentifikasi prompt, diagram, data model, security analysis, backlog, dan test plan downstream yang mungkin terpengaruh.
3. Menandai context snapshot lama sebagai tidak mutakhir untuk keputusan terbaru.
4. Menampilkan alasan dan sumber dampak.
5. Meminta pengguna membuat ulang prompt yang terpengaruh atau mempertahankan versi lama dengan override yang tercatat.

**Sistem tidak boleh mengubah prompt lama secara diam-diam.** Riwayat lama tetap tersedia untuk audit dan perbandingan.

---

## 10. Apa yang harus lulus sebelum fitur prompt dianggap selesai?

- Jawaban form mengubah bagian prompt yang tepat.
- Jawaban yang sudah ada dipakai ulang; tidak ditanyakan lagi tanpa alasan.
- Nilai `unknown` tetap terlihat sebagai ketidakpastian.
- Web dan mobile menghasilkan adapter/section yang berbeda sesuai platform yang dipilih.
- Prompt PRD memakai hasil discovery/product brief yang sudah disetujui.
- Prompt implementasi memakai requirements, architecture decisions, dan backlog yang disetujui.
- Hasil agent yang belum approved tidak mengubah canonical context.
- Source template atau jawaban yang berubah tidak mengubah prompt run lama.
- Context downstream yang tidak mutakhir ditandai `stale`.
- Prompt dapat di-copy dan diekspor sebagai `.md`, dan prompt pack dapat diunduh sebagai `.zip`.
- Alur dasar berjalan tanpa API AI key.

---

## Inti dari contoh ini

Forma bukan cuma bertanya, "Aplikasimu mau seperti apa?" lalu menyimpan jawaban. Sistem mengelola konteks proyek, memilih template yang tepat, **menyusun prompt final dari jawaban pengguna**, dan menjaga agar hasil setiap tahap menjadi konteks resmi tahap berikutnya hanya setelah ditinjau. Dengan begitu, pengguna dapat membuka sistem setiap kali mempunyai ide baru dan mendapatkan prompt profesional yang bisa langsung dipakai tanpa merancang seluruh instruksinya dari nol.

# Forma

**Dokumen:** Product Blueprint & System Requirements  
**Versi:** 0.1 (Draft untuk validasi dan implementasi bertahap)  
**Tanggal riset:** 9 Oktober 2026  
**Status:** Source of truth awal; keputusan final tetap dicatat sebagai keputusan produk  
**Bahasa produk awal:** Bahasa Indonesia, dengan struktur yang siap dilokalkan  
**Nama produk:** Forma (nama produk yang dipilih; ketersediaan merek/domain belum diverifikasi)

---

## 1. Ringkasan Eksekutif

Forma adalah aplikasi web responsif yang inti nilainya adalah **menghasilkan prompt profesional yang lengkap, kontekstual, dan saling terhubung untuk AI coding agent**. Pengguna menjawab pertanyaan tentang ide, kebutuhan, platform, batasan, dan keputusan proyek. Jawaban itu disimpan sebagai konteks terstruktur, lalu digabungkan secara deterministik ke template prompt yang sesuai.

Hasil utama yang dibawa pengguna keluar dari sistem adalah prompt siap salin/pakai atau paket prompt `.md`/`.zip` untuk Codex, Cursor, Antigravity, atau agent lain. Prompt dibuat untuk setiap tahapan—mulai dari memperjelas ide, product discovery, PRD, requirement, UX, data, arsitektur, backlog, implementasi, debugging, testing, hingga release. Hasil yang sudah disetujui dari tahap sebelumnya menjadi konteks tahap berikutnya, sehingga seluruh prompt konsisten dan tidak berangkat dari nol setiap kali.

Workflow, checklist, dokumen, traceability, dan readiness gate berfungsi untuk **memberi bahan yang benar kepada prompt compiler**, memeriksa kelengkapan konteks, dan mencegah keluaran prompt yang saling bertentangan. Produk ini bukan chatbot umum atau sekadar kumpulan prompt statis.

### Masalah inti

Ketika ide muncul, developer sering langsung meminta AI menulis kode. Karena konteks, batasan, model domain, alur pengguna, kriteria penerimaan, dan keputusan arsitektur belum jelas, AI dapat menghasilkan fitur yang tidak konsisten. Saat fitur bertambah, developer kesulitan menentukan apa yang belum dibuat, mengapa keputusan tertentu diambil, dan bagaimana perubahan memengaruhi komponen lain.

### Solusi inti

Produk menyediakan *guided intake* yang menangkap jawaban pengguna sebagai data terstruktur; katalog template prompt modular; *Prompt Compiler* yang mengisi variabel dan bagian kondisional; konteks proyek bersama; rantai prompt antartahap; preview/edit/copy/download; versioning; dan validasi sebelum prompt dipakai. Workflow, dokumen, checklist, asumsi, dan keputusan mendukung pipeline tersebut. Integrasi API AI opsional; prompt generation dasar harus tetap berjalan tanpa API key.

### Prinsip paling penting

> Setiap jawaban pengguna harus memiliki tujuan: mengisi konteks proyek atau menentukan cabang template prompt. Sistem harus mengubah jawaban itu menjadi prompt yang siap dipakai, bukan berhenti di sesi tanya-jawab atau checklist. Prompt pada tahap berikutnya harus membawa konteks terpilih dan hasil yang sudah disetujui dari tahap sebelumnya.

---

## 2. Visi, Misi, dan Tujuan

### Visi

Menjadi ruang kerja perencanaan pribadi yang membuat developer dapat memulai proyek baru dengan lebih terarah dan melanjutkan proyek lama tanpa kehilangan konteks.

### Misi

1. Mengubah ide abstrak menjadi masalah, sasaran, dan ruang lingkup yang jelas.
2. Menjelaskan langkah berikutnya berdasarkan tipe dan tingkat risiko proyek.
3. Menghubungkan kebutuhan produk dengan desain, data, arsitektur, task, dan pengujian.
4. Menghasilkan prompt lengkap yang dikompilasi dari jawaban pengguna dan template yang terstruktur.
5. Menyambungkan prompt lintas tahap melalui konteks bersama, dependency, dan snapshot output yang disetujui.
6. Menyediakan ekspor `.md`/`.zip` yang siap disalin ke coding agent, bukan hanya dokumen perencanaan.
7. Mengurangi perubahan kode yang tidak perlu akibat konteks hilang, prompt generik, atau asumsi yang belum diuji.
8. Membantu developer belajar mengapa suatu pertanyaan atau bagian prompt diperlukan.

### Tujuan produk

- Pengguna mengetahui pekerjaan berikutnya tanpa harus merancang proses dari nol.
- Sebelum coding fitur utama, pengguna memiliki definisi masalah, ruang lingkup, kebutuhan inti, alur kritis, keputusan arsitektur yang diperlukan, dan kriteria penerimaan.
- Setiap rekomendasi teknis memiliki alasan, trade-off, dan asumsi yang terlihat.
- Dokumen dapat diperbarui tanpa memutus hubungan dengan requirement dan task terkait.
- Pengguna dapat menghasilkan satu prompt lengkap atau paket prompt berantai yang sesuai dengan jawaban dan konteks proyeknya.
- Prompt tahap berikutnya otomatis memasukkan artefak yang sudah disetujui, platform, batasan, keputusan, dan acceptance criteria yang relevan.
- Pengguna dapat memakai fungsi inti tanpa menghubungkan provider AI: mengisi form → compile prompt → preview → copy/download.

### Bukan tujuan

- Menggantikan penilaian profesional atau menjamin arsitektur maupun output agent pasti benar.
- Menjadi chatbot tanya-jawab yang tidak menghasilkan prompt operasional.
- Mengandalkan satu prompt raksasa yang sama untuk semua tahapan dan semua platform.
- Mewajibkan dokumentasi enterprise untuk setiap proyek kecil.
- Menjadi klon Jira/Linear/GitHub Projects yang lengkap pada versi awal.
- Menghasilkan seluruh kode aplikasi secara otomatis tanpa pemeriksaan manusia.
- Memaksakan microservices, Clean Architecture, cloud, database relasional, atau metode Agile tertentu ke semua proyek.

---

## 3. Pengguna Sasaran

### Persona utama: Solo Developer / Vibe Coder

- Memiliki banyak ide dan menggunakan AI coding agent.
- Cenderung mulai coding sebelum kebutuhan dan arsitektur cukup jelas.
- Bisa menyusun UI atau fitur awal dengan cepat, tetapi berisiko bingung di tengah jalan.
- Membutuhkan arahan yang jelas, contoh, urutan kerja, dan penjelasan bahasa sederhana.
- Ingin hasil yang dapat langsung disalin atau diekspor ke `.md`.

### Persona sekunder

- Mahasiswa informatika yang membangun tugas akhir, portofolio, atau produk pribadi.
- Freelancer yang perlu membuat scope dan acceptance criteria sebelum estimasi pekerjaan.
- Technical founder yang menguji ide sebelum berinvestasi terlalu banyak pada implementasi.
- Developer yang mewarisi proyek lama dan perlu membuat peta sistem sebelum mengubahnya.

### Jobs To Be Done

> Ketika saya mendapatkan ide aplikasi, bantu saya memahami keputusan apa yang harus dibuat, dokumen apa yang benar-benar diperlukan, dan pekerjaan apa yang harus dilakukan sebelum coding agar saya tidak kehilangan arah saat implementasi.

> Ketika saya mengubah scope atau menambahkan fitur, tunjukkan artefak, data, API, layar, task, dan tes yang mungkin ikut terdampak.

> Ketika saya akan mulai menggunakan AI coding agent, siapkan konteks dan instruksi yang cukup spesifik sehingga agent tidak menebak-nebak kebutuhan penting.

---

## 4. Keputusan Produk Utama

### 4.1 Aplikasi perencanaan dibuat sebagai web app responsif

Versi awal Forma dibuat sebagai satu aplikasi web responsif, dioptimalkan untuk desktop/laptop tetapi tetap bisa digunakan di tablet dan ponsel. Pengguna tidak perlu membuat dua produk (web dan mobile) untuk alat perencanaan ini.

### 4.2 Proyek yang direncanakan memakai satu core workflow dengan platform track

Jangan membuat dua proses perencanaan terpisah dari awal. Ada satu fondasi bersama, kemudian checklist dan artefak khusus berdasarkan platform target.

**Fondasi bersama:** problem discovery, tujuan, user, scope, requirement, business rules, domain model, risiko, kualitas, test strategy, backlog, dan rencana rilis.

**Platform extension:** desain interaksi, arsitektur implementasi, penggunaan kemampuan perangkat, keamanan spesifik, kompatibilitas, pengujian, deployment, dan distribusi.

Jenis target yang perlu didukung sejak awal:

- Web application
- Website / landing page / content site
- Backend / API / service
- Android native
- iOS native
- Cross-platform mobile (misalnya Flutter atau React Native)
- Full-stack web + API
- Multi-platform product (misalnya web + mobile berbagi backend)
- PWA bila relevan

Desktop native dan tipe khusus lain dapat ditambahkan sebagai template/track lanjutan tanpa mendesain ulang core workflow.

### 4.3 Alur bersifat adaptif, bukan waterfall kaku

Setiap proyek melewati tahap yang relevan, tetapi urutan dapat diulang ketika ada bukti atau perubahan baru. Tahapan mempunyai *gate* yang jelas, bukan sekadar checklist centang.

### 4.4 Prompt Compiler adalah mesin inti; AI adalah copilot, bukan sumber kebenaran otomatis

- Prompt Compiler menggabungkan template, variabel, kondisi, konteks proyek, platform track, dan output tahap sebelumnya menjadi satu prompt utuh.
- Kompilasi inti harus deterministik dan berfungsi tanpa model AI; AI hanya membantu memperjelas jawaban, menyusun saran, mengekstrak output, atau mendeteksi konflik.
- AI boleh menyarankan isi dan menandai kontradiksi, tetapi harus membedakan data terkonfirmasi, asumsi, rekomendasi, dan hal yang belum diketahui.
- Keputusan material dan hasil yang akan dipakai sebagai konteks selanjutnya memerlukan persetujuan pengguna.
- Prompt hasil kompilasi bisa diedit sebelum dipakai; template dan hasil kompilasi mempunyai versi berbeda.
- Ketika AI provider tidak tersedia, fungsi intake, template, compile, preview, copy, dan export tetap berfungsi.

### 4.5 Prompt siap pakai adalah keluaran utama; Markdown adalah format portabel

Pengguna dapat menyalin prompt yang sudah dikompilasi, mengunduh satu prompt sebagai `.md`, atau mengekspor satu rangkaian prompt sebagai `.zip`. Paket bisa berisi `README.md`, `PROJECT_CONTEXT.md`, prompt per tahap, dokumen hasil yang disetujui, serta urutan eksekusi dan dependency. Setiap prompt mencantumkan ID, versi template, snapshot konteks, prerequisite, serta output yang diharapkan. Dokumen perencanaan tetap dapat diekspor, tetapi prompt adalah keluaran utama.

### 4.6 Gunakan modular monolith untuk versi awal

Sistem ini dikembangkan oleh satu developer. Mulai dari aplikasi modular yang batas domainnya jelas. Jangan memecah menjadi microservices sebelum ada alasan operasional yang terukur.

---

## 5. Prinsip Desain Sistem

1. **Clarity before code:** tandai ambiguitas yang dapat memicu implementasi salah.
2. **Progressive disclosure:** tampilkan pertanyaan dan keputusan sesuai tahap; jangan memaksa pengguna mempelajari semua metodologi sekaligus.
3. **Right-sized process:** tingkat dokumentasi ditentukan oleh kompleksitas, risiko, platform, integrasi, dan kebutuhan pengguna.
4. **One question at a time:** mode wawancara AI mengajukan satu pertanyaan utama per giliran, kecuali pengguna memilih formulir lanjutan.
5. **Visible reasoning:** rekomendasi menjelaskan alasan, manfaat, risiko, alternatif, dan konsekuensi.
6. **Human approval:** AI tidak diam-diam mengganti requirement, skema data, atau keputusan arsitektur yang sudah disetujui.
7. **Traceability:** requirement dapat ditelusuri ke story, task, komponen, dan test case yang relevan.
8. **Single source of truth:** fakta proyek tidak boleh disalin ke banyak dokumen secara tidak terkontrol.
9. **Change impact awareness:** perubahan fitur memicu daftar dampak yang disarankan dan menunggu persetujuan.
10. **Security and privacy from the start:** keamanan bukan checklist di penghujung proyek.
11. **Accessible by default:** antarmuka web dan aplikasi target mempertimbangkan keyboard, screen reader, kontras, ukuran teks, dan kebutuhan aksesibilitas lain.
12. **No architecture theatre:** diagram dan pola arsitektur dibuat saat menyelesaikan pertanyaan nyata, bukan demi banyaknya dokumen.
13. **Evidence labels:** saran AI tidak boleh ditampilkan seolah-olah fakta yang sudah dikonfirmasi.
14. **Teaching mode:** jelaskan istilah teknis secara ringkas dan bertahap ketika pengguna memilih mode belajar.

---

## 5A. Model Produk Inti: Answers → Context → Prompt Compiler → Prompt Chain

Bagian ini adalah kontrak arsitektur produk, bukan detail implementasi opsional.

### 5A.1 Alur yang wajib didukung

1. **Capture:** pengguna menjelaskan ide dengan teks bebas dan menjawab pertanyaan terstruktur yang relevan.
2. **Normalize:** jawaban disimpan dengan key stabil, tipe data, sumber, status kepastian, waktu, dan versi. Jawaban tidak sekadar disisipkan ke string secara langsung.
3. **Resolve context:** sistem menentukan fakta terkonfirmasi, asumsi, keputusan yang disetujui, pertanyaan terbuka, batasan, platform track, serta artefak upstream yang relevan.
4. **Select template:** pilih template berdasarkan tahap, tipe proyek, platform, tingkat kompleksitas, dan prasyarat yang sudah dipenuhi.
5. **Compile:** gabungkan instruksi global, template tahap, variabel jawaban, kondisi platform, konteks terpilih, aturan konflik, dan kontrak output.
6. **Validate:** cek variabel wajib kosong, jawaban yang bertentangan, prasyarat belum disetujui, konteks terlalu besar, potensi data sensitif, dan placeholder yang tersisa.
7. **Review:** tampilkan prompt final secara utuh dan dapat diedit; berikan peringatan tentang asumsi atau pertanyaan yang masih terbuka.
8. **Handoff:** pengguna menyalin prompt atau mengunduh `.md` dan memasukkannya ke agent pilihan.
9. **Capture result:** pengguna menempelkan/import respons agent sebagai hasil tahap. Sistem menampilkan hasil mentah, melakukan ekstraksi terstruktur bila tersedia, lalu meminta review/approval.
10. **Continue chain:** hanya hasil yang disetujui menjadi konteks resmi prompt tahap berikutnya. Perubahan konteks menandai prompt downstream yang sudah usang.

### 5A.2 Lapisan penyusun prompt

Prompt yang dikompilasi harus dibangun dari komponen terpisah, bukan string besar yang sulit dirawat:

1. **Global agent contract:** anti-halusinasi, cara menangani ketidakpastian, keamanan, format komunikasi, aturan tidak mengubah scope diam-diam.
2. **Project context:** ide, masalah, pengguna, tujuan, batasan, preferensi, fakta, asumsi, keputusan, dan open questions.
3. **Stage template:** tugas spesifik yang sedang dilakukan beserta urutan kerja dan expected outputs.
4. **Platform adapter:** bagian web, mobile native/cross-platform, backend/API, atau multi-platform yang relevan saja.
5. **Upstream context pack:** requirement/PRD/ADR/flow atau output approved yang menjadi input tahap ini.
6. **Run-specific overrides:** instruksi tambahan khusus eksekusi ini; tidak boleh diam-diam menimpa keputusan yang telah disetujui.
7. **Output contract and quality gate:** format output, acceptance criteria, pemeriksaan, non-goals, serta langkah jika informasi belum cukup.

Jika ada konflik antara dua sumber resmi, compiler tidak boleh memilih diam-diam. Tampilkan konflik, sumber/versi, dampak, dan keputusan yang perlu dibuat.

### 5A.3 Prompt generation bukan berarti harus memanggil model AI

MVP wajib dapat membuat prompt lengkap menggunakan template renderer dan data jawaban yang sudah tersimpan. Model AI opsional untuk wawancara adaptif, rekomendasi, ekstraksi output agent, dan analisis dampak. Dengan begitu produk tidak memaksa pengguna memasukkan API key hanya untuk menyusun atau mengunduh prompt.

### 5A.4 Contoh rantai yang saling terhubung

`IDEA_CLARIFICATION` → `PRODUCT_BRIEF` → `PRD` → `REQUIREMENTS` → `PLATFORM_UX` → `DOMAIN_DATA_API` → `ARCHITECTURE_SECURITY` → `IMPLEMENTATION_PLAN` → `IMPLEMENTATION_SLICE` → `TEST_REVIEW` → `RELEASE_READINESS`.

Ini contoh alur, bukan rantai kaku. Template boleh dilewati jika tidak relevan; dependency yang ditandai wajib tidak boleh dianggap terpenuhi hanya karena pengguna membuka tahap berikutnya.

### 5A.5 Ketentuan template prompt

Setiap template memiliki `template_id`, versi, tujuan, kategori, status, platform yang didukung, mode proyek yang cocok, prerequisite, variabel/pertanyaan input, aturan kondisi, konteks upstream yang digunakan, isi template, output contract, validation rules, dan template lanjutan yang direkomendasikan. Template dapat dikloning/diedit oleh pengguna tanpa mengubah versi bawaan.

Gunakan template engine terstruktur dengan allowlist operasi. Jangan menjalankan JavaScript/eval arbitrer dari isi template. Validasi template saat disimpan dan saat dikompilasi.

---

## 6. Model Kedalaman Proyek

Sistem harus menentukan kedalaman perencanaan dari faktor yang terlihat dan dapat diubah. Jangan mengandalkan skor AI misterius.

### Quick Track

Cocok untuk landing page sederhana, prototipe, eksperimen, atau tool personal berisiko rendah.

Artefak minimum biasanya: project brief, scope, alur utama, checklist implementasi, acceptance criteria inti, dan test checklist sederhana.

### Standard Track

Cocok untuk aplikasi dengan beberapa fitur, penyimpanan data, autentikasi, dashboard, API, atau integrasi eksternal.

Artefak tambahan yang umum: PRD ringkas, user stories, model domain/data, diagram arsitektur konteks/container jika membantu, ADR untuk keputusan material, threat checklist, backlog vertical slice, dan test strategy.

### Advanced / High-Risk Track

Cocok untuk data sensitif, pembayaran, multi-tenant, skala besar, sistem kritis, banyak integrasi, kepatuhan khusus, atau banyak tim.

Artefak tambahan dapat mencakup threat model terstruktur, data lifecycle/retention, kontrol keamanan berdasarkan standar, reliability goals, disaster recovery, observability plan, migration/rollback plan, security verification, serta tinjauan arsitektur yang lebih mendalam.

### Faktor pemilih track

- Banyaknya tipe pengguna dan role/permission.
- Sensitivitas data yang disimpan atau dikirim.
- Pembayaran, transaksi, atau dampak finansial.
- Integrasi eksternal dan ketergantungan vendor.
- Offline-first, sinkronisasi, konflik data, dan background jobs.
- Kebutuhan real-time, availability, dan skala.
- Kewajiban regulasi atau kebijakan organisasi.
- Kompleksitas platform dan distribusi aplikasi.
- Ukuran tim, pengalaman, serta waktu/budget.

Pengguna dapat menaikkan atau menurunkan kedalaman. Sistem harus menjelaskan konsekuensi perubahan tersebut.

---

## 7. Alur Utama: Dari Ide ke Implementasi

### Tahap 0 — Idea Intake & Project Profile

**Tujuan:** menangkap ide tanpa membuat pengguna harus menyiapkan dokumen lebih dahulu.

Data awal:
- Nama sementara proyek.
- Deskripsi ide dengan bahasa pengguna sendiri.
- Masalah yang diduga ada.
- Siapa yang mungkin mengalami masalah.
- Platform yang dibayangkan, jika sudah tahu.
- Kendala waktu, biaya, skill, dan teknologi.
- Hal yang diketahui, asumsi, serta ketidakpastian awal.

**Output:** `PROJECT_BRIEF.md` versi awal dan daftar pertanyaan terbuka.

**Gate:** pengguna dapat menjelaskan ide secara kasar; tidak harus sudah yakin dengan solusi.

### Tahap 1 — Problem Discovery & Validation

Pertanyaan yang dibantu sistem:
- Masalah apa yang terjadi sekarang?
- Siapa yang mengalami dan seberapa sering?
- Bagaimana masalah diselesaikan saat ini?
- Mengapa solusi yang ada belum memadai?
- Apa bukti yang tersedia dan asumsi apa yang belum diuji?
- Apa risiko membangun produk yang ternyata tidak dibutuhkan?

Bukti validasi dapat berupa observasi, wawancara, analitik yang tersedia, prototipe, eksperimen, atau riset sekunder. Sistem tidak boleh mengarang data pengguna atau menyatakan ide tervalidasi tanpa bukti.

**Output kondisional:** problem statement, user/problem assumptions, competitor/alternative notes, validation experiment, success signal.

**Gate:** problem dan target pengguna cukup jelas atau risiko ketidakpastian dicatat secara eksplisit.

### Tahap 2 — Product Definition

Tentukan:
- Product vision dan ringkasan nilai utama.
- Target persona / kelompok pengguna.
- Goals dan success metrics.
- Scope in-scope dan out-of-scope.
- MVP dan alasan prioritasnya.
- Business model jika relevan.
- Constraint, asumsi, risiko, serta dependensi.

**Output:** `PRODUCT_BRIEF.md` dan `PRD.md`.

**Gate:** tujuan, pengguna sasaran, ruang lingkup versi pertama, serta ukuran keberhasilan tidak saling bertentangan.

### Tahap 3 — Requirements & Business Rules

Turunkan kebutuhan menjadi:
- Functional requirements dengan ID stabil (contoh `FR-001`).
- Non-functional requirements (contoh `NFR-SEC-001`, `NFR-PERF-001`).
- User stories / jobs-to-be-done yang dapat dikerjakan.
- Acceptance criteria yang dapat diverifikasi.
- Business rules dan validasi.
- Roles, permissions, serta kebutuhan audit bila relevan.
- Error/exception paths untuk alur kritis.
- Traceability antara kebutuhan dan fitur.

Gunakan pola Given/When/Then bila memperjelas perilaku, bukan sebagai format wajib untuk semua requirement.

**Gate:** fitur prioritas memiliki outcome dan kondisi diterima yang dapat diuji.

### Tahap 4 — UX, Navigation & Interaction Design

Sebelum visual detail, tentukan:
- Information architecture dan navigasi.
- User journey dan user flow.
- Daftar layar / halaman serta tujuan tiap layar.
- Wireframe atau prototipe bila dibutuhkan.
- State loading, success, empty, error, disabled, permission denied, dan offline bila relevan.
- Form validation, destructive actions, undo/recovery, serta feedback.
- Responsive/adaptive behavior.
- Aksesibilitas dan pola interaksi platform.

**Output kondisional:** `USER_FLOWS.md`, `SCREEN_INVENTORY.md`, `UX_RULES.md`, diagram Mermaid, atau tautan desain eksternal.

**Gate:** alur utama dapat diceritakan dari awal sampai hasil akhir, termasuk alur gagal yang penting.

### Tahap 5 — Domain, Data & Integration Design

**Jangan mulai dari membuat tabel database tanpa memahami domain.** Pertama identifikasi entitas, peraturan bisnis, ownership, lifecycle, dan cara data dibaca/diubah.

Periksa:
- Entitas dan relasi domain.
- Sumber kebenaran data.
- Data yang disimpan, disimpan di mana, dan untuk berapa lama.
- Klasifikasi data sensitif.
- Mode online/offline, cache, sinkronisasi, konflik, dan penghapusan.
- Kebutuhan migrasi, backup, restore, dan ekspor.
- API atau integrasi eksternal.
- Event, job, webhook, file upload, dan notifikasi bila relevan.

**Pilih artefak sesuai kebutuhan:** domain model, ERD, skema tabel, data dictionary, API contract, integration contract, event catalog, sync strategy.

**Gate:** data penting, ownership, lifecycle, dan alur yang membutuhkan penyimpanan sudah dipahami. Database fisik tidak wajib untuk website statis atau prototipe yang memang tidak menyimpan data.

### Tahap 6 — Architecture, Security & Quality Attributes

Jawab pertanyaan arsitektur yang benar-benar relevan:
- Apa saja sistem, container, komponen, dan integrasi utama?
- Di mana business logic sebaiknya ditempatkan?
- Bagaimana batas modul dan dependency direction?
- Apa alasan memilih stack dan alternatif yang ditolak?
- Apa titik kegagalan dan single point of failure?
- Bagaimana autentikasi, otorisasi, secrets, dan validasi input ditangani?
- Data apa yang perlu dilindungi dan dari ancaman apa?
- Apa kebutuhan performance, reliability, scalability, observability, dan biaya?

Gunakan C4 secara proporsional: diagram system context dan container biasanya cukup untuk gambaran awal; component diagram hanya ketika menambah kejelasan. Catat keputusan material menggunakan ADR.

**Output kondisional:** `SYSTEM_ARCHITECTURE.md`, diagram C4, `ADR-*.md`, threat model, security checklist, quality attributes, deployment overview.

**Gate:** risiko arsitektur terbesar terlihat dan keputusan yang sulit dibalik sudah dicatat beserta trade-off.

### Tahap 7 — Delivery Planning & Backlog

- Prioritaskan scope dengan pendekatan yang dipilih (misalnya MoSCoW atau impact/effort).
- Bagi pekerjaan menjadi vertical slices yang menghasilkan fungsi end-to-end.
- Tentukan dependencies dan urutan implementasi.
- Hindari task raksasa seperti “buat seluruh backend”.
- Tentukan Definition of Ready dan Definition of Done yang proporsional.
- Petakan requirement → story → task → test.
- Tetapkan checkpoint verifikasi setiap slice.

**Output:** `IMPLEMENTATION_PLAN.md`, `BACKLOG.md`, `DEFINITION_OF_DONE.md`, dependency notes.

**Gate:** developer tahu slice pertama yang akan dibangun, apa yang termasuk, apa yang tidak, dan bagaimana membuktikannya selesai.

### Tahap 8 — Implementation Readiness

Sebelum coding, sistem menghasilkan ringkasan siap implementasi:
- Tujuan slice pertama.
- File/modul yang kemungkinan akan disentuh (sebagai rencana, bukan klaim pasti).
- Data contract/API contract yang relevan.
- Acceptance criteria dan test cases.
- Batasan agar agent tidak memperluas scope.
- Instruksi agent untuk membaca dokumen yang relevan.
- Pertanyaan terbuka yang benar-benar menghalangi implementasi.

**Gate:** tidak ada ambiguitas blocker untuk slice pertama; isu non-blocker ditandai sebagai asumsi atau follow-up.

### Tahap 9 — Build, Verify & Review

Ini menjadi alur kerja berulang, bukan satu tahap sekali lewat:
1. Ambil satu vertical slice yang kecil.
2. Baca requirement, kontrak, dan ADR terkait.
3. Periksa kondisi repository saat ini.
4. Implementasikan perubahan minimal yang diperlukan.
5. Jalankan lint, type checks, unit/integration/UI tests sesuai proyek.
6. Verifikasi acceptance criteria dan jalur regresi terkait.
7. Tinjau keamanan, aksesibilitas, dan performa sesuai risiko.
8. Perbarui dokumentasi serta status traceability.
9. Catat keputusan baru atau perubahan scope.

Sistem ini tidak harus menjadi IDE. Untuk versi awal cukup menyiapkan task dan prompt implementasi serta menerima status/verifikasi yang dimasukkan pengguna.

### Tahap 10 — Release, Operate & Learn

Checklist disesuaikan dengan target:
- Konfigurasi environment dan secrets.
- Build/test pipeline CI.
- Schema/data migration dan rencana rollback.
- Backup/restore untuk data penting.
- Logging, error reporting, monitoring, dan alerting bila perlu.
- Security verification.
- Accessibility dan performance checks.
- Release channel, versioning, store submission, atau deployment.
- Privacy notice/consent dan kebijakan retensi bila relevan.
- Feedback loop dan post-release review.

**Output:** `RELEASE_CHECKLIST.md`, `OPERATIONS_RUNBOOK.md`, release notes, monitoring plan, retrospective.

---

## 8. Perbedaan Perencanaan per Platform

| Area | Shared core | Web | Mobile native/cross-platform | Backend/API |
|---|---|---|---|---|
| Problem, persona, scope | Ya | Tidak diulang | Tidak diulang | Tidak diulang |
| Navigation / interaction | Prinsip umum | URL, routing, responsive, browser behavior, SEO bila relevan | Tab/stack, gestures, lifecycle, deep links, adaptive layouts | Kontrak API, event, error semantics |
| Data | Domain, ownership, lifecycle | Server/client state, cache, cookies/session | Local storage, secure storage, offline sync | Persistence, queues, consistency, migrations |
| Security | Threat/risk baseline | XSS, CSRF, session, access control, headers | Permissions, device storage, platform integrations, app integrity | AuthN/AuthZ, rate limits, idempotency, object authorization |
| Quality | NFR, accessibility, privacy | Web Vitals, browser/device matrix, semantic HTML | Startup, crash, lifecycle, OS/device matrix, battery/network | Latency, throughput, availability, resiliency |
| Release | Goals dan risiko | Hosting, domains, rollback | Signing, app stores, versioning, staged rollout | Deployment, migrations, observability |

### Track Web

Checklist tambahan yang dapat aktif:
- Public/private routes, routing, URL structure, metadata/SEO bila relevan.
- Responsive breakpoints dan browser support.
- Rendering strategy (server/client/static) berdasarkan kebutuhan, bukan tren.
- Form semantics, keyboard access, focus states, screen reader behavior.
- Core Web Vitals/performance budgets jika relevan.
- Cache invalidation, session handling, CSRF/XSS, secure headers, authorization.
- Upload validation, rate limiting, abuse prevention, backup, error monitoring.

### Track Mobile

Checklist tambahan yang dapat aktif:
- Android/iOS target minimum dan device/form-factor support.
- Native vs cross-platform beserta alasan, kemampuan tim, plugin/dependency risk.
- Permission minimization, secure storage, offline-first, synchronization, conflict resolution.
- App lifecycle, background execution, push notifications, deep links, universal/app links.
- Font scaling, accessibility labels, safe areas, keyboard, orientation, tablet/foldable layouts.
- Crash reporting, release tracks, app signing, store metadata, privacy disclosures.
- OS/device test matrix dan update policy.

### Track Backend/API

Checklist tambahan yang dapat aktif:
- API contract, versioning, authentication/authorization, object-level access controls.
- Pagination, filtering, sorting, errors, idempotency, retries, rate limiting.
- Data migration, queue behavior, timeout, circuit breaker bila diperlukan.
- Observability, audit trails, backup/restore, incident response, resource limits.

### Track Multi-platform

Sistem harus memisahkan business rules yang memang dapat dibagi dari interaksi dan batasan platform. Jangan mengasumsikan semua UI, storage, atau kemampuan perangkat harus identik. Catat contract bersama (domain/API) dan divergence per platform.

---

## 9. Modul Produk

### 9.1 Project Dashboard

- Daftar proyek, status tahapan, langkah berikutnya, blocker, dan risiko terbuka.
- Filter: aktif, diarsipkan, platform, status readiness.
- Ringkasan tidak boleh menyamarkan blocker sebagai angka kemajuan yang tinggi.

### 9.2 Create Project Wizard

- Input ide bebas.
- Tipe produk/platform.
- Kategori aplikasi dan konteks pengguna.
- Mode proyek: Quick, Standard, Advanced.
- Tingkat sensitivitas data, autentikasi, pembayaran, offline, integrasi, AI/ML, real-time, dan skala.
- Waktu, budget, tim, skill, serta preferensi teknologi.
- Field dapat dilewati; nilai yang tidak diketahui menjadi open question, bukan ditebak.

### 9.3 Idea Interviewer

- Satu pertanyaan utama per giliran.
- Ingat jawaban yang sudah diberikan.
- Hindari mengulang pertanyaan yang sudah terjawab.
- Kelompokkan fakta, asumsi, hipotesis, keputusan, dan pertanyaan terbuka.
- Dapat menyarankan langkah validasi.
- Memungkinkan pengguna menjawab “belum tahu” dan menerima bantuan untuk memilih.

### 9.4 Workflow & Stage Gates

- Timeline/stepper tahapan.
- Tahapan required, recommended, atau not applicable.
- Setiap gate menampilkan kriteria lulus dan alasannya.
- Gate dapat berstatus `not_started`, `in_progress`, `blocked`, `ready_for_review`, `approved`, atau `not_applicable`.
- Pengguna dapat kembali ke tahapan sebelumnya; sistem menilai dampak perubahan.

### 9.5 Artifact Workspace

- Editor Markdown dengan preview.
- Autosave dengan indikasi saved/unsaved/error.
- Versi artefak dan riwayat perubahan.
- Status draft/review/approved/superseded.
- Sumber fakta dan pertanyaan terkait.
- Link lintas artefak berdasarkan ID.
- Regenerate per section, bukan memaksa mengganti seluruh dokumen.
- Perbandingan versi dan pemulihan versi sebelumnya.

### 9.6 Requirement Traceability

- Requirement diberi ID stabil.
- Requirement dapat terkait ke fitur, user story, acceptance criteria, task, API/schema, dan test.
- Perubahan requirement menampilkan tautan terdampak yang diduga relevan.
- Tautan AI adalah saran sampai diverifikasi pengguna.

### 9.7 Decision & Risk Register

- Assumption log.
- Open question log.
- Decision log.
- Architecture Decision Records (ADR).
- Risk register dengan likelihood, impact, mitigation, owner, status.
- Tidak semua keputusan perlu ADR; ADR untuk pilihan berdampak luas atau mahal dibalik.

### 9.8 Backlog & Implementation Planner

- Epic/feature/story/task yang bisa diurutkan.
- Prioritas dan dependency.
- Vertical slice.
- Acceptance criteria dan test notes.
- Estimasi boleh opsional dan harus mencantumkan confidence/rationale.
- Export task ke Markdown; integrasi tool eksternal menjadi pengembangan lanjutan.

### 9.9 Prompt Workbench & Prompt Compiler — Modul Inti MVP

Ini adalah fitur inti yang menentukan nilai produk. Pengguna harus keluar dari setiap tahap dengan prompt yang benar-benar siap dipakai, bukan hanya daftar pertanyaan.

**Fungsi utama:**
- Menampilkan prompt template berdasarkan kategori dan tahap workflow.
- Mengumpulkan jawaban melalui wizard/form dinamis; pertanyaan yang muncul dipilih berdasarkan jawaban terdahulu, platform, risiko, dan template yang dibutuhkan.
- Memetakan jawaban ke variable paths yang stabil, misalnya `project.name`, `project.platforms`, `product.problem`, `constraints.offline_first`, `decisions.database`, atau `requirements.approved[]`.
- Menggabungkan global rules + konteks proyek + template tahap + adapter platform + output approved upstream + instruksi khusus run.
- Mendukung section conditional, daftar berulang, optional section, default, serta jawaban `unknown/not_decided` tanpa mengarang nilainya.
- Menyediakan preview prompt lengkap sebelum copy/export.
- Memungkinkan edit prompt final untuk satu run tanpa mengubah template sumber.
- Menyimpan riwayat generation beserta versi template dan snapshot konteks yang digunakan.
- Menampilkan `Copy Prompt`, download `.md`, dan `Add to Prompt Chain`.
- Mendukung prompt tunggal serta `Prompt Pack` untuk beberapa tahap berurutan.
- Menyediakan output slot untuk respons dari agent eksternal: paste teks atau unggah file `.md`, bandingkan, review, lalu approve atau reject.
- Menandai prompt/artefak downstream sebagai `stale` ketika sumber upstream yang disetujui berubah.

**Isi minimal setiap prompt hasil kompilasi:**
1. Peran dan tujuan agent.
2. Ringkasan proyek dan status konteks.
3. Fakta yang diketahui, asumsi, keputusan approved, dan open questions.
4. Konteks/artefak terdahulu yang relevan beserta versi/ID.
5. Objective untuk tugas saat ini.
6. Scope dan non-goals.
7. Langkah kerja berurutan.
8. Platform/stack constraints yang relevan.
9. Expected output dan format hasil.
10. Acceptance criteria dan verifikasi/test expectations.
11. Aturan keamanan, kompatibilitas, serta larangan mengarang hasil.
12. Cara menangani konflik, data yang hilang, dan pertanyaan blocker.
13. Ringkasan update yang harus diberikan agent setelah selesai.

**Template prompt awal yang diprioritaskan:**
- `P-00` Idea Clarification & Problem Discovery.
- `P-01` Product Brief & MVP Scope.
- `P-02` PRD Review/Generation.
- `P-03` Requirements, User Stories & Acceptance Criteria.
- `P-04W` Web UX / User Flow / Page Inventory.
- `P-04M` Mobile UX / Screen Flow / Device Capability.
- `P-05` Domain, Data Model & API Contract.
- `P-06` Architecture, ADR & Security Review.
- `P-07` Implementation Roadmap & Backlog.
- `P-08` Repository Audit & Implementation Readiness.
- `P-09` One Vertical Implementation Slice.
- `P-10` Debug / Root-Cause Analysis.
- `P-11` Code Review / Security Review / Regression Tests.
- `P-12` Release Readiness.

**Validasi compiler sebelum prompt dapat ditandai siap:**
- Tidak ada required variable yang hilang tanpa representasi ketidakpastian yang eksplisit.
- Tidak ada unresolved syntax token/placeholder.
- Semua upstream prerequisite wajib sudah approved atau diberi override dengan alasan.
- Konflik keputusan ditampilkan, tidak disembunyikan.
- Tidak ada credential/API key/secret yang masuk ke prompt.
- Prompt mencakup kontrak output, scope, non-goals, dan mekanisme verifikasi.
- Snapshot/context sources dan versi template tercatat.

AI-assisted generation boleh ditambahkan, tetapi tidak boleh menggantikan compiler deterministik dan validasi dasar.

### 9.9A Template Registry & Prompt Chain

- Katalog template dengan filter tahap, platform, kategori, complexity track, status, dan versi.
- Metadata prerequisite, next template, input schema, output contract, dan allowed context sources.
- Graph dependency untuk prompt chain; cegah circular dependency.
- Template bawaan bersifat versioned/read-only; pengguna mengkloning untuk custom version.
- Preview variabel terisi dan bagian yang diaktifkan/dilewati sebelum compile.
- Validasi sintaks dan variable coverage pada waktu pembuatan/edit template.
- Uji template dengan fixture untuk memeriksa output pada kasus web, mobile, unknown answer, dan konflik.
- Ekspor prompt chain ke folder berurutan dengan `PROMPT_CHAIN_INDEX.md`.

### 9.9B External Agent Handoff

MVP tidak perlu mengeksekusi semua agent dalam produk. Handoff awal harus sederhana dan eksplisit:
1. Copy/download prompt.
2. Jalankan di Codex/Cursor/Antigravity atau agent lain.
3. Paste/upload hasil agent ke slot hasil tahap.
4. Review perubahan yang akan masuk ke project context.
5. Approve/reject; hanya approved output digunakan pada compile berikutnya.

Integrasi API dengan agent/provider dapat menjadi fase berikutnya dan tidak boleh menjadi dependency untuk fungsi copy/export.

### 9.10 Export Center

- Export satu artefak menjadi `.md`.
- Export seluruh paket menjadi `.zip`.
- Pilih subset dokumen untuk konteks AI.
- Sertakan `README.md`/index dengan deskripsi dan urutan baca.
- Sertakan versi dokumen dan tanggal ekspor.
- Jangan mengekspor API key, secrets, token, atau data sensitif yang bukan bagian artefak.

### 9.11 Templates

Template awal yang berguna:
- Simple website / landing page.
- CRUD/admin dashboard.
- SaaS/full-stack application.
- Offline-first personal mobile app.
- UMKM/POS/inventory app.
- E-commerce/transactional app.
- Public API/backend service.
- AI-enabled application.
- Data science/ML application.

Template adalah starter yang dapat diubah, bukan aturan universal.

---

## 10. Output Dokumen per Proyek

Nama file final harus konsisten dan dapat diekspor. Artefak yang tidak relevan tidak perlu dibuat.

### Paket minimum (Quick Track)

```text
project-docs/
├── README.md
├── PROJECT_BRIEF.md
├── SCOPE_AND_FLOWS.md
├── IMPLEMENTATION_PLAN.md
└── TEST_CHECKLIST.md
```

### Paket standar

```text
project-docs/
├── README.md
├── PROJECT_BRIEF.md
├── PRODUCT_BRIEF.md
├── PRD.md
├── REQUIREMENTS.md
├── USER_FLOWS.md
├── UX_RULES.md
├── DOMAIN_AND_DATA_MODEL.md
├── SYSTEM_ARCHITECTURE.md
├── SECURITY_AND_PRIVACY.md
├── ADR/
│   └── ADR-0001-example-decision.md
├── IMPLEMENTATION_PLAN.md
├── BACKLOG.md
├── TEST_STRATEGY.md
├── RELEASE_CHECKLIST.md
└── OPEN_QUESTIONS_AND_ASSUMPTIONS.md
```

### Paket advanced

Tambahkan sesuai risiko: `THREAT_MODEL.md`, `API_CONTRACT.md`, `DATA_DICTIONARY.md`, `MIGRATION_AND_ROLLBACK.md`, `OBSERVABILITY_PLAN.md`, `OPERATIONS_RUNBOOK.md`, `DISASTER_RECOVERY.md`, `ACCESSIBILITY_PLAN.md`, serta security verification matrix.

### Paket prompt — keluaran utama produk

```text
prompt-pack/
├── README.md
├── PROJECT_CONTEXT.md
├── PROMPT_CHAIN_INDEX.md
├── 00_idea_clarification.md
├── 01_product_brief_mvp.md
├── 02_prd.md
├── 03_requirements_acceptance_criteria.md
├── 04_platform_ux.md
├── 05_domain_data_api.md
├── 06_architecture_security.md
├── 07_implementation_plan.md
├── 08_repository_audit.md
├── 09_implementation_slice.md
├── 10_debug_root_cause.md
├── 11_review_regression.md
└── 12_release_readiness.md
```

Daftar file aktual dibentuk sesuai platform, kedalaman, dan template yang dipilih. Web-only tidak memasukkan prompt mobile; proyek tanpa backend dapat melewati prompt data/API dengan alasan. Index harus menyebut urutan, prerequisite, tujuan, input yang disarankan, serta status prompt. Setiap prompt yang diekspor berdiri sendiri cukup untuk digunakan, tetapi juga menautkan ID artefak pendukung jika paket lengkap tersedia.

### Kontrak isi dokumen

Setiap dokumen harus menyertakan:
- Tujuan dan ruang lingkup dokumen.
- Status dan tanggal update.
- Sumber/proyek yang menjadi dasar.
- Istilah penting jika dibutuhkan.
- Hal yang terkonfirmasi, asumsi, dan unresolved items.
- ID referensi yang stabil jika dokumen memiliki entitas yang dapat ditelusuri.
- Tautan relatif ke artefak terkait bila diekspor dalam satu paket.

---

## 11. Arsitektur Teknis yang Direkomendasikan untuk Produk Ini

Ini adalah baseline yang perlu divalidasi saat implementasi; bukan alasan untuk mengabaikan kondisi repository yang sudah ada.

### Frontend dan application layer

- Next.js App Router + TypeScript.
- Tailwind CSS dan shadcn/ui atau sistem komponen setara untuk UI konsisten.
- Server Components untuk rendering/fetching yang cocok; Client Components hanya pada bagian yang memerlukan interaksi/browser API.
- Validasi input dengan skema bersama (contoh: Zod atau alternatif yang aktif dipelihara).

### Arsitektur

- Modular monolith dengan domain seperti `projects`, `project-context`, `workflow`, `template-registry`, `prompt-compiler`, `prompt-chain`, `agent-results`, `artifacts`, `requirements`, `decisions`, `backlog`, `ai-assistance`, dan `exports`. Prompt compilation dan chain adalah domain utama; `ai-assistance` opsional.
- Pisahkan UI, application/use-case, domain rules, dan data access secukupnya; jangan menambah layer yang tidak memberi nilai.
- Gunakan interface/provider abstraction untuk AI dan penyimpanan dokumen.
- Hindari business logic utama tersebar di komponen UI.
- Jangan memecah menjadi microservices pada tahap awal.

### Persistensi

- Jika produk akan digunakan lintas perangkat dan menyimpan banyak proyek, PostgreSQL adalah baseline yang masuk akal.
- Gunakan ORM/migration tool yang masih didukung dan cocok dengan versi framework/database yang dipilih.
- Semua perubahan schema disimpan sebagai migration yang dapat ditinjau.
- Tetap sediakan ekspor agar pengguna tidak terkunci pada satu database atau vendor.
- Jika penggunaan awal benar-benar lokal dan satu pengguna, pilihan penyimpanan dapat disederhanakan melalui ADR; jangan mengklaim cloud sync sebelum dibangun.

### Authentication dan data protection

- Jika di-deploy dengan data personal, implementasikan autentikasi dan isolation data sejak awal.
- Gunakan library autentikasi yang terpelihara; jangan membuat session system kriptografis sendiri tanpa kebutuhan dan review.
- Secrets disimpan di environment/server secret store, bukan repository atau dokumen ekspor.
- Jangan menaruh credential/session token di browser storage yang tidak cocok untuk secrets.
- Semua akses ke project/artifact harus memeriksa authorization di server.

### AI integration

- Prompt compiler deterministic tidak memerlukan provider. Pisahkan layanan compile/template/context dari AI-provider integration.
- Provider adapter interface dan provider pertama dipilih kemudian setelah docs, biaya, privasi, serta kemampuan structured output diverifikasi.
- API key dapat dikelola melalui environment atau mekanisme BYOK yang aman; jangan pernah log nilai kunci.
- AI hanya menambah nilai untuk wawancara adaptif, rekomendasi, ekstraksi hasil agent, dan deteksi konflik; jangan jadikan fallback manual sebagai pengalaman yang sengaja dipangkas.
- Gunakan output schema terstruktur jika memungkinkan, validasi hasil AI, dan jangan langsung menyimpan perubahan besar tanpa review.
- Redaksi data rahasia dan batasi konteks yang dikirim ke provider.
- Catat provider/model, waktu, status, dan metadata yang aman; jangan simpan secret atau payload sensitif tanpa kebutuhan.

### Quality toolchain

- Unit/domain tests: Vitest atau framework setara yang kompatibel dengan stack.
- End-to-end tests: Playwright atau alternatif setara.
- Lint, formatting, type checking, dependency/security checks.
- CI untuk memastikan build dan tests lulus pada perubahan penting.
- Observability dan error reporting sesuai kebutuhan deployment.

### Catatan versi

AI agent yang melakukan implementasi wajib memeriksa dokumentasi resmi dan versi stabil yang tersedia saat mulai bekerja. Jangan menyalin nomor versi dari dokumen ini sebagai jaminan kompatibilitas.

---

## 12. Struktur Folder Aplikasi (Usulan Awal)

Struktur final harus mengikuti kemampuan stack yang benar-benar dipilih. Berikut baseline modular monolith, bukan aturan universal:

```text
src/
├── app/                         # routes, layouts, route handlers bila diperlukan
├── components/
│   ├── ui/                      # primitive/reusable UI components
│   └── shared/                  # komponen lintas domain
├── features/
│   ├── projects/
│   ├── workflow/
│   ├── artifacts/
│   ├── requirements/
│   ├── architecture-decisions/
│   ├── backlog/
│   ├── prompt-studio/
│   ├── template-registry/
│   ├── prompt-chain/
│   ├── agent-results/
│   └── exports/
├── domain/                      # shared domain rules/types bila memang lintas fitur
├── lib/
│   ├── auth/
│   ├── db/
│   ├── prompt-compiler/
│   ├── ai-provider/              # optional for MVP core
│   ├── validation/
│   └── observability/
├── server/                      # server-only use cases/services bila membantu batas keamanan
└── styles/

prisma-or-db/                    # schema/migrations menurut tool pilihan
public/
tests/
├── unit/
├── integration/
└── e2e/
docs/
├── product/
├── architecture/
├── security/
└── decisions/
```

Hindari membuat folder `utils` atau `services` raksasa yang menampung semua hal. Hindari duplikasi source of truth. Jangan menambah struktur kompleks tanpa kebutuhan yang nyata.

---

## 13. Model Domain Awal

Entitas berikut adalah kandidat untuk desain awal. Normalisasi, hubungan, dan field final harus diputuskan setelah alur produk divalidasi.

- **User:** identitas akun bila autentikasi diaktifkan.
- **Workspace:** batas kepemilikan data; versi awal dapat hanya memiliki satu owner tetapi desain harus menghindari kebocoran data antar-user.
- **Project:** metadata, idea, status, project tier, constraints, selected platforms.
- **ProjectPlatform:** target platform dan konfigurasi track masing-masing.
- **WorkflowPhase:** state tahap/gate untuk sebuah proyek.
- **Artifact:** jenis dokumen, konten terkini, status, metadata.
- **ArtifactVersion:** snapshot/version history dokumen.
- **Requirement:** functional/non-functional requirements dengan stable ID.
- **TraceLink:** relasi antar requirement, story, task, test, ADR, artifact, atau komponen.
- **BacklogItem:** epic, feature, story, task, acceptance criteria, priority, dependencies, status.
- **DecisionRecord:** keputusan produk/teknis, rationale, alternatives, consequences, status.
- **Risk:** probability/likelihood, impact, mitigation, owner/status.
- **Assumption / OpenQuestion:** pernyataan yang belum terverifikasi atau belum dijawab.
- **GateEvaluation:** hasil evaluasi, checklist, evidence, blocker, reviewer, waktu.
- **Template:** template workflow, dokumen, atau prompt, berikut metadata applicability dan dependency.
- **TemplateVersion:** konten immutable dari suatu versi template, variable schema, aturan conditional, serta output contract.
- **ProjectAnswer:** jawaban terstruktur dengan variable path, tipe, sumber, status kepastian, dan timestamp.
- **ProjectContextSnapshot:** snapshot fakta, asumsi, keputusan, artifact versions, dan platform context yang dipakai untuk compile tertentu.
- **PromptGenerationRun:** template/version, snapshot context, compiled text, validation result, user edits, dan waktu generation.
- **PromptChainLink:** dependency antar tahap/prompt, expected output, status prerequisite, serta hubungan upstream/downstream.
- **AgentResult:** hasil agent eksternal yang di-paste/upload, status review, parsed fields, dan approval history.
- **AIInteraction:** metadata aktivitas AI yang diperlukan untuk history/audit tanpa menyimpan data lebih dari yang diperlukan.
- **ExportRecord:** metadata export dan snapshot versi yang diekspor.

### Aturan integritas

- Setiap data milik proyek memiliki relasi ownership yang jelas.
- Penghapusan dan arsip mengikuti kebijakan konsisten dan tidak meninggalkan referensi rusak.
- ID artefak, requirement, template, template version, prompt run, dan chain link stabil serta tidak berubah hanya karena judul diedit.
- Setiap prompt generation mencatat versi template dan snapshot konteks yang benar-benar digunakan; prompt run yang telah dibuat tidak berubah diam-diam saat project context diperbarui.
- Hanya `approved` agent result yang dapat menjadi sumber konteks resmi untuk prompt downstream.
- Perubahan upstream menandai downstream prompt/artefak sebagai `stale`; regenerasi membutuhkan review pengguna.
- Perubahan yang memutus traceability ditandai.
- Migrasi schema memiliki review dan prosedur uji.

---

## 14. Kebutuhan Fungsional Utama

### Project management

- **FR-PROJ-001:** pengguna dapat membuat, mengubah, mengarsipkan, dan menghapus proyek sesuai konfirmasi.
- **FR-PROJ-002:** proyek memiliki platform target, kedalaman proses, tujuan, batasan, dan status.
- **FR-PROJ-003:** pengguna dapat melanjutkan proyek dari tahapan terakhir.

### Workflow

- **FR-FLOW-001:** sistem menampilkan tahap, status, output yang diharapkan, dan next action.
- **FR-FLOW-002:** gate menjelaskan blocker secara eksplisit.
- **FR-FLOW-003:** pengguna dapat menandai item not applicable dengan alasan.
- **FR-FLOW-004:** perubahan scope dapat memicu analisis dampak.

### Artifact

- **FR-ART-001:** sistem membuat dokumen dari template atau output AI.
- **FR-ART-002:** pengguna dapat mengedit dan menyimpan dokumen.
- **FR-ART-003:** sistem menjaga versi dokumen dan memungkinkan pemulihan versi sebelumnya.
- **FR-ART-004:** sistem membedakan draft, approved, dan superseded.

### Prompt Compiler dan AI Assistance

- **FR-PROMPT-001:** pengguna dapat memilih dan mengisi prompt template melalui wizard/form kontekstual.
- **FR-PROMPT-002:** jawaban tersimpan sebagai data terstruktur yang dapat digunakan kembali oleh template lain tanpa menanyakan ulang hal yang sudah diketahui.
- **FR-PROMPT-003:** compiler menggabungkan global instructions, project context, stage template, platform adapter, approved upstream outputs, dan run override.
- **FR-PROMPT-004:** template mendukung required/optional variables, defaults, conditional sections, repeated lists, dan unknown/not-decided states.
- **FR-PROMPT-005:** pengguna dapat preview, edit, copy, dan download hasil compile sebagai `.md`.
- **FR-PROMPT-006:** setiap prompt run menyimpan template version dan immutable context snapshot.
- **FR-PROMPT-007:** prompt chain menerapkan prerequisites dan urutan yang jelas serta menampilkan input-output tiap tahap.
- **FR-PROMPT-008:** output agent eksternal dapat di-paste/upload, direview, dan di-approve/reject sebelum menjadi context resmi.
- **FR-PROMPT-009:** compiler mendeteksi placeholder kosong, konflik context, stale upstream, dan risiko secrets sebelum prompt siap digunakan.
- **FR-PROMPT-010:** perubahan jawaban/approved artifact menandai prompt downstream terkait sebagai stale.
- **FR-PROMPT-011:** pengguna dapat mengekspor prompt tunggal atau Prompt Pack `.zip` lengkap dengan index dan urutan.
- **FR-PROMPT-012:** template bawaan dapat dikloning/diversioning; edit pengguna tidak merusak versi bawaan.
- **FR-AI-001:** AI dapat melakukan wawancara ide kontekstual dengan satu pertanyaan utama pada satu waktu; mode manual tetap tersedia.
- **FR-AI-002:** output AI membedakan fakta, asumsi, rekomendasi, dan open questions.
- **FR-AI-003:** pengguna dapat menerima, mengedit, atau menolak saran AI.
- **FR-AI-004:** AI-assisted parsing/generation menggunakan schema validation dan review manusia.
- **FR-AI-005:** prompt compile/copy/export tetap bekerja tanpa API key/provider AI.

### Traceability dan change impact

- **FR-TRACE-001:** requirement dapat dihubungkan dengan backlog dan test.
- **FR-TRACE-002:** sistem dapat menampilkan requirement penting yang belum punya acceptance criteria/test.
- **FR-TRACE-003:** analisis dampak AI ditampilkan sebagai usulan; tidak melakukan perubahan massal tanpa persetujuan.

### Export

- **FR-EXP-001:** pengguna dapat mengunduh satu artefak `.md`.
- **FR-EXP-002:** pengguna dapat mengunduh paket dokumen proyek `.zip`.
- **FR-EXP-003:** paket memiliki index/README dan tautan antar dokumen yang valid.
- **FR-EXP-004:** ekspor tidak boleh menyertakan secrets atau credential internal.

---

## 15. Kebutuhan Non-Fungsional

- **Security:** authorization server-side, validasi input, dependency hygiene, secret management, dan perlindungan terhadap akses proyek yang salah.
- **Privacy:** kumpulkan data minimum; jelaskan apa yang dikirim ke AI provider; beri kontrol ekspor dan penghapusan.
- **Reliability:** perubahan dokumen tidak hilang diam-diam; tampilkan state autosave dan kegagalan penyimpanan.
- **Maintainability:** batas domain dan naming konsisten; hindari business logic di komponen UI; semua keputusan penting terdokumentasi.
- **Testability:** domain logic penting dapat diuji tanpa browser/database produksi.
- **Performance:** navigasi inti dan editor harus terasa responsif; ukur sebelum mengoptimasi secara spekulatif.
- **Accessibility:** antarmuka dapat dinavigasi menggunakan keyboard, punya focus state yang jelas, label yang bermakna, dan kontras yang memadai.
- **Portability:** pengguna dapat membawa dokumen proyek keluar sebagai Markdown.
- **Recoverability:** artefak dapat dipulihkan melalui version history; backup bergantung pada deployment.
- **Compatibility:** layout mendukung desktop dan mobile browser; matrix browser ditetapkan berdasarkan data penggunaan/target.

Target numerik untuk performance, availability, dan retention harus diisi saat kebutuhan deployment diketahui, bukan dikarang di awal.

---

## 16. Kriteria Penerimaan MVP

MVP belum dianggap selesai hanya karena halaman sudah tampil. Minimum acceptance criteria:

1. Pengguna dapat membuat proyek dari ide singkat dan menyimpan hasilnya.
2. Pengguna dapat menentukan platform dan mode kedalaman.
3. Sistem memberikan tahapan relevan dan menjelaskan next action.
4. Pengguna dapat membuat, mengedit, dan menyimpan artefak Markdown.
5. Status fakta/asumsi/open question dapat dibedakan.
6. Pengguna dapat melihat gate dan blocker tahap perencanaan.
7. Jawaban form dikompilasi menjadi prompt lengkap yang berbeda berdasarkan platform dan jawaban, bukan hasil template generik.
8. Prompt yang dikompilasi memiliki preview, copy, download `.md`, versi template, serta context snapshot.
9. Prompt Chain memastikan prompt PRD/arsitektur/implementasi yang dibuat berikutnya dapat merujuk output upstream yang sudah di-approve.
10. Jika ada required variable kosong, konflik, secret, atau prerequisite belum lulus, sistem menampilkan warning/blocker secara jelas.
11. Pengguna dapat memasukkan hasil dari AI agent eksternal, meninjaunya, dan menyetujui sebelum menjadi konteks tahap berikutnya.
12. Prompt pack `.zip` beserta index, urutan eksekusi, dan file `.md` berhasil diekspor dan diperiksa.
13. Template version dan riwayat prompt run dapat dilihat; perubahan source tidak mengubah prompt run lama.
14. Versi terdahulu artefak dapat dilihat/dipulihkan sesuai desain yang disetujui.
15. Data proyek tidak dapat dibaca oleh pengguna lain hanya dengan mengganti ID pada URL/request.
16. Alur inti compiler/chain diuji otomatis pada kasus normal, unknown, konflik, platform web/mobile, dan stale context.
17. Error/loading/empty state terlihat; pengguna tidak kehilangan perubahan secara diam-diam.
18. Aplikasi dapat dipakai pada desktop dan mobile browser.
19. Setup, environment variables, migrasi, pengujian, dan cara menjalankan dijelaskan di README.
20. Tidak ada secret yang di-commit atau masuk ke file ekspor.

### Definisi selesai (MVP)

- Acceptance criteria lulus.
- Lint, type check, test suite, dan production build yang sesuai lulus.
- Security/authorization checks untuk jalur data terkait dilakukan.
- Dokumentasi dan `.env.example` diperbarui.
- Perubahan tidak merusak jalur yang sebelumnya lulus; regression test dijalankan.
- Keterbatasan yang diketahui dicatat.

---

## 17. Desain Pengalaman Pengguna

### Navigasi utama yang disarankan

- Dashboard
- Projects
- Prompt Studio / Prompt Chain
- Template Library
- Context & Decisions
- Settings

Di dalam proyek:
- Overview
- Workflow
- Product & Requirements
- UX & Flows
- Data & Architecture
- Decisions & Risks
- Backlog & Tests
- Export

Jangan menampilkan semua submenu secara agresif kepada pengguna baru. Prioritaskan next step dan tampilkan detail saat dibutuhkan.

### Dashboard proyek harus menjawab

- Proyek ini bertujuan menyelesaikan apa?
- Di tahap mana saya berada?
- Apa langkah berikutnya?
- Apa blocker terbesar?
- Asumsi apa yang masih berisiko?
- Apakah saya siap mulai coding, dan mengapa?

### Readiness indicator

Jangan gunakan satu skor 0–100 yang tidak dapat dijelaskan sebagai penentu tunggal. Tampilkan:
- Gate pass / blocked / not assessed.
- Critical blockers.
- Missing artifacts yang diwajibkan oleh track.
- Open high-impact assumptions.
- Requirement yang tidak memiliki acceptance criteria.
- Kesiapan per slice, bukan hanya kesiapan proyek secara keseluruhan.

---

## 18. Rencana Implementasi Bertahap

### Phase 0 — Repository & feasibility audit

- Periksa apakah repository sudah ada.
- Baca semua instruksi agent dan dokumentasi aktif.
- Catat stack, scripts, struktur folder, tests, UI, data layer, auth, serta deployment yang ada.
- Jalankan checks yang sudah tersedia sebelum mengubah kode.
- Buat audit report, gap analysis, risiko, dan rencana fase.
- Jangan melakukan rewrite besar hanya karena agent menyukai pendekatan lain.

**Output:** `docs/audits/INITIAL_AUDIT.md`, proposed architecture/ADRs, baseline test report.

### Phase 1 — UX foundation & product shell

- App shell dan navigasi.
- Design tokens/components.
- Responsive behavior.
- Dashboard empty state dan create-project flow.
- Validasi visual dan accessibility dasar.

### Phase 2 — Project data & workflow engine

- Persistence, ownership boundaries, project CRUD.
- Project profile dan platform tracks.
- Stage states/gates dan next actions.
- Unit/integration tests untuk aturan workflow.

### Phase 3 — Template Registry & Deterministic Prompt Compiler

- Versioned prompt-template registry dan variable schema.
- Safe conditional rendering dan template validation.
- Context resolver serta immutable context snapshot.
- Prompt preview, edit per-run, copy, `.md` download, generation history.
- Compiler tests untuk web/mobile, unknown fields, missing required inputs, conflict, dan secret redaction.

### Phase 4 — Artifact workspace, requirements, decisions & traceability

- Requirement, backlog, ADR, assumption, risk.
- Trace links dan missing acceptance criteria checks.
- Change-impact proposal (awal dapat berbasis aturan eksplisit, bukan AI saja).

### Phase 5 — Prompt Chain & External Agent Handoff

- Prompt dependency graph dan prerequisite checks.
- Paste/upload result dari agent eksternal.
- Review, approve/reject, dan update project context.
- Stale downstream detection serta prompt pack export.

### Phase 6 — Optional AI assistance

- Provider interface.
- Idea interviewer adaptif.
- Structured extraction/recommendations dengan validation.
- Accept/reject/edit suggestion flow.
- Manual fallback dan privacy controls.

### Phase 7 — Export & delivery polish

- `.md` export.
- `.zip` export dengan index/link validation.
- Prompt package generator.
- Recovery/error handling.

### Phase 8 — Quality hardening

- Security review.
- Accessibility pass.
- E2E/regression tests.
- Performance measurements.
- Logging/backups/release procedure.

Fase dapat digabung jika aman untuk vertical slice yang kecil, tetapi quality gate tetap berlaku. Jangan membangun semua fase dalam satu perubahan raksasa.

---

## 19. Risiko Produk dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Workflow terlalu berat | Pengguna berhenti di perencanaan | Quick/Standard/Advanced, progressive disclosure, dokumen kondisional |
| AI menghasilkan dokumen meyakinkan tapi keliru | Keputusan salah masuk ke implementasi | Label fakta/asumsi, sumber, review manusia, schema validation |
| Semua platform dianggap sama | Checklist tidak relevan | Shared core + platform tracks |
| Terlalu cepat memilih database/stack | Overengineering atau migrasi sulit | Requirements/domain first, decision record, verify constraints |
| Perubahan dokumen membuat referensi rusak | Inconsistent project plan | Stable IDs, versioning, trace-link checks, impact review |
| Scope produk melebar menjadi project manager penuh | MVP tidak selesai | Batasi pada planning-to-agent handoff; integrasi eksternal nanti |
| Ketergantungan provider AI | Fitur inti berhenti bekerja | Provider abstraction dan manual mode |
| Data/secret bocor ke prompt atau export | Risiko privasi/keamanan | Context minimization, redaction, secure secret handling, export tests |
| Kompleksitas stack terlalu tinggi untuk solo developer | Sulit maintenance | Modular monolith, dependency minimal, vertical slicing |
| Dashboard memberi skor semu | Pengguna salah menganggap siap | Gate/blocker yang transparan dan readiness per slice |

---

## 20. Metrik Keberhasilan

MVP perlu mengukur nilai, bukan hanya jumlah fitur.

- **Time to first useful plan:** waktu dari ide dibuat sampai pengguna memiliki plan awal yang bisa ditindaklanjuti.
- **Planning completion:** proporsi proyek yang mencapai readiness untuk slice pertama.
- **Blocker discovery:** jumlah isu material yang ditemukan sebelum implementasi.
- **Artifact usefulness:** apakah pengguna memakai/export hasil artefak untuk coding agent.
- **Plan-to-build continuity:** berapa banyak proyek yang berpindah dari perencanaan ke slice implementasi pertama.
- **Rework due to ambiguity:** catatan subjektif/terukur tentang pengerjaan ulang karena scope atau requirement yang tidak jelas.
- **Export integrity:** paket ekspor dapat dibuka dan semua link internal valid.

Jangan mengoptimalkan jumlah checklist selesai jika tidak membuat keputusan dan implementasi lebih jelas.

---

## 21. Open Decisions yang Harus Diputuskan sebelum Implementasi Penuh

1. Apakah versi pertama single-user saja atau mendukung multi-user sejak awal? Rekomendasi: single-user experience dahulu, tetapi data ownership tetap eksplisit.
2. Provider AI pertama apa yang paling layak berdasarkan biaya, kemampuan structured output, privasi, dan akses pengguna? Periksa opsi saat implementasi.
3. Apakah AI menggunakan server-owned key atau BYOK? Jangan menyimpan key sebagai teks biasa.
4. Apakah artifact editor berupa editor Markdown murni atau rich-text? Rekomendasi awal: Markdown editor + preview agar ekspor stabil.
5. Apakah ekspor template dibuat satu dokumen gabungan atau paket folder? Rekomendasi: keduanya bila tidak mengganggu MVP.
6. Berapa banyak template yang harus disertakan pada rilis awal? Rekomendasi: 3–5 template yang berkualitas.
7. Kebutuhan deployment dan budget hosting apa yang berlaku? Putuskan setelah opsi biaya dan persistence dibandingkan.

AI agent tidak boleh menyamarkan keputusan ini sebagai fakta yang sudah final. Buat ADR atau keputusan produk saat jawabannya dikonfirmasi.

---

## 22. Referensi Inti

- Product Requirements Document — Atlassian: https://www.atlassian.com/agile/product-management/requirements
- Product Discovery — Atlassian: https://www.atlassian.com/agile/product-management/discovery/
- Agile principles: https://agilemanifesto.org/principles
- C4 model: https://c4model.com/
- C4 diagrams: https://c4model.com/diagrams
- NIST Secure Software Development Framework (SSDF): https://csrc.nist.gov/projects/ssdf
- NIST SP 800-218: https://csrc.nist.gov/pubs/sp/800/218/final
- AWS Well-Architected Framework: https://docs.aws.amazon.com/wellarchitected/latest/framework/definitions.html
- Android app architecture: https://developer.android.com/topic/architecture
- Android architecture recommendations: https://developer.android.com/topic/architecture/recommendations
- Apple Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines
- Android Core App Quality: https://developer.android.com/docs/quality-guidelines/core-app-quality
- OWASP ASVS: https://owasp.org/projects/asvs
- OWASP MASVS: https://mas.owasp.org/MASVS/
- OWASP API Security Top 10: https://api-security.owasp.org/editions/2023/en/0x11-t10/
- Web performance / Core Web Vitals: https://web.dev/explore/learn-core-web-vitals
- MDN Accessibility: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility
- Next.js App Router docs: https://nextjs.org/docs/app
- GitHub Actions: https://docs.github.com/en/actions
- Playwright: https://playwright.dev/docs/intro
- Vitest: https://vitest.dev/guide/
- OpenAI Prompt Engineering: https://developers.openai.com/api/docs/guides/prompt-engineering
- Anthropic Prompt Templates and Variables: https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables
- Cursor Rules: https://docs.cursor.com/context/rules
- GitHub Copilot Prompt Files / Custom Instructions: https://docs.github.com/en/copilot

---

**Catatan:** Dokumen ini merupakan source of truth awal untuk desain produk. Perbarui melalui keputusan yang eksplisit; jangan membiarkan hasil AI yang berbeda-beda menjadi sumber kebenaran yang saling bertentangan.

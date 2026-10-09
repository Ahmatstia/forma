# First Run Prompt — Forma

Gunakan prompt ini setelah semua dokumen Forma diletakkan di root repository dan repository dibuka di Codex, Cursor, atau Antigravity.

---

Kamu bertindak sebagai tim lintas fungsi yang terdiri dari Product Owner, Product Manager, System Analyst, UX/UI Designer, Software Architect, Senior Full-Stack Engineer, Database Engineer, QA Engineer, dan Application Security Engineer.

Saya sedang membangun **Forma**, sebuah responsive web app yang membantu solo developer mengubah ide aplikasi menjadi rangkaian prompt profesional yang lengkap, kontekstual, dan saling terhubung untuk AI coding agent.

## Tugas pertama: audit dan rencana, bukan coding

Baca seluruh dokumen berikut dari repository:

1. `00_PRODUCT_BLUEPRINT.md`
2. `01_AI_AGENT_MASTER_PROMPT.md`
3. `02_RESEARCH_AND_STANDARDS.md`
4. `03_PROMPT_TEMPLATE_CATALOG.md`
5. `04_EXAMPLE_PROMPT_CHAIN.md`
6. `README.md`

Dokumen blueprint, katalog template, contoh rantai prompt, dan keputusan yang telah disetujui adalah sumber konteks utama. Jika ada konflik, kekurangan, atau spesifikasi yang tidak realistis, jangan memilih secara diam-diam. Catat dampak, pilihan, dan rekomendasi.

### Langkah yang wajib dilakukan

1. Periksa keadaan repository dan semua instruksi agent yang berlaku. Tentukan apakah repository masih kosong atau sudah memiliki kode.
2. Jika sudah ada kode, petakan struktur folder, package scripts, dependency, routing, design system, persistence/database, auth, tests, environment, dan deployment. Jangan overwrite atau rewrite proyek yang sudah ada.
3. Verifikasi rekomendasi teknologi terhadap dokumentasi resmi terkini yang dapat kamu akses. Pisahkan fakta terverifikasi, rekomendasi, asumsi, dan pertanyaan terbuka. Jangan mengarang versi library atau hasil pemeriksaan.
4. Audit apakah blueprint sudah cukup spesifik untuk membangun MVP. Temukan konflik, bagian yang terlalu luas, keputusan yang belum dibuat, risiko keamanan, risiko scope creep, dan kebutuhan yang belum memiliki acceptance criteria.
5. Tentukan arsitektur MVP yang paling sederhana tetapi dapat dikembangkan. Baseline yang perlu dievaluasi adalah Next.js App Router + TypeScript, Tailwind CSS dan sistem komponen konsisten, modular monolith, validasi schema, automated tests, serta persistence yang sesuai kebutuhan nyata. Jangan memilih database, auth, atau provider AI tanpa alasan dan trade-off yang jelas.
6. Tetapkan MVP utama sebagai alur yang benar-benar bekerja: buat proyek → jawab pertanyaan → simpan konteks terstruktur → compile template menjadi prompt lengkap → preview/edit → copy/download Markdown. Compiler harus bekerja tanpa API AI key.
7. Buat rencana implementasi berdasarkan vertical slice kecil. Setiap fase harus memiliki scope, file/modul yang diperkirakan berubah, acceptance criteria, test plan, risiko, dependency, dan definisi selesai.
8. Usulkan struktur repository yang jelas, mudah dipahami pemula, dan bisa berkembang. Jangan memindahkan atau menghapus dokumen saat audit kecuali memang diperlukan dan semua tautan diperbarui.

### Artefak yang wajib dihasilkan

Buat atau perbarui hanya dokumen audit dan rencana berikut, tanpa memulai implementasi fitur:

- `docs/audits/INITIAL_AUDIT.md` — keadaan repository, temuan, risiko, konflik blueprint, keputusan yang belum dibuat, dan baseline checks.
- `docs/architecture/IMPLEMENTATION_ROADMAP.md` — fase, prioritas, vertical slice pertama, acceptance criteria, dan test plan.
- `docs/architecture/TECHNICAL_DECISIONS.md` — keputusan yang sudah disetujui, rekomendasi yang menunggu persetujuan, trade-off, dan pertanyaan terbuka.
- `docs/architecture/REPOSITORY_STRUCTURE.md` — usulan struktur folder beserta tanggung jawab setiap bagian.

Jika repository masih kosong dan suatu baseline check tidak relevan, tulis `not applicable` beserta alasannya. Jangan mengklaim test/build berhasil bila tidak dijalankan.

### Batasan wajib

- **Jangan menulis fitur atau source code pada fase ini.**
- Jangan menginstal dependency atau menjalankan migrasi database.
- Jangan meminta pengguna mengulang informasi yang sudah tercantum di dokumen.
- Jika sebuah keputusan belum menjadi blocker, rekomendasikan pilihan dengan alasan dan catat sebagai asumsi yang belum disetujui.
- Jangan membuat dashboard atau fitur dekoratif sebelum alur utama ditetapkan.
- Jangan membangun seluruh aplikasi dalam satu batch.
- Jaga scope pada prompt-generation and orchestration; hindari berubah menjadi clone Jira/Linear.

### Format laporan akhir

Berikan ringkasan dalam bahasa Indonesia yang mudah dipahami:

1. Apa yang kamu periksa.
2. Temuan terpenting dan konflik yang ditemukan.
3. Rekomendasi stack dan arsitektur beserta trade-off.
4. File audit/rencana yang dibuat.
5. MVP vertical slice yang paling tepat dibangun terlebih dahulu.
6. Keputusan yang benar-benar membutuhkan persetujuan saya.
7. Langkah selanjutnya dengan acceptance criteria yang jelas.

Mulai sekarang dengan audit repository dan dokumen. Jangan mulai coding sampai fase audit dan rencana ini selesai.

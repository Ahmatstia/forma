# Research Notes & Professional Standards

**Tanggal pemeriksaan:** 9 Oktober 2026  
**Tujuan:** mendokumentasikan sumber acuan yang membentuk desain Forma.  
**Cara menggunakan:** referensi ini adalah pedoman untuk menyesuaikan proses dengan konteks, bukan checklist yang wajib diterapkan semuanya pada setiap proyek.

---

## 1. Kesimpulan Riset

### 1.1 Product discovery perlu mendahului komitmen implementasi besar

Panduan product discovery menempatkan pemahaman kebutuhan, validasi nilai/feasibility, dan prioritas sebagai aktivitas berkelanjutan. PRD menjadi tempat menyelaraskan tujuan, pengguna, behavior, feature, dan success criteria—tetapi bukan seluruh blueprint engineering.

**Dampak pada produk:** Forma memulai dari masalah dan tujuan, lalu memproduksi PRD dan kebutuhan yang lebih konkret. Validasi ide ditampilkan sebagai tingkat bukti, bukan status otomatis “valid”.

Sumber:
- Atlassian, Product Discovery: https://www.atlassian.com/agile/product-management/discovery/
- Atlassian, Product Requirements Document: https://www.atlassian.com/agile/product-management/requirements
- Agile Principles: https://agilemanifesto.org/principles

### 1.2 Arsitektur sebaiknya dijelaskan pada tingkat abstraksi yang sesuai

C4 membagi diagram ke konteks sistem, container, component, dan code. Dokumentasi resminya menyatakan bahwa diagram context dan container sudah cukup untuk banyak tim; tidak semua proyek memerlukan semua tingkat.

**Dampak pada produk:** jangan menghasilkan diagram komponen atau class diagram secara otomatis pada setiap ide. Buat diagram saat membantu menjelaskan boundary, integrasi, dependency, atau keputusan material.

Sumber:
- C4 model: https://c4model.com/
- C4 diagrams: https://c4model.com/diagrams

### 1.3 Kualitas meliputi operasi, keamanan, reliability, performance, dan biaya

AWS Well-Architected menggunakan enam pilar: operational excellence, security, reliability, performance efficiency, cost optimization, dan sustainability. Kerangka tersebut juga menekankan trade-off sesuai konteks workload.

**Dampak pada produk:** NFR dan quality attributes harus diturunkan dari risiko dan tujuan bisnis. Jangan meminta semua proyek memiliki target availability enterprise; untuk proyek kecil, checklist sederhana dapat cukup.

Sumber:
- AWS Well-Architected definitions: https://docs.aws.amazon.com/wellarchitected/latest/framework/definitions.html
- Google Cloud Well-Architected Framework: https://docs.cloud.google.com/architecture/framework

### 1.4 Security perlu diintegrasikan sepanjang lifecycle

NIST SSDF mengelompokkan praktik ke empat area: mempersiapkan organisasi, melindungi software, menghasilkan software yang aman, serta merespons kerentanan. Ini menunjukkan keamanan tidak cocok diposisikan hanya sebagai tahap terakhir.

Untuk aplikasi web, OWASP ASVS dapat menjadi basis persyaratan teknis dan verifikasi. Untuk mobile, OWASP MASVS mencakup penyimpanan, kriptografi, autentikasi, komunikasi jaringan, interaksi platform, kualitas kode, resilience, dan privasi. Untuk API, OWASP API Security Top 10 menyoroti risiko seperti broken object-level authorization, broken authentication, dan resource consumption.

**Dampak pada produk:** security track aktif lebih awal berdasarkan data, auth, payment, API exposure, dan risiko. Persyaratan yang relevan ditautkan ke requirement serta test/security checklist.

Sumber:
- NIST SSDF project: https://csrc.nist.gov/projects/ssdf
- NIST SP 800-218: https://csrc.nist.gov/pubs/sp/800/218/final
- OWASP ASVS: https://owasp.org/projects/asvs
- OWASP MASVS: https://mas.owasp.org/MASVS/
- OWASP API Security Top 10: https://api-security.owasp.org/editions/2023/en/0x11-t10/

### 1.5 Web dan mobile berbagi kebutuhan produk tetapi berbeda dalam implementasi

Arsitektur Android menjelaskan pemisahan UI dan data layer, dengan domain layer yang bersifat opsional ketika diperlukan untuk kompleksitas/reuse. Pedoman Android quality juga meliputi bentuk perangkat dan ukuran layar. Apple HIG memberi panduan khusus platform terkait interaction, layout, materials, accessibility, dan komponen sistem.

**Dampak pada produk:** satu problem statement, requirement bisnis, dan domain rules dapat digunakan bersama. Namun, workflow UI, lifecycle, permission, offline storage, release process, screen patterns, serta platform security harus menjadi extension khusus.

Sumber:
- Android architecture: https://developer.android.com/topic/architecture
- Android architecture recommendations: https://developer.android.com/topic/architecture/recommendations
- Android Core App Quality: https://developer.android.com/docs/quality-guidelines/core-app-quality
- Apple Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines
- Apple accessibility guidance: https://developer.apple.com/design/human-interface-guidelines/accessibility

### 1.6 Web quality mencakup performance dan accessibility sejak awal

Core Web Vitals adalah metrik terkait pengalaman pengguna yang meliputi loading, responsiveness, dan visual stability. Panduan MDN menjelaskan accessibility perlu masuk ke workflow, termasuk semantic HTML, keyboard access, assistive technology, serta user testing.

**Dampak pada produk:** web track mempunyai checklist responsive design, rendering/caching sesuai kebutuhan, Core Web Vitals bila relevan, semantic forms, keyboard/focus handling, screen reader basics, dan browser support. Aksesibilitas tidak menjadi sekadar polish terakhir.

Sumber:
- web.dev Core Web Vitals: https://web.dev/explore/learn-core-web-vitals
- MDN Accessibility: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility
- MDN forms and buttons: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/HTML_forms

### 1.7 CI, testing, dan keputusan yang tercatat mencegah konteks hilang

GitHub Actions dapat menjalankan build/test pada pull request dan deployment setelah perubahan digabung. Playwright mendukung end-to-end testing web pada Chromium, WebKit, dan Firefox termasuk emulasi mobile. Vitest menyediakan test runner yang dapat diintegrasikan dengan JavaScript/TypeScript project.

**Dampak pada produk:** checklist build/release dan prompt implementasi memasukkan perintah verifikasi yang benar-benar sesuai repository. Dokumen ADR menyimpan konteks, opsi, keputusan, dan konsekuensi saat keputusan mahal untuk diubah.

Sumber:
- GitHub Actions overview: https://docs.github.com/en/actions
- Playwright: https://playwright.dev/docs/intro
- Vitest: https://vitest.dev/guide/
- ADR overview: https://techreport.ngo/architecture/architecture-decision-record/

### 1.8 Prompt engineering perlu diperlakukan sebagai template system, bukan sekadar prompt panjang

Panduan resmi OpenAI membedakan identitas/tujuan, instruksi, contoh, dan konteks sebagai komponen prompt yang perlu disusun jelas. Dokumentasi Anthropic membahas template dan variables, penggunaan instruksi yang spesifik, struktur output, serta bagian konteks yang terlabel. Dokumentasi Cursor dan GitHub Copilot juga menunjukkan pola instruksi/prompt reusable yang disimpan sebagai file dan dipakai ulang secara terarah. Ini mendukung pemisahan prompt ke komponen yang bisa dipakai ulang dan di-scope menurut tugas, bukan mengulang teks bebas secara manual.

**Dampak pada produk:**
- Template harus memiliki ID/version, metadata applicability, variable schema, prerequisite, output contract, dan aturan conditional.
- Data jawaban proyek harus terstruktur agar bisa di-reuse tanpa mengulang pertanyaan.
- Compiler menggabungkan instruksi reusable, konteks relevan, template spesifik tugas, platform track, dan kontrak output.
- Prompt generation disimpan dengan snapshot konteks; template yang berubah tidak boleh mengubah hasil generation lama.
- Hasil dari agent eksternal harus direview sebelum dijadikan konteks resmi berikutnya.
- MVP compiler sebaiknya deterministic dan provider-agnostic; API model menjadi fitur tambahan, bukan syarat untuk menyusun prompt.

Sumber:
- OpenAI, Prompt engineering: https://developers.openai.com/api/docs/guides/prompt-engineering
- Anthropic, Prompt templates and variables: https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables
- Cursor, Rules: https://docs.cursor.com/context/rules
- GitHub Copilot, Prompt files and custom instructions: https://docs.github.com/en/copilot

### 1.9 Stack perlu mengikuti kebutuhan dan diverifikasi pada waktu implementasi

Dokumentasi Next.js App Router menguraikan Server Components dan Client Components serta menyediakan konvensi struktur aplikasi. Teknologi dan versi terus berkembang; blueprint tidak boleh mengunci nomor versi tanpa pemeriksaan kompatibilitas aktual.

**Dampak pada produk:** Next.js + TypeScript adalah baseline yang masuk akal untuk web app full-stack modular monolith. Namun, AI agent wajib mengaudit repository dan memeriksa dokumentasi resmi terkini sebelum upgrade/menambah dependency. ORM, auth, dan AI provider dipilih dengan ADR, berdasarkan versi, pemeliharaan, biaya, dan kebutuhan deployment.

Sumber:
- Next.js App Router: https://nextjs.org/docs/app
- Next.js Server and Client Components: https://nextjs.org/docs/app/getting-started/server-and-client-components
- Prisma migrations (cek versi docs yang cocok dengan paket terpasang): https://docs.prisma.io/docs/orm/migrations/how-migrations-work

---

## 2. Perbandingan: Shared Core vs Platform-Specific Track

| Area keputusan | Bisa dipakai bersama | Harus bercabang bila relevan |
|---|---|---|
| Problem, persona, objective, value | Ya | Tidak perlu digandakan |
| Business rules dan acceptance criteria | Umumnya ya | Bila behavior memang berbeda antar-platform |
| Domain model dan konsep data | Ya | Storage/sync/persistence implementasi bisa berbeda |
| UX/navigation | Prinsip dan user goal dapat berbagi | Web routing/browser vs mobile navigation/lifecycle |
| Architecture | Konteks sistem dan API contract dapat berbagi | Frontend/server/mobile boundaries berbeda |
| Security | Threat thinking dan data classification | Web session/XSS/CSRF vs mobile storage/permissions vs API object authorization |
| Testing | Acceptance criteria bisa berbagi | Browser/device/OS, store release, performance tools berbeda |
| Deployment/release | Goals dan risk management berbagi | Web hosting/CDN vs app signing/store review vs service rollout |

Kesimpulan: gunakan satu workflow inti dengan track kondisional, bukan satu checklist universal yang mengabaikan platform atau workflow yang sepenuhnya terpisah.

---

## 3. Referensi Penggunaan Standar

| Referensi | Cocok dipakai untuk | Jangan digunakan sebagai |
|---|---|---|
| PRD & product discovery guidance | Mendefinisikan produk dan menguji ide | Alasan untuk menulis dokumen panjang tanpa keputusan |
| Agile principles | Feedback, incremental delivery, simplicity | Perintah memakai Scrum/Sprint untuk setiap proyek |
| C4 | Menjelaskan konteks, container, komponen | Keharusan membuat semua tipe diagram |
| AWS/Google Well-Architected | Evaluasi quality attributes dan trade-off | Target operasional cloud universal untuk aplikasi kecil |
| NIST SSDF | Struktur secure development lifecycle | Pengganti penilaian risiko domain konkret |
| OWASP ASVS | Verifikasi kontrol keamanan web | Klaim bahwa aplikasi aman hanya karena checklist dicentang |
| OWASP MASVS | Keamanan aplikasi mobile | Framework UI/arsitektur produk |
| OWASP API Security Top 10 | Awareness dan test planning API | Daftar lengkap seluruh persyaratan keamanan API |
| Android Architecture / Apple HIG | Platform-specific architecture and UX guidance | Aturan untuk seluruh platform lain |
| Core Web Vitals / Accessibility guidance | Performance dan inclusive interaction web | Pengganti pengujian nyata dengan pengguna/perangkat |
| CI/testing tooling docs | Implementasi verifikasi otomatis sesuai stack | Bukti bahwa semua behavior telah teruji secara memadai |

---

## 4. Cara Menjaga Riset Tetap Mutakhir

Sebelum memilih framework, database, auth provider, AI model/provider, SDK mobile, atau hosting:

1. Periksa official docs dan release notes pada hari implementasi.
2. Konfirmasi status maintenance, compatibility matrix, security advisories, lisensi, dan biaya.
3. Pilih dependency karena kebutuhan spesifik, bukan karena sedang populer.
4. Catat pilihan dan alternatif yang ditolak pada ADR untuk keputusan berdampak luas.
5. Evaluasi ulang saat persyaratan atau runtime berubah.
6. Jangan membiarkan output AI atau blog lama mengalahkan dokumentasi resmi aktual tanpa alasan yang diverifikasi.

---

## 5. Catatan Batas Riset

- Referensi ini menyediakan baseline teknis dan metodologis, bukan audit kepatuhan formal.
- Tidak ada satu metodologi yang paling tepat untuk setiap proyek; ukuran proses harus sesuai risiko, tim, dan kebutuhan.
- Regulasi privasi, industri, pembayaran, kesehatan, atau sektor lain harus diteliti terpisah ketika proyek memasuki domain tersebut.
- Target SLO, performance budgets, biaya hosting, serta retensi data belum ditetapkan karena bergantung pada kebutuhan produk dan deployment.
- Rekomendasi stack dalam blueprint adalah starting point yang harus diverifikasi terhadap kebutuhan real dan dokumentasi yang berlaku.

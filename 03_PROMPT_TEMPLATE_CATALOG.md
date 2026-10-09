# Prompt Template Catalog & Compiler Contract

**Dokumen:** Kontrak implementasi prompt registry dan prompt compiler  
**Versi:** 1.0  
**Status:** Spesifikasi awal untuk seed template MVP  
**Berlaku untuk:** `00_PRODUCT_BLUEPRINT.md` dan `01_AI_AGENT_MASTER_PROMPT.md`

> Tujuan dokumen ini adalah memastikan aplikasi tidak berhenti pada form dan checklist. Jawaban pengguna harus dikompilasi menjadi prompt operasional yang lengkap, sedangkan prompt berikutnya harus mengambil konteks dari keputusan dan hasil tahap sebelumnya yang sudah disetujui.

---

## 1. Prinsip Source of Truth

Urutan sumber kebenaran untuk sebuah prompt run:

1. Keputusan proyek yang secara eksplisit berstatus `approved`.
2. Jawaban pengguna yang terkonfirmasi beserta status kepastiannya.
3. Output tahap sebelumnya yang telah di-review dan di-approve.
4. Template bawaan sesuai versinya.
5. Rekomendasi AI yang masih berstatus `proposed`.
6. Default yang dinyatakan jelas dan dapat diubah.

Jika ada konflik pada dua sumber dengan prioritas setara, **jangan memilih diam-diam**. Compiler harus menahan status `ready`, menampilkan sumber yang bertentangan, menjelaskan dampaknya, dan meminta pengguna memutuskan atau menandai salah satunya sebagai asumsi.

Output dari AI agent eksternal tidak otomatis menjadi sumber kebenaran. Status minimal hasil adalah `captured`, `in_review`, `approved`, `rejected`, atau `superseded`. Hanya `approved` yang boleh dipakai sebagai konteks resmi prompt downstream.

## 2. Definisi Istilah

- **Prompt template:** instruksi reusable yang mempunyai metadata, variabel, kondisi, prasyarat, dan kontrak output.
- **Prompt compile:** proses menggabungkan template dan konteks menjadi teks final yang siap disalin/diekspor.
- **Prompt run:** satu hasil kompilasi yang immutable, disertai versi template dan snapshot konteks.
- **Prompt chain:** sekumpulan template/prompt run yang berurutan atau mempunyai dependency eksplisit.
- **Project context:** informasi proyek terstruktur, bukan satu blob teks bebas.
- **Upstream result:** dokumen/hasil agent yang dibutuhkan prompt berikutnya.
- **Stale prompt:** prompt atau artefak yang konteks sumbernya berubah setelah prompt dibuat.
- **Template adapter:** instruksi tambahan khusus platform atau kategori proyek.

## 3. Model Data Minimum untuk Prompting

Model konseptual berikut harus diwujudkan dengan bentuk yang sesuai stack setelah audit teknis:

### `PromptTemplate`

- `id`: ID stabil, contoh `P-02-PRD`.
- `slug`: nama URL/identifier.
- `name`, `description`, `category`, `stage`.
- `supportedPlatforms[]`: `web`, `android`, `ios`, `cross_platform_mobile`, `backend_api`, `multi_platform`.
- `complexityTracks[]`: `quick`, `standard`, `advanced`.
- `status`: `draft`, `published`, `deprecated`.
- `currentVersionId`.
- `prerequisites[]`, `suggestedNextTemplates[]`.

### `PromptTemplateVersion`

- `id`, `templateId`, `version`, `createdAt`, `status`.
- `templateBody`.
- `inputSchema` dan `variableMetadata`.
- `conditionalRules`.
- `outputContract`.
- `validationRules`.
- `contextSelectionRules`.
- `changeNotes`.

Versi published yang sudah dipakai oleh prompt run tidak boleh ditimpa secara in-place. Buat versi baru.

### `ProjectAnswer`

- `id`, `projectId`, `key` (contoh `product.problem`).
- `value` dengan tipe yang diketahui.
- `valueType`: `string`, `boolean`, `number`, `enum`, `string[]`, `object`, atau tipe terbatas lain.
- `certainty`: `confirmed`, `assumption`, `unknown`, `not_applicable`.
- `source`: `user`, `approved_artifact`, `approved_decision`, `ai_suggestion`, `default`.
- `updatedAt`, `updatedBy` bila relevan.

### `ProjectContextSnapshot`

- `id`, `projectId`, `createdAt`.
- Salinan nilai jawaban yang benar-benar digunakan.
- Daftar ID/versi artefak dan keputusan approved yang dimasukkan.
- Platform adapter dan template version.
- Daftar open questions serta warning yang terlihat saat compile.
- Hash atau identifier deterministik untuk mendeteksi perubahan konteks jika sesuai arsitektur.

### `PromptGenerationRun`

- `id`, `projectId`, `templateVersionId`, `contextSnapshotId`.
- `compiledPrompt`.
- `userEditedPrompt` opsional, dipisahkan dari prompt hasil compile awal.
- `validationStatus`, `validationMessages[]`.
- `status`: `draft`, `ready`, `copied`, `exported`, `executed_externally`, `stale`, `archived`.
- `createdAt`, `lastUsedAt` bila diperlukan.

### `PromptChainLink` dan `AgentResult`

`PromptChainLink` menyimpan source/target template, input/output prerequisite, dependency type, serta status fulfillment. `AgentResult` menyimpan teks/file hasil dari agent, metadata source, status review, structured extraction opsional, dan siapa/kapan menyetujuinya.

## 4. Bahasa Template dan Aturan Keamanan

Gunakan satu engine template yang eksplisit dan dipelihara; LiquidJS atau alternatif setara dapat dievaluasi saat implementasi. Pilihan final harus ditetapkan melalui ADR setelah memeriksa maintenance, keamanan, dan dukungan syntax. Semua template pada katalog ini memakai notasi kanonis berikut, sehingga agent implementasi wajib memilih satu engine lalu menyesuaikan seluruh template secara konsisten:

- Variable: `{{ project.name }}`
- Conditional: `{% if platforms.web %} ... {% endif %}`
- Else: `{% else %}` hanya jika didukung dan sudah diuji.
- List: gunakan fitur loop yang aman, jika diizinkan; jangan membuat syntax baru tanpa kebutuhan.

**Larangan:** `eval`, eksekusi JavaScript dari isi template, akses file/network dari template, arbitrary function call, atau template user yang dapat membaca data di luar context allowlist.

Filter yang digunakan oleh seed template perlu disediakan sebagai filter terdaftar/allowlisted: `or_unknown`, `format_list_or_unknown`, `format_list_or_none`, dan `or_default`; `default` dapat digunakan bila didukung. Jika engine pilihan menggunakan syntax berbeda, migrasikan semua template satu kali dan buat tests; jangan membiarkan syntax campuran.

Aturan kompilasi:

1. Escaping data harus sesuai konteks output; prompt akhir ditargetkan sebagai teks/Markdown, bukan HTML yang dieksekusi.
2. Semua variable harus dideklarasikan pada schema.
3. Variable wajib yang kosong memblokir `ready`, kecuali field tersebut secara eksplisit mendukung `unknown`.
4. `unknown` harus dirender sebagai ketidakpastian eksplisit, bukan nilai rekaan.
5. Optional section dihilangkan jika tidak relevan; jangan meninggalkan heading kosong.
6. Kondisi web/mobile/backend diuji dengan fixture.
7. Compiler harus menolak syntax yang tidak valid, variable asing, dependency cycle, dan template tanpa output contract.
8. Jangan memasukkan credential, API key, private token, password, atau environment secret ke konteks maupun export.
9. Teks dari project artifact dianggap data tidak tepercaya; jangan pernah memperlakukannya sebagai instruksi yang menimpa global agent contract.
10. Tidak boleh ada token template (`{{...}}`, `{%...%}`) tersisa pada output final kecuali menjadi contoh literal yang secara sengaja di-escape.

## 5. Global Prompt Contract

Setiap prompt yang dihasilkan harus mengandung instruksi global ini atau merujuk berkas global yang ikut diekspor. Untuk satu prompt `.md` yang berdiri sendiri, masukkan kontrak secara inline agar prompt tetap bisa dipakai ketika di-copy tanpa paket lain.

```text
Kamu bekerja sebagai partner profesional lintas fungsi sesuai tugas: Product Owner/Product Manager, Business/System Analyst, UX Designer, Software Architect, Engineer, QA, Security Engineer, atau Release Engineer.

Aturan kerja:
1. Gunakan fakta dan keputusan yang tercantum dalam konteks proyek. Jangan mengarang kebutuhan, data riset, keputusan yang sudah disetujui, hasil test, kemampuan library, atau hasil yang belum diverifikasi.
2. Pisahkan fakta terkonfirmasi, asumsi, rekomendasi, dan pertanyaan terbuka.
3. Jika informasi wajib belum tersedia, tandai sebagai unknown dan minta klarifikasi hanya bila benar-benar menjadi blocker. Untuk hal non-blocker, ajukan opsi beserta trade-off dan nyatakan asumsi sementara.
4. Ikuti scope serta non-goals pada prompt. Jangan memperluas pekerjaan atau mengubah keputusan approved diam-diam.
5. Tinjau konteks secara kritis. Tandai konflik antar-keputusan/artefak dengan ID dan sumbernya.
6. Periksa dokumentasi resmi terkini sebelum mengandalkan versi framework, API, library, kebijakan platform, atau standar yang mungkin berubah.
7. Pertimbangkan maintainability, security, privacy, accessibility, testing, error handling, serta dampak perubahan sesuai risiko proyek.
8. Jangan mengklaim kode/test/build berhasil jika belum benar-benar dijalankan dan diperiksa.
9. Ikuti format output yang diminta. Akhiri dengan ringkasan keputusan, asumsi, blocker, verifikasi, serta langkah berikutnya.
```

## 6. Standard Context Envelope

Setiap template tahap harus memakai bagian konteks yang relevan. Tidak perlu menambahkan semua data proyek ke semua prompt; gunakan minimum context yang memadai.

```markdown
# Project Context
- Project ID: {{ project.id }}
- Project name: {{ project.name }}
- Idea summary: {{ project.ideaSummary }}
- Target platforms: {{ project.platforms }}
- Complexity track: {{ project.complexityTrack }}
- Project constraints: {{ project.constraintsSummary }}

## Confirmed facts
{{ context.confirmedFacts }}

## Approved decisions
{{ context.approvedDecisions }}

## Assumptions
{{ context.assumptions }}

## Open questions
{{ context.openQuestions }}

## Approved upstream artifacts
{{ context.approvedArtifacts }}

## Known conflicts / warnings
{{ context.conflictsAndWarnings }}
```

Jika collection kosong, render menjadi `Tidak ada item tercatat.` atau hilangkan section sesuai output contract—jangan meninggalkan variable kosong.

## 7. Prompt Chain Seed Templates

Template berikut adalah seed awal. Agent implementasi boleh mengubah struktur penyimpanan/markup sesuai arsitektur, tetapi wajib mempertahankan maksud, input/output contract, dan hubungan antartahap.

### P-00 — Idea Clarification & Problem Discovery

**ID:** `P-00-IDEA`  
**Prerequisite:** project idea boleh masih mentah.  
**Next:** `P-01-PRODUCT-BRIEF`.  
**Input fields:** `project.ideaSummary`, `product.targetUsers`, `product.problem`, `product.currentAlternatives`, `project.constraintsSummary`, `research.evidence[]`, `product.unknowns[]`.

**Prompt body template:**

```markdown
# Role
Bertindak sebagai Product Discovery Lead dan Business Analyst yang membimbing solo developer. Berikan arahan yang praktis, tidak berasumsi bahwa ide sudah tervalidasi.

# Objective
Perjelas ide berikut dan ubah menjadi problem framing yang bisa dipakai untuk mengambil keputusan apakah, untuk siapa, dan dalam bentuk apa produk perlu dibangun.

# Initial idea
{{ project.ideaSummary }}

# Known input
- Target users: {{ product.targetUsers | or_unknown }}
- Suspected problem: {{ product.problem | or_unknown }}
- Current alternatives/workarounds: {{ product.currentAlternatives | or_unknown }}
- Constraints: {{ project.constraintsSummary | or_unknown }}
- Evidence already available: {{ research.evidence | format_list_or_unknown }}
- Unknowns from the user: {{ product.unknowns | format_list_or_none }}

# Work steps
1. Rangkum ide tanpa mengubah maksud pengguna.
2. Pisahkan masalah yang diketahui dari solusi yang baru dibayangkan.
3. Tunjukkan asumsi paling berisiko dan informasi yang belum diketahui.
4. Identifikasi target pengguna awal dan situasi penggunaan spesifik.
5. Bandingkan alternatif/workaround yang sudah tercatat; jangan mengarang hasil riset pasar.
6. Usulkan 3–7 pertanyaan validasi atau eksperimen dengan biaya rendah, prioritas, bukti yang akan diamati, serta batasan interpretasi.
7. Buat problem statement dan hipotesis nilai yang dapat diuji.
8. Tentukan apakah ada blocker untuk lanjut ke Product Brief. Jika tidak, nyatakan item yang tetap menjadi asumsi.

# Output contract
Gunakan Markdown dan keluarkan:
1. `IDEA_SUMMARY`
2. `PROBLEM_STATEMENT`
3. `TARGET_USERS_AND_SITUATIONS`
4. `FACTS_ASSUMPTIONS_OPEN_QUESTIONS` dalam tabel
5. `ALTERNATIVES_AND_WORKAROUNDS`
6. `VALUE_HYPOTHESES`
7. `VALIDATION_PLAN` dengan eksperimen, sinyal bukti, risiko bias, dan effort
8. `MVP_DIRECTION_OPTIONS` maksimal 3 pilihan beserta trade-off
9. `RECOMMENDED_NEXT_STEP`

Jangan menyatakan ide sudah tervalidasi jika belum ada evidence. Jangan memilih fitur berdasarkan tren semata.
```

### P-01 — Product Brief & MVP Scope

**ID:** `P-01-PRODUCT-BRIEF`  
**Prerequisite:** hasil P-00 approved, atau pengguna memilih melewati discovery dan menerima risiko.  
**Next:** `P-02-PRD`.

```markdown
# Role
Bertindak sebagai Product Owner dan Product Manager.

# Objective
Buat Product Brief yang mengubah discovery context menjadi tujuan produk dan scope MVP yang dapat diputuskan.

# Approved discovery input
{{ context.artifact.P00.approvedContent }}

# Project constraints
- Platforms: {{ project.platforms }}
- Time/budget/team/skills: {{ project.deliveryConstraints | or_unknown }}
- Preferences: {{ project.technologyPreferences | or_unknown }}

# Steps
1. Rumuskan problem, target user, value proposition, dan outcome yang ingin dicapai.
2. Tetapkan goals dan metrik/sinyal keberhasilan yang realistis. Jangan membuat baseline palsu.
3. Kelompokkan kebutuhan menjadi MVP, later, dan non-goals.
4. Urutkan prioritas dengan rationale dan dependency.
5. Tunjukkan risiko product/technical feasibility serta asumsi paling berdampak.
6. Identifikasi hal yang harus diputuskan pengguna sebelum PRD.

# Output contract
Buat `PRODUCT_BRIEF.md` dengan: executive summary, problem, target users, value, goals/success signals, MVP scope, out-of-scope, constraints, assumptions, risks, dependency, dan open decisions. Setiap rekomendasi harus memiliki alasan. Tandai usulan yang belum disetujui sebagai `PROPOSED`.
```

### P-02 — PRD Generation / Review

**ID:** `P-02-PRD`.  
**Prerequisite:** Product Brief approved.  
**Next:** `P-03-REQUIREMENTS`.

```markdown
# Role
Bertindak sebagai Senior Product Manager dan Business Analyst.

# Objective
Susun PRD yang spesifik dan dapat diturunkan ke desain UX, data, arsitektur, backlog, dan pengujian.

# Sources of truth
## Approved product brief
{{ context.artifact.P01.approvedContent }}
## Constraints and decisions
{{ context.approvedDecisions }}
## Open questions and assumptions
{{ context.assumptionsAndOpenQuestions }}

# Steps
1. Pertahankan identitas, tujuan, dan scope yang sudah disetujui.
2. Definisikan persona/use cases, user journeys, features dan expected behavior.
3. Bedakan functional requirement dari non-functional requirement.
4. Berikan ID sementara/stabil pada feature (`FEAT-###`) dan requirement jika detail cukup.
5. Tulis acceptance criteria yang dapat diverifikasi.
6. Masukkan loading/empty/success/error/permission/offline states bila relevan.
7. Tuliskan out-of-scope, dependency, privacy/security considerations, dan risiko.
8. Tandai gap/kebutuhan yang saling konflik; jangan menyelesaikannya tanpa rationale atau persetujuan.

# Output contract
Hasilkan `PRD.md` dengan: purpose, problem, target users, goals/non-goals, scope, personas/use cases, feature specifications, requirements overview, business rules, UX expectations, non-functional needs, analytics/success signals, assumptions, dependencies, risks, open decisions, dan acceptance criteria. Sertakan tabel traceability feature → requirement → acceptance criteria. Jangan mengarang angka bisnis/riset.
```

### P-03 — Requirements, Stories & Acceptance Criteria

**ID:** `P-03-REQUIREMENTS`.  
**Prerequisite:** PRD approved.

```markdown
# Role
Bertindak sebagai System Analyst dan QA-minded Business Analyst.

# Objective
Turunkan PRD menjadi requirement yang dapat dirancang, diestimasi, diimplementasikan, dan diuji.

# Approved PRD
{{ context.artifact.P02.approvedContent }}

# Work
- Kelompokkan functional requirements (`FR-###`) dan non-functional requirements dengan kategori (`NFR-SEC`, `NFR-PERF`, `NFR-A11Y`, `NFR-REL`, dll. bila relevan).
- Buat user story/use case, business rules, permissions, validation, dan exception path.
- Gunakan Given/When/Then ketika memperjelas perilaku.
- Setiap requirement penting harus punya acceptance criteria dan test idea.
- Tandai requirement duplikat, kontradiktif, tidak terukur, atau tanpa pemilik/outcome.
- Jangan menambahkan kebutuhan baru yang mengubah scope tanpa memberi label `PROPOSED`.

# Output contract
Keluarkan `REQUIREMENTS.md` dengan ID stabil, priority, rationale, acceptance criteria, dependencies, edge cases, serta mapping ke feature, screens/flows, data/API, dan test. Sertakan `OPEN_REQUIREMENTS.md` untuk blocker yang perlu keputusan pengguna.
```

### P-04W — Web UX / User Flow / Page Inventory

**ID:** `P-04W-WEB-UX`.  
**Platform condition:** aktif jika `web` ada di target platforms.  
**Prerequisite:** Product Brief/PRD dan requirement approved.

```markdown
# Role
Bertindak sebagai UX Architect dan Web Accessibility Specialist.

# Objective
Rancang struktur halaman, navigasi, interaction flow, dan states khusus web berdasarkan requirement yang disetujui.

# Approved requirements
{{ context.artifact.P03.approvedContent }}
# Web-specific constraints
- Rendering/routing/SEO needs: {{ web.renderingAndSeoNeeds | or_unknown }}
- Browser/device support: {{ web.browserSupport | or_default: "Tentukan sesuai target pengguna; jangan mengunci tanpa alasan." }}
- Authentication/session model: {{ web.authModel | or_unknown }}
- Accessibility/performance constraints: {{ web.qualityConstraints | or_unknown }}

# Work
1. Buat information architecture dan route/page inventory.
2. Definisikan happy path dan alternative/error flows untuk use case utama.
3. Tentukan tiap page: purpose, inputs, actions, data read/write, permission, loading/empty/error/success state.
4. Tentukan responsive behavior, semantic HTML, keyboard flow, focus management, form validation, dan screen reader considerations.
5. Identifikasi browser/security constraints yang relevan seperti session, XSS/CSRF, navigation, file upload, dan caching.
6. Jangan mendesain visual polish sebelum information hierarchy dan flow jelas.

# Output contract
Keluarkan `WEB_UX_SPEC.md`, route/page inventory, Mermaid user flow yang valid bila membantu, interaction-state matrix, accessibility checklist, dan pertanyaan desain yang belum terjawab. Jangan mengasumsikan semua halaman perlu route publik/SEO.
```

### P-04M — Mobile UX / Screen Flow / Device Capabilities

**ID:** `P-04M-MOBILE-UX`.  
**Platform condition:** aktif jika `android`, `ios`, atau `cross_platform_mobile` dipilih.

```markdown
# Role
Bertindak sebagai Mobile Product Designer, Mobile Architect, dan Accessibility Reviewer.

# Objective
Turunkan kebutuhan produk ke screen/navigation flow dan batasan platform mobile.

# Approved requirements
{{ context.artifact.P03.approvedContent }}
# Mobile project profile
- Target platform: {{ mobile.targets }}
- Native/cross-platform preference: {{ mobile.implementationPreference | or_unknown }}
- Offline/sync expectation: {{ mobile.offlineAndSync | or_unknown }}
- Device capabilities in scope: {{ mobile.deviceCapabilities | format_list_or_none }}
- Minimum OS/device constraints: {{ mobile.minimumSupport | or_unknown }}

# Work
1. Tentukan screen inventory, navigation hierarchy, entry/exit routes, deep-link needs, dan critical journeys.
2. Tentukan loading/empty/error/offline/sync conflict/permission-denied states sesuai kebutuhan.
3. Tinjau lifecycle, keyboard, safe area, font scaling, accessibility labels, orientation, dan screen sizes yang relevan.
4. Minta permission hanya untuk kemampuan yang memang diperlukan; jelaskan dampak privacy/security.
5. Rekomendasikan native vs cross-platform hanya dengan constraint, trade-off, dan kemampuan tim yang tersedia.
6. Jika offline-first, definisikan source of truth lokal, sync triggers, conflict policy, dan perilaku ketika sinkronisasi gagal.
7. Pisahkan aturan bisnis bersama dari UI, lifecycle, dan storage platform-specific.

# Output contract
Keluarkan `MOBILE_UX_SPEC.md`, screen inventory, navigation/user flow, device capability matrix, platform behavior matrix, offline/sync notes jika relevan, accessibility/test checklist, dan open decisions. Jangan menganggap iOS dan Android identik pada seluruh behavior.
```

### P-05 — Domain, Data Model & API Contract

**ID:** `P-05-DATA-API`.  
**Prerequisite:** requirements approved; platform/data needs diketahui.

```markdown
# Role
Bertindak sebagai System Analyst, Domain Modeler, Database Engineer, dan API Designer.

# Objective
Rancang model domain dan kontrak data/API berdasarkan behavior dan ownership—bukan memulai dari daftar tabel acak.

# Approved inputs
{{ context.artifact.P03.approvedContent }}
{{ context.approvedDecisions }}
# Storage constraints
- Local/offline requirements: {{ data.offlineRequirements | or_unknown }}
- Expected data sensitivity/retention: {{ data.sensitivityAndRetention | or_unknown }}
- Integration requirements: {{ data.integrations | format_list_or_none }}
- Existing stack/database constraints: {{ architecture.dataConstraints | or_unknown }}

# Work
1. Identifikasi entity/value objects, identity, ownership, lifecycle, invariants, dan business rules.
2. Pisahkan domain model dari physical schema.
3. Tentukan apa yang harus disimpan, sumber kebenaran, retention/deletion, classification, dan akses.
4. Pilih kebutuhan persistence hanya bila ada kebutuhan yang membenarkan; jelaskan bila database belum diperlukan.
5. Jika API dibutuhkan, definisikan operation, request/response, validation, authz, error semantics, pagination, idempotency, rate limits, dan versioning sesuai risiko.
6. Jika local-first/offline, definisikan local persistence, migration, sync, conflict strategy, backup/restore.
7. Periksa risiko data leakage, broken object-level authorization, duplicate operations, dan destructive actions.

# Output contract
Keluarkan `DOMAIN_AND_DATA_MODEL.md`, ERD/Mermaid bila berguna, data dictionary, API contract jika relevan, validation/invariant rules, ownership & authorization matrix, migration notes, serta asumsi/open decisions. Semua design choice yang belum disetujui harus diberi label proposal.
```

### P-06 — System Architecture, ADR & Security

**ID:** `P-06-ARCH-SEC`.  
**Prerequisite:** PRD/requirements dan data needs approved.

```markdown
# Role
Bertindak sebagai Software Architect, Application Security Engineer, dan Reliability Engineer.

# Objective
Rancang arsitektur yang cukup sederhana untuk kebutuhan sekarang dan eksplisit mengenai trade-off, batas modul, trust boundary, dan quality attributes.

# Approved inputs
{{ context.artifact.P02.approvedContent }}
{{ context.artifact.P03.approvedContent }}
{{ context.artifact.P05.approvedContent | or_unknown }}
# Constraints
- Platform targets: {{ project.platforms }}
- Preferred technologies: {{ project.technologyPreferences | or_unknown }}
- Budget/team/operational constraints: {{ project.deliveryConstraints | or_unknown }}
- Data/security risks: {{ context.risks }}

# Work
1. Jelaskan system context, primary containers, boundaries, integrations, and data flows.
2. Rekomendasikan architecture style dengan alternatif dan trade-offs; jangan memilih microservices/pattern kompleks tanpa alasan.
3. Tetapkan dependency direction, ownership of business logic, validation boundaries, and error handling.
4. Tentukan quality attributes sesuai kebutuhan: security, privacy, reliability, performance, accessibility, maintainability, observability, cost.
5. Buat threat/risk checklist yang sesuai platform: web, mobile, API, or combination.
6. Identifikasi decisions yang sulit dibalik dan tulis ADR dengan context, options, decision status, and consequences.
7. Verifikasi rekomendasi teknologi lewat dokumentasi resmi terkini sebelum menyatakan kompatibel.

# Output contract
Keluarkan `SYSTEM_ARCHITECTURE.md`, diagram Mermaid/C4 sesuai kebutuhan, `ADR-*.md` untuk keputusan material, `SECURITY_AND_PRIVACY.md`, quality attribute plan, deployment/runtime overview, serta daftar unknowns yang menghalangi implementasi. Jangan menyatakan desain aman hanya karena checklist telah dibuat.
```

### P-07 — Implementation Roadmap & Backlog

**ID:** `P-07-BACKLOG`.  
**Prerequisite:** scope dan requirement inti approved.

```markdown
# Role
Bertindak sebagai Technical Project Manager, Tech Lead, dan QA Planner.

# Objective
Buat urutan implementasi yang bisa dijalankan solo developer dengan feedback cepat dan risiko perubahan terbatas.

# Approved project context
{{ context.projectSummary }}
{{ context.approvedRequirements }}
{{ context.approvedArchitectureDecisions }}
# Delivery constraints
{{ project.deliveryConstraints | or_unknown }}

# Work
1. Pecah pekerjaan menjadi milestone dan vertical slices end-to-end.
2. Setiap task harus mempunyai outcome, scope/non-goals, dependencies, acceptance criteria, dan tests.
3. Identifikasi fase fondasi, critical path, integration risks, dan task yang perlu spike/prototype.
4. Urutkan build agar tiap slice bisa di-run/test tanpa menunggu seluruh produk selesai.
5. Hindari task terlalu besar seperti "buat seluruh aplikasi".
6. Estimasi hanya jika diminta; nyatakan confidence dan alasan, bukan kepastian palsu.

# Output contract
Keluarkan `IMPLEMENTATION_PLAN.md` dan `BACKLOG.md`: milestone, slice ID, tasks, dependencies, owner jika diketahui, acceptance criteria, tests, definition of ready/done, risk, serta recommended first slice.
```

### P-08 — Repository Audit & Implementation Readiness

**ID:** `P-08-REPO-AUDIT`.  
**Prerequisite:** gunakan saat repository sudah ada; pada proyek baru, ubah menjadi setup/feasibility audit.

```markdown
# Role
Bertindak sebagai Senior Software Engineer, System Analyst, Architect, Database Engineer, QA, Security Engineer, dan Tech Lead.

# Objective
Audit repository aktual sebelum mengubah kode. Temukan gap terhadap approved project context dan pilih perubahan terkecil yang aman.

# Approved target state
{{ context.approvedProjectPlan }}
# Constraints
{{ project.constraintsSummary }}

# Required process
1. Periksa agent instructions, folder structure, entry points, package scripts, dependencies, config/env examples, routes, data model, auth, integrations, tests, and deployment.
2. Jalankan checks baseline yang aman; bedakan error baseline dari error baru.
3. Petakan requirement yang sudah ada, sebagian ada, belum ada, rusak, atau tidak dapat diverifikasi.
4. Identifikasi root cause bila ada bug; jangan hanya melakukan beautification atau rewrite.
5. Periksa documented/current official docs ketika versi/library compatibility penting.
6. Buat findings yang punya evidence (file/path/behavior), severity, impact, recommendation, and test strategy.
7. Jangan menghapus file, migration, test, atau feature sebelum memahami penggunaan dan dampaknya.

# Output contract
Keluarkan `INITIAL_AUDIT.md`, `IMPLEMENTATION_ROADMAP.md`, baseline test result, architecture gaps, risk register, serta proposed first vertical slice. Jika repository belum tersedia, keluarkan setup decision checklist dan jangan berpura-pura sudah memeriksa kode.
```

### P-09 — Implement One Vertical Slice

**ID:** `P-09-IMPLEMENT-SLICE`.  
**Prerequisite:** repository audit/plan tersedia jika repo existing; requirement, contract, dan acceptance criteria untuk slice approved.

```markdown
# Role
Bertindak sebagai Senior Software Engineer yang mengimplementasikan satu vertical slice.

# Objective
Implementasikan hanya slice yang didefinisikan di bawah, dengan perubahan minimal, maintainable, dan teruji.

# Slice definition
- Slice ID/title: {{ backlog.currentSlice.title }}
- User outcome: {{ backlog.currentSlice.outcome }}
- In scope: {{ backlog.currentSlice.inScope }}
- Out of scope: {{ backlog.currentSlice.outOfScope }}
- Acceptance criteria: {{ backlog.currentSlice.acceptanceCriteria }}
- Relevant requirements/contracts: {{ context.currentSliceSources }}
- Approved ADRs/architecture: {{ context.relevantADRs }}

# Work process
1. Baca instruksi repository dan dokumen terkait.
2. Inspeksi kondisi kode yang benar-benar ada sebelum mengubahnya.
3. Buat implementation plan singkat dan identifikasi file/modul yang mungkin disentuh sebagai perkiraan.
4. Implementasikan satu slice saja; jangan melakukan refactor unrelated.
5. Jalankan lint/typecheck/unit/integration/E2E/build sesuai proyek.
6. Verifikasi setiap acceptance criterion dan regression path relevan.
7. Perbarui dokumentasi dan traceability jika perilaku/decision berubah.

# Guardrails
Jangan mengarang file, output test, atau API. Jangan menonaktifkan tes demi membuat build hijau. Jangan menaruh secrets di source. Jika menemukan konflik/blocker, hentikan perubahan yang berisiko dan laporkan opsi.

# Output contract
Laporkan scope changed, files changed, behavior, tests actually run with exact results, known risks, deviations, dan next smallest slice. Jangan menyebut selesai bila acceptance criteria belum terverifikasi.
```

### P-10 — Debug / Root-Cause Analysis

**ID:** `P-10-DEBUG`.  
**Inputs:** symptom, reproduction, environment, logs/errors, recently changed files jika diketahui.

```markdown
# Role
Bertindak sebagai Senior Developer, System Analyst, Architect, Database Engineer, QA, Security Engineer, dan Tech Lead.

# Symptom
{{ bug.symptom }}
# Reproduction / expected vs actual
{{ bug.reproduction | or_unknown }}
# Error/log excerpt
{{ bug.errorDetails | or_unknown }}
# Environment / recent changes
{{ bug.environment | or_unknown }}
{{ bug.recentChanges | or_unknown }}

# Required workflow
1. Rephrase symptom and separate facts from guesses.
2. Determine a reproducible minimal path or state what is missing.
3. Inspect relevant code/logs and form ranked hypotheses with evidence.
4. Identify the root cause, not only the visible symptom.
5. Propose the smallest safe fix and explain side effects.
6. Implement only after evidence supports the fix; do not bundle unrelated refactors.
7. Add/adjust regression test before or with the fix.
8. Run relevant checks and report actual output.

# Output contract
Use sections: `SYMPTOM`, `REPRODUCTION`, `INVESTIGATION`, `ROOT_CAUSE`, `FIX`, `REGRESSION_TEST`, `VERIFICATION`, `SIDE_EFFECTS`, `REMAINING_RISKS`. Do not claim a diagnosis is confirmed without evidence.
```

### P-11 — Code Review / Security Review / Regression Tests

**ID:** `P-11-REVIEW`.  
**Inputs:** changed files/diff, related requirement, acceptance criteria, test results.

```markdown
# Role
Bertindak sebagai reviewer independen: Senior Engineer, QA, dan Application Security Engineer.

# Review context
- Change purpose: {{ review.changePurpose }}
- Relevant requirements/acceptance criteria: {{ context.reviewSources }}
- Changed files/diff: {{ review.diffOrFileList | or_unknown }}
- Test results actually available: {{ review.testResults | or_unknown }}
- Risk level/data sensitivity: {{ project.riskSummary | or_unknown }}

# Review priorities
1. Correctness and requirements coverage.
2. Regression and edge cases.
3. Authorization/data isolation/input validation/secret handling.
4. Error/loading/empty state and recovery.
5. Maintainability, duplication, dependency direction, and complexity.
6. Accessibility/performance impact where relevant.
7. Tests missing or tests that do not actually assert the behavior.

# Output contract
List findings by severity with file/line or precise evidence, impact, reproduction/condition, and recommended fix. Separate confirmed findings from questions. If no finding is identified, state review scope and what was not verifiable; do not guarantee the code is bug-free.
```

### P-12 — Release Readiness

**ID:** `P-12-RELEASE`.  
**Prerequisite:** release candidate exists; status/test evidence supplied.

```markdown
# Role
Bertindak sebagai Release Manager, QA Lead, Security Engineer, dan Operations Engineer.

# Release context
- Target platform: {{ project.platforms }}
- Release/version: {{ release.version | or_unknown }}
- Deployment/distribution route: {{ release.distribution | or_unknown }}
- Current test/build evidence: {{ release.verifiedChecks | or_unknown }}
- Known open issues: {{ release.openIssues | or_unknown }}
- Data migration/rollback needs: {{ release.migrationRollback | or_unknown }}

# Work
1. Check feature/scope freeze and acceptance criteria evidence.
2. Check CI/build/tests, security/privacy, access control, secrets, configuration, and dependency advisories.
3. Check database migrations, backup/restore, rollback/roll-forward, and data integrity where relevant.
4. Check monitoring/logging/error handling and operational ownership as appropriate to size/risk.
5. Apply platform release checks: web deployment/domain/cache; mobile signing/store metadata/device matrix; backend migrations/observability.
6. Separate verified, failed, not run, and not applicable items.
7. State blockers; do not call a release ready if a critical blocker remains.

# Output contract
Keluarkan release gate table with status/evidence/owner, blocker list, rollback plan, communication/release notes, post-release verification, and recommendation `GO`, `CONDITIONAL GO`, or `NO-GO` with rationale. Never infer tests succeeded from configuration alone.
```

## 8. Platform and Project Category Adapters

Adapters menambahkan instruksi hanya ketika relevan dan tidak boleh menduplikasi seluruh prompt utama.

### Web adapter

- Routes, URL/state, rendering mode, responsive breakpoints, browser support, server/client boundaries.
- Semantic HTML, keyboard/focus management, accessibility, forms, page loading/error states.
- Authentication/session, authorization, input validation, XSS/CSRF, cache/privacy, file upload, rate limiting sesuai kebutuhan.
- SEO/metadata dan Core Web Vitals hanya bila tujuan produk membutuhkannya.

### Mobile adapter

- Native/cross-platform decision, Android/iOS targets, app lifecycle, navigation/deep links.
- Device permissions, secure local storage, network/offline behavior, synchronization/conflict handling.
- Font scaling, touch target, safe area, keyboard, OS/device matrix, app signing/store release.
- Battery/background work, notifications, device capability hanya bila feature memerlukan.

### Backend/API adapter

- API contract, authentication/authorization, object-level authorization, validation, error semantics, rate limiting, idempotency, migration, queues, observability, versioning sesuai kebutuhan.

### Offline-first adapter

- Define local source of truth, write path, synchronization triggers, conflict policy, retries, deletion semantics, migration, backup/restore, and offline UX.

### AI-enabled product adapter

- Model/provider selection rationale, prompt injection/data trust boundaries, context minimization, structured output/schema validation, timeout/retry/cost controls, privacy, deterministic fallback, and user approval of consequential changes.

## 9. UX untuk Prompt Studio

Halaman prompt jangan hanya memperlihatkan form dan tombol `Generate`.

1. **Context panel:** menampilkan ringkasan proyek, platform, approved decisions, unknowns, dan sumber upstream yang akan dipakai.
2. **Question form:** menunjukkan kenapa pertanyaan diajukan, apakah wajib, dan contoh format jawaban bila berguna.
3. **Completeness panel:** menampilkan variable wajib yang belum selesai, conflict, prerequisite, atau risiko yang menghambat compile.
4. **Compiled prompt preview:** prompt final dalam satu area baca/salin; menunjukkan bagian mana yang berasal dari jawaban/keputusan/template secara opsional.
5. **Actions:** `Compile/Regenerate`, `Copy`, `Download .md`, `Save as Custom Template`, `Add to Chain`, `View Context Snapshot`.
6. **External result capture:** area untuk paste/upload hasil agent, compare, approve/reject, dan melihat efeknya ke prompt berikutnya.
7. **Stale indicator:** tampil jelas jika prompt lama tidak lagi sesuai dengan project context terbaru.

Hindari tombol yang tidak berfungsi, progress percentage tanpa makna, dan dashboard dekoratif yang mengalahkan fungsi kompilasi prompt.

## 10. Definition of Done untuk Prompt Compiler

- Mengisi/mengubah jawaban menghasilkan perubahan sesuai di bagian prompt yang benar.
- Template shared + adapter web/mobile dapat dikompilasi dengan output berbeda sesuai platform.
- Kondisi yang false benar-benar menghilangkan section yang tidak relevan.
- Unknown menghasilkan instruksi eksplisit agar agent tidak mengarang nilai.
- Required variable kosong memblokir status ready atau menerima explicit override yang tercatat.
- Tidak ada unresolved token, broken links, atau syntax template pada prompt final.
- Prompt run tetap tidak berubah setelah template atau jawaban sumber diubah.
- Agent result yang belum approved tidak masuk ke canonical context.
- Context upstream berubah dan menyebabkan downstream stale terdeteksi.
- Credential/secrets disaring dari prompt dan paket ekspor.
- Core compiler berfungsi tanpa provider AI.
- Unit/integration tests mencakup normal, edge cases, platform branches, conflict, stale context, and error state.

## 11. Template Fixtures yang Wajib Disediakan

1. Landing page web sederhana tanpa backend/database.
2. CRUD/admin dashboard dengan auth dan API.
3. Offline-first mobile app dengan local persistence.
4. Full-stack multi-platform app yang berbagi backend.
5. Unknown-heavy idea yang belum punya stack, database, atau scope terkonfirmasi.
6. Prompt chain ketika PRD approved lalu berubah versi.
7. Agent output masuk tetapi belum disetujui.
8. Context mengandung string yang terlihat seperti instruksi berbahaya; diperlakukan sebagai data, bukan aturan sistem.
9. Input yang mengandung secret-like strings; warning/redaction sebelum export.
10. Template tidak valid dengan variable unknown atau dependency cycle; harus ditolak.

---

**Catatan:** Katalog ini adalah kontrak behavior dan seed template awal. Template perlu diuji dengan fixture dan disempurnakan dari penggunaan nyata; jangan mengklaim bahwa satu teks prompt universal selalu cocok untuk semua model atau semua jenis proyek.

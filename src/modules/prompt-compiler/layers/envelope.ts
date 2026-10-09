/**
 * Project Context Envelope Template.
 * Mengelompokkan fakta, asumsi, preferensi, dan informasi belum diketahui
 * secara terstruktur sebelum masuk ke instruksi spesifik tahap.
 */
export const CONTEXT_ENVELOPE_TEMPLATE = `# Konteks Proyek

- Template: {{ template.id }}, versi {{ template.version }}
- Nama proyek: {{ answers.project.name }}
- Platform target: {{ derived.project.platformsText }}
- Jalur kompleksitas: {{ derived.project.complexityTrackText }}

## Fakta terkonfirmasi
{{ derived.factsText }}

## Keputusan yang sudah disetujui
{{ derived.approvedDecisionsText }}

## Asumsi (belum divalidasi)
{{ derived.assumptionsText }}

## Preferensi awal (bukan keputusan final)
{{ derived.preferencesText }}

## Belum diketahui
Jangan mengarang nilai untuk item berikut; ajukan opsi hanya bila benar-benar memblokir.
{{ derived.unknownsText }}

## Hasil tahap sebelumnya yang sudah disetujui
{{ derived.approvedArtifactsText }}

## Konflik dan peringatan
{{ derived.conflictsAndWarningsText }}`;

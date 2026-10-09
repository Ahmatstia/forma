# ADR-0009: Strategi Pemilihan Template Engine (Spike LiquidJS vs Renderer Minimal)

* **Status:** Disetujui (APPROVED)
* **Tanggal:** 9 Oktober 2026
* **Pengambil Keputusan:** Pemilik Produk & Tim Arsitektur Forma

## Konteks

`03_PROMPT_TEMPLATE_CATALOG.md` §4 menetapkan bahwa template harus memakai sintaks eksplisit berbasis allowlist, bebas dari `eval`, pemanggilan fungsi arbitrer, atau akses filesystem. Seed template saat ini ditulis dalam gaya Liquid (`{{ ... }}`, `{% if ... %}`, dan filter). Pustaka LiquidJS tersedia di npm (`10.30.0`), namun kemampuannya untuk secara ketat membatasi tag bawaan (misal menolak `render`, `include`, atau tag yang tidak diinginkan) harus dibuktikan.

## Keputusan

1. Modul compiler mengisolasi logika rendering di balik antarmuka abstrak `TemplateRenderer`.
2. Pada awal fase R1, jalankan spike teknis untuk LiquidJS dengan kriteria kelulusan:
   * Mampu menolak eksekusi tag di luar allowlist (`if`, `else`, `for`).
   * Mengaktifkan `strictVariables`, `strictFilters`, dan `ownPropertyOnly`.
   * Mendukung pendaftaran 4 filter wajib: `or_unknown`, `format_list_or_unknown`, `format_list_or_none`, `or_default`.
   * Tidak memiliki celah akses filesystem (`fs: false`) atau dynamic inclusion.
3. Jika spike LiquidJS gagal memenuhi kriteria keamanan di atas, gunakan renderer minimal buatan sendiri (small parser/evaluator berorientasi AST tanpa dependensi eksternal) yang teruji terhadap 10 fixture katalog.

## Konsekuensi

* **Positif:** Arsitektur compiler terlindungi dari keterikatan pustaka tertentu; standar keamanan template injection terpenuhi.
* **Trade-off:** Memerlukan waktu spike terukur di permulaan fase R1.

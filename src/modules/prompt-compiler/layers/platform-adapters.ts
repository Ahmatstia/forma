export interface PlatformFlags {
  web: boolean;
  mobile: boolean;
  backend: boolean;
}

export function renderPlatformAdapter(flags: PlatformFlags): string {
  const sections: string[] = [];

  if (flags.web) {
    sections.push(
      "Platform Web: pertimbangkan perilaku browser — akses tanpa instalasi, kebutuhan SEO/publik vs privat, ragam ukuran layar dan browser pengguna. Jangan menentukan rendering strategy atau framework tertentu pada tahap ini."
    );
  }

  if (flags.mobile) {
    sections.push(
      "Platform Mobile: pertimbangkan konteks perangkat — penggunaan sambil bergerak, konektivitas tidak stabil, izin perangkat, dan distribusi lewat toko aplikasi. Jangan menentukan native vs cross-platform pada tahap ini."
    );
  }

  if (flags.backend) {
    sections.push(
      "Platform Backend / API: pertimbangkan pemanggil layanan (klien web/mobile), kebutuhan kontrak endpoint, dan perlindungan data sensitif. Jangan menentukan database fisik pada tahap ini."
    );
  }

  if (sections.length === 0) {
    return "";
  }

  return `# Pertimbangan platform\n${sections.join("\n\n")}`;
}

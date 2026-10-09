import { test, expect } from "@playwright/test";

test.describe("R3 Prompt Chain E2E Workflow", () => {
  test("completes end-to-end chain flow: P-00 -> approve agent -> P-01 -> approve -> P-02", async ({
    page,
    isMobile,
  }) => {
    // 1. Visit homepage
    await page.goto("/");
    await expect(page).toHaveTitle(/Forma/);

    // 2. Load demo project KostCerdas
    const demoButton = page.locator("button", { hasText: /Muat Contoh KostCerdas/i });
    await expect(demoButton).toBeVisible({ timeout: 10000 });
    await demoButton.click();

    // Verify demo load notification
    await expect(page.locator("text=Proyek demo KostCerdas berhasil dimuat!")).toBeVisible();

    // 3. Open Studio for KostCerdas
    const studioLink = page.locator("a", { hasText: /Buka Studio/i }).first();
    await expect(studioLink).toBeVisible();
    await studioLink.click();

    // 4. Verify Chain Stepper buttons are visible
    await expect(page.locator("button", { hasText: /P-00: Klarifikasi Ide/i })).toBeVisible();
    await expect(page.locator("button", { hasText: /P-01: Product Brief/i })).toBeVisible();
    await expect(page.locator("button", { hasText: /P-02: PRD & Requirements/i })).toBeVisible();

    // 5. If mobile, select tab 3: Capture Hasil Agent
    if (isMobile) {
      const artifactTab = page.locator("button", { hasText: /Tangkap Hasil Agent/i });
      await artifactTab.click();
    }

    // 6. Paste simulated agent output into the editor
    const artifactTextarea = page.locator("textarea[placeholder*='Tempelkan hasil markdown']");
    await expect(artifactTextarea).toBeVisible();
    await artifactTextarea.fill(
      "# Hasil Agent P-00 Terverifikasi\nTarget: Mahasiswa kos dengan budget 1.5jt/bulan.\nMasalah utama: Pencatatan manual sering terlupa."
    );

    // 7. Click "Setujui Hasil (Approve)"
    const approveBtn = page.locator("button", { hasText: /Setujui Hasil/i });
    await expect(approveBtn).toBeVisible();
    await approveBtn.click();

    // Verify feedback message
    await expect(
      page.locator("text=Hasil tahap P-00-IDEA berhasil DISETUJUI")
    ).toBeVisible();

    // 8. Select Stage 2: P-01 Product Brief
    const stage2Btn = page.locator("button", { hasText: /P-01: Product Brief/i });
    await stage2Btn.click();

    // Verify prerequisite blocking banner is NOT visible (since P-00 was approved)
    await expect(page.locator("text=Prasyarat Tahap Ini Belum Terpenuhi")).not.toBeVisible();

    // 9. Switch to Preview Prompt tab in P-01
    if (isMobile) {
      const promptTab = page.locator("button", { hasText: /Prompt & Validasi/i });
      await promptTab.click();
    }

    // Verify compiled prompt contains upstream approved P-00 context
    const promptPreviewArea = page.locator("pre").first();
    await expect(promptPreviewArea).toBeVisible();
    await expect(promptPreviewArea).toContainText("Konteks Discovery yang Disetujui");
    await expect(promptPreviewArea).toContainText("Hasil Agent P-00 Terverifikasi");
    await expect(promptPreviewArea).toContainText("Mahasiswa kos dengan budget 1.5jt/bulan");

    // 10. In P-01, capture agent output for Product Brief
    if (isMobile) {
      const artifactTab = page.locator("button", { hasText: /Tangkap Hasil Agent/i });
      await artifactTab.click();
    }
    await artifactTextarea.fill(
      "# Dokumen Product Brief Disetujui\nFitur MVP: Pencatatan pengeluaran cepat, kategori otomatis, budget tracker."
    );
    await approveBtn.click();
    await expect(
      page.locator("text=Hasil tahap P-01-PRODUCT-BRIEF berhasil DISETUJUI")
    ).toBeVisible();

    // 11. Select Stage 3: P-02 PRD & Requirements
    const stage3Btn = page.locator("button", { hasText: /P-02: PRD & Requirements/i });
    await stage3Btn.click();

    // Verify prerequisite banner is NOT visible
    await expect(page.locator("text=Prasyarat Tahap Ini Belum Terpenuhi")).not.toBeVisible();

    // Check P-02 prompt preview has P-01 Product Brief content
    if (isMobile) {
      const promptTab = page.locator("button", { hasText: /Prompt & Validasi/i });
      await promptTab.click();
    }
    await expect(promptPreviewArea).toContainText("Dokumen Product Brief Disetujui");
    await expect(promptPreviewArea).toContainText("Pencatatan pengeluaran cepat");
  });
});

import { expect, test } from '@playwright/test';

function expectRatiosToMatch(actual: number, expected: number) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(0.02);
}

test.describe('photography portfolio responsive shell', () => {
  test('loads without page-level horizontal overflow', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle('無影集 | SEEN BY NOTHING');
    await expect(page.locator('body')).toBeVisible();

    const overflow = await page.evaluate(() => {
      const documentElement = document.documentElement;
      return documentElement.scrollWidth - documentElement.clientWidth;
    });

    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('photo detail overlay keeps metadata and controls responsive', async ({ page }, testInfo) => {
    await page.goto('/');

    await page.getByRole('button', { exact: true, name: '暖 Apricity' }).click();
    await page.waitForFunction(() =>
      Array.from(document.querySelectorAll<HTMLImageElement>('[data-testid="photo-preview-image"]'))
        .slice(0, 6)
        .every((image) => image.complete && image.naturalWidth > 0 && image.naturalHeight > 0),
    );

    const previewDiagnostics = await page.getByTestId('photo-preview-frame').evaluateAll((frames) =>
      frames.slice(0, 6).map((frame) => {
        const image = frame.querySelector<HTMLImageElement>('[data-testid="photo-preview-image"]');
        const rect = frame.getBoundingClientRect();
        return {
          frameRatio: rect.width / rect.height,
          imageRatio: image ? image.naturalWidth / image.naturalHeight : 0,
          src: image?.currentSrc ?? '',
        };
      }),
    );

    expect(previewDiagnostics.length).toBeGreaterThan(0);
    for (const diagnostic of previewDiagnostics) {
      expect(diagnostic.src).toMatch(/\/images\/photography\/[a-z]+\/preview\/[a-z]+-\d{2}-[a-f0-9]{10}-preview\.jpg$/);
      expectRatiosToMatch(diagnostic.frameRatio, diagnostic.imageRatio);
    }

    await page.getByRole('button', { name: /暖主题摄影作品 1/ }).click();

    const dialog = page.getByRole('dialog');
    const detailCard = page.getByTestId('photo-detail-card');
    await expect(dialog).toBeVisible();
    await expect(detailCard).toBeVisible();
    await expect(page.getByRole('heading', { name: '窗外01' })).toBeVisible();
    await expect(page.getByText('感光度')).toHaveCount(0);
    await expect(page.getByText('拍摄日期')).toBeVisible();
    await expect(page.getByText('地点')).toBeVisible();
    await expect(page.getByText('澳门')).toBeVisible();
    await expect(page.getByTestId('photo-detail-image')).toHaveCount(1);
    await expect(page.getByTestId('photo-detail-image')).toHaveAttribute('data-full-loaded', 'true');

    const detailDiagnostic = await page.getByTestId('photo-detail-image').evaluate((image) => {
      const element = image as HTMLImageElement;
      const rect = element.getBoundingClientRect();
      return {
        displayRatio: rect.width / rect.height,
        naturalRatio: element.naturalWidth / element.naturalHeight,
        src: element.currentSrc,
      };
    });
    expect(detailDiagnostic.src).toMatch(/\/images\/photography\/[a-z]+\/[a-z]+-\d{2}-[a-f0-9]{10}\.jpg$/);
    expectRatiosToMatch(detailDiagnostic.displayRatio, detailDiagnostic.naturalRatio);

    const closeBox = await page.getByRole('button', { name: '关闭' }).boundingBox();
    expect(closeBox?.width ?? 0).toBeGreaterThanOrEqual(44);
    expect(closeBox?.height ?? 0).toBeGreaterThanOrEqual(44);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);

    const cardBox = await detailCard.boundingBox();
    expect(cardBox).not.toBeNull();

    if (testInfo.project.name === 'edge-1440') {
      expect(cardBox?.width ?? 0).toBeGreaterThanOrEqual(1440 * 0.78);
      expect(cardBox?.height ?? 0).toBeGreaterThanOrEqual(1000 * 0.78);
    }
  });
});

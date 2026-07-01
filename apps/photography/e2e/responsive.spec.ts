import { expect, test } from '@playwright/test';

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

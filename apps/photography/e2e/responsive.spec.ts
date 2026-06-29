import { expect, test } from '@playwright/test';

test.describe('photography portfolio responsive shell', () => {
  test('loads without page-level horizontal overflow', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/摄影|photography/i);
    await expect(page.locator('body')).toBeVisible();

    const overflow = await page.evaluate(() => {
      const documentElement = document.documentElement;
      return documentElement.scrollWidth - documentElement.clientWidth;
    });

    expect(overflow).toBeLessThanOrEqual(1);
  });
});

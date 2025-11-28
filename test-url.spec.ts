import { test, expect } from "@playwright/test"; test("test url", async ({ page }) => { await page.goto("http://localhost:3000"); await expect(page).toHaveTitle(/Finance/); });

import { test, expect } from "@playwright/test";

test.describe("auth error page", () => {
  test("shows OAuthSignin message", async ({ page }) => {
    await page.goto("/auth/error?error=OAuthSignin");
    await expect(page.getByText("Authentication Error")).toBeVisible();
    await expect(page.getByText("Error starting sign in flow.")).toBeVisible();
    await expect(page.getByText("Error code: OAuthSignin")).toBeVisible();
  });

  test("shows OAuthCallback message", async ({ page }) => {
    await page.goto("/auth/error?error=OAuthCallback");
    await expect(page.getByText("Error during OAuth callback.")).toBeVisible();
    await expect(page.getByText("Error code: OAuthCallback")).toBeVisible();
  });

  test("shows SessionRequired message", async ({ page }) => {
    await page.goto("/auth/error?error=SessionRequired");
    await expect(
      page.getByText("Please sign in to view this page."),
    ).toBeVisible();
    await expect(page.getByText("Error code: SessionRequired")).toBeVisible();
  });

  test("shows unknown fallback for missing code", async ({ page }) => {
    await page.goto("/auth/error");
    await expect(page.getByText("An unknown error occurred.")).toBeVisible();
    await expect(page.getByText("Error code: unknown")).toBeVisible();
  });
});

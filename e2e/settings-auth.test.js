import { test, expect } from "@playwright/test";

const settingsResult = {
  result: [
    "theme=dark",
    "language=en",
    "timezone=UTC",
    "temperature=0.7",
    "model=gpt-4o-mini",
    "layout=compact",
    "profile=default",
  ].join("\n"),
};

test.describe("settings auth flows", () => {
  test("shows unauthorized state when session is absent", async ({ page }) => {
    await page.route("**/api/auth/session", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(null),
      });
    });

    await page.route("**/api/settings", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(settingsResult),
      });
    });

    await page.goto("/settings");

    const main = page.getByRole("main");
    await expect(
      main.getByText(/Please login to access Settings/i),
    ).toBeVisible();
    await expect(main.getByRole("button", { name: /Login/i })).toBeVisible();
  });

  test("shows settings table and supports filter/pagination when authenticated", async ({
    page,
  }, testInfo) => {
    await page.route("**/api/auth/session", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: { name: "Test User", email: "test@example.com" },
          expires: "2099-01-01T00:00:00.000Z",
        }),
      });
    });

    await page.route("**/api/settings", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(settingsResult),
      });
    });

    await page.goto("/settings");

    if (!testInfo.project.use.isMobile) {
      await expect(page.getByTestId("table")).toBeVisible();
    } else {
      await expect(
        page.locator(".lg\\:hidden").getByText("theme").first(),
      ).toBeVisible();
    }
    await expect(page.getByTestId("current-page")).toHaveText("1");
    await expect(page.getByTestId("total-pages")).toHaveText("2");

    await page.getByTestId("next-page").click();
    await expect(page.getByTestId("current-page")).toHaveText("2");

    const searchInput = page.getByRole("textbox").first();
    await searchInput.fill("timezone");
    await page.waitForTimeout(600);
    await expect(page.getByTestId("total-pages")).toHaveText("1");
    if (!testInfo.project.use.isMobile) {
      await expect(page.getByText("timezone").first()).toBeVisible();
    } else {
      await expect(
        page.locator(".lg\\:hidden").getByText("timezone").first(),
      ).toBeVisible();
    }
  });
});

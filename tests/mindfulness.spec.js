import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("builds and completes a mindfulness routine", async ({ page }) => {
  const buildButton = page.getByRole("button", { name: "Build my routine" });

  await expect(page).toHaveTitle("Daily Mindfulness Practice");
  await expect(page.getByRole("heading", { name: "A few minutes, on purpose." })).toBeVisible();
  await expect(buildButton).toBeDisabled();

  const stressGoal = page.getByRole("button", { name: /Reduce stress and anxiety/ });
  await stressGoal.click();
  await page.getByRole("button", { name: /2–5 minutes/ }).click();
  await expect(stressGoal).toHaveAttribute("aria-pressed", "true");
  await expect(buildButton).toBeEnabled();
  await buildButton.click();

  await expect(page.getByRole("heading", { name: "Today's practice" })).toBeFocused();
  await expect(page.locator(".plan-item")).toHaveCount(3);
  await expect(page.locator("#plan-list")).toContainText("Paced breathing");
  await expect(page.locator("#plan-total")).toHaveText("5 min");

  await page.getByRole("button", { name: "One minute more for Paced breathing" }).click();
  await expect(page.locator("#plan-total")).toHaveText("6 min");
  await expect(page.getByRole("button", { name: "One minute more for Paced breathing" })).toBeFocused();

  const infoButton = page.getByRole("button", { name: "About Paced breathing" });
  await infoButton.click();
  await expect(page.getByRole("dialog", { name: "Paced breathing" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(infoButton).toBeFocused();

  await page.getByRole("button", { name: "Begin session" }).click();
  const inhaleScale = await page.locator("#orb").evaluate(element => new DOMMatrix(getComputedStyle(element).transform).a);
  expect(inhaleScale).toBeLessThan(1.5);
  await expect(page.getByRole("heading", { name: /Paced breathing/ })).toBeFocused();
  await expect(page.locator("#ex-step")).toHaveText("Exercise 1 of 3");
  await expect(page.locator("#total-timer")).toHaveText("6:00");

  await page.getByRole("button", { name: "Pause" }).click();
  await expect(page.getByRole("button", { name: "Resume" })).toBeVisible();
  await expect(page.locator("#orb-phase")).toHaveText("Paused");
  const pausedTransform = await page.locator("#orb").evaluate(element => getComputedStyle(element).transform);
  await page.waitForTimeout(250);
  await expect.poll(() => page.locator("#orb").evaluate(element => getComputedStyle(element).transform))
    .toBe(pausedTransform);
  await page.getByRole("button", { name: "Resume" }).click();
  await expect(page.locator("#orb-phase")).not.toHaveText("Paused");
  await page.getByRole("button", { name: "Skip exercise" }).click();
  await expect(page.locator("#ex-step")).toHaveText("Exercise 2 of 3");

  await page.getByRole("button", { name: "End session" }).click();
  await expect(page.getByRole("heading", { name: "Practice complete." })).toBeVisible();
  await expect(page.locator("#done-sub")).toContainText("less than a minute");
});

test("persists and resets preferences", async ({ page }) => {
  await page.getByRole("button", { name: /Better focus/ }).click();
  await page.getByRole("button", { name: /Varies day to day/ }).click();
  await page.locator("#time-range").fill("7");
  await page.getByRole("button", { name: "Build my routine" }).click();

  await page.reload();
  await expect(page.getByRole("button", { name: /Better focus/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: /Varies day to day/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#time-range")).toHaveValue("7");
  await expect(page.getByRole("button", { name: "Build my routine" })).toBeEnabled();

  await page.getByRole("button", { name: "Reset preferences" }).click();
  await expect(page.getByRole("button", { name: "Build my routine" })).toBeDisabled();
  await expect(page.getByRole("button", { name: /Better focus/ })).toHaveAttribute("aria-pressed", "false");
});

test("rejects malformed saved preferences", async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem("practice-prefs", JSON.stringify({
      goal: "stress",
      timeChoice: "varies",
      totalMin: "<img src=x onerror=alert(1)>",
      breath: "not-a-pattern"
    }));
  });
  await page.reload();

  await expect(page.locator("#time-range")).toHaveValue("12");
  await expect(page.locator("img")).toHaveCount(0);
  await page.getByRole("button", { name: "Build my routine" }).click();
  await page.getByRole("button", { name: "Begin session" }).click();
  await expect(page.locator("#orb-phase")).toHaveText("Breathe in");

  const policy = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute("content");
  expect(policy).toContain("object-src 'none'");
  expect(policy).toContain("base-uri 'none'");
});

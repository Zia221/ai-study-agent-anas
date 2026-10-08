import { test, expect } from "@playwright/test";

test("student can register, login, and access protected pages", async ({
  page,
}) => {
  // Generate unique user so repeated test runs don't conflict
  const uniqueId = Date.now();

  const username = `e2e_student_${uniqueId}`;
  const email = `e2e_student_${uniqueId}@example.com`;
  const password = "password123";

  // -------------------------
  // 1. Open Register page
  // -------------------------

  await page.goto("/register");

  await expect(
    page.getByRole("heading", { name: "Create your account" })
  ).toBeVisible();

  // -------------------------
  // 2. Register
  // -------------------------

  await page.locator("#username").fill(username);
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);

  await page.getByRole("button", { name: "Create Account" }).click();

  // Registration should redirect to login
  await expect(page).toHaveURL(/\/login$/);

  // -------------------------
  // 3. Login
  // -------------------------

  await expect(
    page.getByRole("heading", { name: "Welcome back" })
  ).toBeVisible();

  await page.locator("#username").fill(username);
  await page.locator("#password").fill(password);

  await page.getByRole("button", { name: "Sign In" }).click();

  // -------------------------
  // 4. Dashboard
  // -------------------------

  await expect(page).toHaveURL("http://localhost:5173/");

  // Make sure login token exists
  const token = await page.evaluate(() => {
    return localStorage.getItem("ai_study_agent_token");
  });

  expect(token).toBeTruthy();

  // -------------------------
  // 5. Protected route
  // -------------------------

  await page.goto("/progress");

  await expect(page).toHaveURL(/\/progress$/);

  // Page should not redirect back to login
  await expect(page).not.toHaveURL(/\/login$/);
});
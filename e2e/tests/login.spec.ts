import { test, expect } from '@playwright/test';

test.describe('OpenSPP Login', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the main page
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('domcontentloaded');
    
    // Click on "Manage Database" link
    const manageDbSelectors = [
      'text=Manage Database',
      'a:has-text("Manage Database")',
      'button:has-text("Manage Database")',
      '[href*="database"]:has-text("Manage")',
      'a[href="/web/database/manager"]',
    ];
    
    let clicked = false;
    for (const selector of manageDbSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          await element.click();
          clicked = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!clicked) {
      await page.waitForTimeout(2000);
      await page.click('text=Manage Database', { timeout: 5000 });
    }
    
    // Wait for database manager page to load
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // Click on "automation" database to navigate to login page
    const automationDbSelectors = [
      'text=automation',
      'a:has-text("automation")',
      'a[href*="automation"]',
      'tr:has-text("automation") a',
      'td:has-text("automation")',
      '[data-db="automation"]',
    ];
    
    clicked = false;
    for (const selector of automationDbSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          await element.click();
          clicked = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!clicked) {
      await page.waitForTimeout(2000);
      await page.click('text=automation', { timeout: 5000 });
    }
    
    // Wait for redirect to login page
    await page.waitForURL(/\/web\/login/, { timeout: 15000 });
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Wait for login form to be visible (page already navigated by beforeEach)
    await page.waitForSelector('input[name="login"]', { timeout: 10000 });
    
    // Fill in credentials (default Odoo admin credentials)
    const username = process.env.OPENSPP_USERNAME || 'admin';
    const password = process.env.OPENSPP_PASSWORD || 'admin';
    
    await page.fill('input[name="login"]', username);
    await page.fill('input[name="password"]', password);
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for successful login - Odoo redirects to /web# after login
    await page.waitForURL(/\/web#/, { timeout: 15000 });
    
    // Verify we're logged in by checking for main navbar or dashboard elements
    // Adjust selectors based on your OpenSPP UI
    const navbar = page.locator('.o_main_navbar, .o_menu_systray, [data-menu-xmlid]').first();
    await expect(navbar).toBeVisible({ timeout: 10000 });
    
    // Additional verification - check that we're not on login page
    await expect(page).not.toHaveURL(/\/web\/login/);
  });

  test('should show error message with invalid credentials', async ({ page }) => {
    // Wait for login form (page already navigated by beforeEach)
    await page.waitForSelector('input[name="login"]', { timeout: 10000 });
    
    // Fill in invalid credentials
    await page.fill('input[name="login"]', 'invalid_user');
    await page.fill('input[name="password"]', 'invalid_password');
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for error message to appear
    // Odoo typically shows error in alert-danger or notification
    const errorMessage = page.locator('.alert-danger, .o_notification_content, .alert:has-text("Wrong login/password")').first();
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    
    // Verify we're still on login page
    await expect(page).toHaveURL(/\/web\/login/);
  });

  test('should validate required fields', async ({ page }) => {
    // Wait for login form (page already navigated by beforeEach)
    await page.waitForSelector('input[name="login"]', { timeout: 10000 });
    
    // Try to submit without filling fields
    await page.click('button[type="submit"]');
    
    // Check if browser validation prevents submission or shows error
    // Most browsers will show HTML5 validation
    const loginInput = page.locator('input[name="login"]');
    const isRequired = await loginInput.getAttribute('required');
    
    // If HTML5 validation is present, the form won't submit
    // Otherwise, we should see an error message
    if (isRequired === null) {
      // Check for error message if no HTML5 validation
      const errorMessage = page.locator('.alert-danger, .o_notification_content').first();
      await expect(errorMessage).toBeVisible({ timeout: 3000 });
    }
    
    // Verify we're still on login page
    await expect(page).toHaveURL(/\/web\/login/);
  });
});

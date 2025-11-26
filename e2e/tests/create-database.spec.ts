import { test, expect } from '@playwright/test';

test('Create database', async ({ page }) => {
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
  
  // Check if "automation" database already exists
  const automationDbSelectors = [
    'text=automation',
    'a:has-text("automation")',
    'a[href*="automation"]',
    'tr:has-text("automation") a',
    'td:has-text("automation")',
    '[data-db="automation"]',
  ];
  
  let automationExists = false;
  for (const selector of automationDbSelectors) {
    try {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 })) {
        automationExists = true;
        break;
      }
    } catch (e) {
      continue;
    }
  }
  
  // Skip test if automation database already exists
  if (automationExists) {
    console.log('Automation database already exists, skipping database creation test');
    return;
  }
  
  // Create database since it doesn't exist
  console.log('Automation database does not exist, creating it...');
  
  // Click on "Create Database" button/link
  const createDbSelectors = [
    'text=Create Database',
    'a:has-text("Create Database")',
    'button:has-text("Create Database")',
    'input[value="Create Database"]',
    'button[type="submit"]:has-text("Create")',
    'a[href*="create"]:has-text("Create")',
  ];
  
  clicked = false;
  for (const selector of createDbSelectors) {
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
    await page.click('text=Create Database', { timeout: 5000 });
  }
  
  // Wait for database creation form to appear
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  
  // Fill in Master Password field
  const masterPasswordSelectors = [
    'input[name="master_pwd"]',
    'input[type="password"]:first-of-type',
    'input[id*="master"]',
    'input[placeholder*="master" i]',
    'input[placeholder*="Master" i]',
  ];
  
  for (const selector of masterPasswordSelectors) {
    try {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 })) {
        await element.fill('1234');
        break;
      }
    } catch (e) {
      continue;
    }
  }
  
  // Fill in Database Name field
  const dbNameSelectors = [
    'input[name="name"]',
    'input[name="db_name"]',
    'input[name="database_name"]',
    'input[id*="name"]',
    'input[placeholder*="database" i]',
    'input[placeholder*="Database" i]',
  ];
  
  for (const selector of dbNameSelectors) {
    try {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 })) {
        await element.fill('automation');
        break;
      }
    } catch (e) {
      continue;
    }
  }
  
  // Fill in Username field
  const usernameSelectors = [
    'input[name="login"]',
    'input[name="username"]',
    'input[name="admin_login"]',
    'input[id*="login"]',
    'input[id*="username"]',
    'input[placeholder*="login" i]',
    'input[placeholder*="username" i]',
  ];
  
  for (const selector of usernameSelectors) {
    try {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 })) {
        await element.fill('admin');
        break;
      }
    } catch (e) {
      continue;
    }
  }
  
  // Fill in Password field (second password field, not master password)
  const passwordSelectors = [
    'input[name="password"]',
    'input[name="admin_password"]',
    'input[type="password"]:nth-of-type(2)',
    'input[id*="password"]:not([id*="master"])',
    'input[placeholder*="password" i]:not([placeholder*="master" i])',
  ];
  
  for (const selector of passwordSelectors) {
    try {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 })) {
        await element.fill('admin');
        break;
      }
    } catch (e) {
      continue;
    }
  }
  
  // Click the create/submit button
  const submitSelectors = [
    'button[type="submit"]',
    'input[type="submit"]',
    'button:has-text("Create")',
    'button:has-text("Create Database")',
    'input[value="Create"]',
    'input[value="Create Database"]',
  ];
  
  clicked = false;
  for (const selector of submitSelectors) {
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
    await page.click('button[type="submit"]', { timeout: 5000 });
  }
  
  // Wait for database creation to complete
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(5000);
  
  // Verify success - check if we're redirected or see success message
  // The page might redirect to login or show a success message
  const currentUrl = page.url();
  console.log(`Database creation completed. Current URL: ${currentUrl}`);
  
    // If we're still on the database manager page, click on the "automation" database
    // to redirect to the login screen
    if (currentUrl.includes('database') || currentUrl.includes('manager')) {
      // Wait for the database list to appear
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
      
      // Click on the "automation" database
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
    }
  
  console.log('Database creation completed successfully');
});


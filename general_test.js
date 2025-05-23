const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const consoleMessages = [];
  const navigationErrors = [];
  const visitedLinks = new Set();
  let initialHtmlContent = '';
  let frenchHtmlContent = '';
  const results = {
    navigation: [],
    languageSwitch: { tested: false, success: false, error: null, details: [] },
    themeSwitch: { tested: false, success: false, error: null, details: [] },
    jokeComponent: { tested: false, found: false, works: false, error: null, text: null },
    issueListComponent: { tested: false, found: false, interacted: false, error: null, details: [] },
    consoleErrors: [],
    generalErrors: [],
  };

  page.on('console', msg => {
    const message = { text: msg.text(), type: msg.type(), args: msg.args().map(arg => String(arg)), location: msg.location() };
    consoleMessages.push(message);
    if (msg.type() === 'error') {
      results.consoleErrors.push(message);
    }
  });

  async function testLink(url, description) {
    const fullUrl = (url.startsWith('http') || url.startsWith('blob:')) ? url : `http://localhost:8080${url.startsWith('/') ? '' : '/'}${url}`;
    if (visitedLinks.has(fullUrl) || !url || !(url.startsWith('http') || url.startsWith('/') || url.startsWith('blob:'))) {
      if(!url || !(url.startsWith('http') || url.startsWith('/') || url.startsWith('blob:'))) console.log(`Skipping invalid or non-HTTP/blob link: ${description} (${url})`);
      return;
    }
    visitedLinks.add(fullUrl);
    console.log(`Testing link: ${description} (${fullUrl})`);
    results.navigation.push({ description, url: fullUrl, status: 'Attempted' });
    try {
      const response = await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 15000 });
      if (!response) {
        navigationErrors.push({ url: fullUrl, description, error: 'No response from server.' });
        results.navigation.find(n => n.url === fullUrl).status = 'Failed (No Response)';
      } else if (!response.ok()) {
        navigationErrors.push({ url: fullUrl, description, status: response.status(), error: 'Non-OK status' });
        results.navigation.find(n => n.url === fullUrl).status = `Failed (${response.status()})`;
      } else {
        results.navigation.find(n => n.url === fullUrl).status = 'Success';
      }
    } catch (e) {
      navigationErrors.push({ url: fullUrl, description, error: e.message });
      results.navigation.find(n => n.url === fullUrl).status = `Failed (${e.message.substring(0, 50)})`;
    }
  }

  try {
    console.log('Navigating to homepage (http://localhost:8080)...');
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle', timeout: 20000 });
    console.log('Homepage loaded.');
    initialHtmlContent = await page.content();
    results.navigation.push({ description: 'Homepage', url: 'http://localhost:8080', status: 'Success' });

    const links = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a')).map(a => ({ href: a.getAttribute('href'), text: a.innerText.trim() }))
    );
    console.log('Found links on homepage:', links.length);
    for (const link of links) {
      if (link.href) { // Test all hrefs, testLink will filter
        await testLink(link.href, link.text || 'No text link');
      }
    }

    // Test Language Switcher
    results.languageSwitch.tested = true;
    console.log('Attempting to test language switcher...');
    const langSwitchButton = await page.locator('[aria-label="language switch"], [data-testid="language-switcher"], button:has-text("Language"), button:has([data-testid="lucide-languages"])').first().elementHandle().catch(() => null);
    if (langSwitchButton) {
      console.log('Language switch button found. Clicking...');
      results.languageSwitch.details.push('Button found');
      await langSwitchButton.click();
      await page.waitForTimeout(1000);
      const frenchLang = await page.locator('a[hreflang="fr"], button:has-text("Français"), [data-testid="fr-lang-option"], a:has-text("FR")').first().elementHandle().catch(() => null);
      if (frenchLang) {
        console.log('French language option found. Clicking...');
        results.languageSwitch.details.push('French option found');
        await frenchLang.click();
        await page.waitForTimeout(3000);
        console.log('Clicked French. Current URL:', page.url());
        frenchHtmlContent = await page.content();
        if (initialHtmlContent === frenchHtmlContent || initialHtmlContent.length === frenchHtmlContent.length) { // Basic check
           results.languageSwitch.error = 'Content seemed not to change after switching to French.';
           results.languageSwitch.details.push('Error: Content did not change for French');
        } else {
           results.languageSwitch.success = true; // Mark as success if content changed
           results.languageSwitch.details.push('Successfully switched to French (content changed)');
        }
        // Revert to English
        if (await langSwitchButton.isVisible()) await langSwitchButton.click(); else console.log("Lang switch button not visible for reverting");
        await page.waitForTimeout(500);
        const englishLang = await page.locator('a[hreflang="en"], button:has-text("English"), [data-testid="en-lang-option"], a:has-text("EN")').first().elementHandle().catch(() => null);
        if (englishLang) {
          console.log('English language option found. Clicking to revert...');
          await englishLang.click();
          await page.waitForTimeout(2000);
          results.languageSwitch.details.push('Attempted to revert to English');
        } else { results.languageSwitch.details.push('English option not found for revert'); }
      } else { console.log('French language option not found.'); results.languageSwitch.error = 'French option not found.'; results.languageSwitch.details.push('Error: French option not found'); }
    } else { console.log('Language switch button not found.'); results.languageSwitch.error = 'Button not found.'; results.languageSwitch.details.push('Error: Button not found'); }

    // Test Theme Switcher
    results.themeSwitch.tested = true;
    console.log('Attempting to test theme switcher...');
    const themeSwitchButton = await page.locator('[aria-label*="theme" i], [data-testid*="theme" i], button:has-text("mode"), button[aria-label*="Toggle theme" i], button:has([data-testid="lucide-sun"]), button:has([data-testid="lucide-moon"])').first().elementHandle().catch(() => null);
    if (themeSwitchButton) {
      console.log('Theme switch button found.');
      results.themeSwitch.details.push('Button found');
      const initialBodyClass = await page.evaluate(() => document.body.className + " " + (document.documentElement.style.colorScheme || ''));
      await themeSwitchButton.click();
      await page.waitForTimeout(1000);
      const bodyClassAfterFirstClick = await page.evaluate(() => document.body.className + " " + (document.documentElement.style.colorScheme || ''));
      results.themeSwitch.details.push(`Initial class: ${initialBodyClass}, After 1st click: ${bodyClassAfterFirstClick}`);
      if (initialBodyClass === bodyClassAfterFirstClick) {
          results.themeSwitch.error = (results.themeSwitch.error || '') + ' Body class/style did not change after first theme toggle.';
      } else {
          results.themeSwitch.success = true; // Partial success
      }
      await themeSwitchButton.click();
      await page.waitForTimeout(1000);
      const bodyClassAfterSecondClick = await page.evaluate(() => document.body.className + " " + (document.documentElement.style.colorScheme || ''));
      results.themeSwitch.details.push(`After 2nd click: ${bodyClassAfterSecondClick}`);
      if (bodyClassAfterFirstClick === bodyClassAfterSecondClick && results.themeSwitch.success) { // If it changed first time, but not second
         results.themeSwitch.error = (results.themeSwitch.error || '') + ' Body class/style did not change after second theme toggle (revert).';
         results.themeSwitch.success = false; // Full cycle didn't work
      } else if (initialBodyClass !== bodyClassAfterSecondClick && results.themeSwitch.success) {
          results.themeSwitch.error = (results.themeSwitch.error || '') + ' Theme did not revert to initial state.';
          results.themeSwitch.success = false;
      } else if (initialBodyClass === bodyClassAfterSecondClick && results.themeSwitch.success){
          // If it reverted successfully and changed first time
          results.themeSwitch.details.push('Theme toggled and reverted successfully.');
      }


    } else { console.log('Theme switch button not found.'); results.themeSwitch.error = 'Button not found.'; results.themeSwitch.details.push('Error: Button not found'); }

    // Test Joke Component
    results.jokeComponent.tested = true;
    console.log('Checking for Joke component content...');
    const jokeSelector = '//*[contains(text(), "Joke:") or contains(text(), "Q:") or @data-testid="joke-text" or @id="joke-container"]';
    const jokeElements = await page.locator(jokeSelector).first().elementHandle().catch(() => null);
    if (jokeElements) {
      results.jokeComponent.found = true;
      const jokeText = (await jokeElements.innerText()).trim();
      results.jokeComponent.text = jokeText;
      console.log('Joke component found, text:', jokeText.substring(0, 200));
      if (jokeText.toLowerCase().includes('error') || jokeText.toLowerCase().includes('failed to fetch') || jokeText === 'Joke:' || jokeText === 'Q:' || jokeText.length < 10) {
        results.jokeComponent.error = 'Joke component displayed an error or no joke/short joke.';
      } else {
        results.jokeComponent.works = true;
      }
    } else { console.log('Joke component not explicitly found.'); results.jokeComponent.error = 'Joke component not found.'; }

    // Test IssueList
    results.issueListComponent.tested = true;
    console.log('Checking for IssueList component...');
    const issueListParentSelectors = [
        'ul[class*="issue"]', 
        'div[class*="issue-list"]', 
        '[data-testid="issue-list"]',
        '//h2[contains(text(), "Issues")]/following-sibling::ul', // More semantic
        '//h2[contains(text(), "Issues")]/following-sibling::div'
    ];
    let issueListElement = null;
    for (const selector of issueListParentSelectors) {
        issueListElement = await page.locator(selector).first().elementHandle().catch(() => null);
        if (issueListElement) break;
    }

    if (issueListElement) {
      results.issueListComponent.found = true;
      console.log('IssueList-like element found.');
      const issueLinks = await page.locator(issueListElement).locator('a[href*="/issues/"], a[href^="https://github.com/"]').elementHandles();
      results.issueListComponent.details.push(`Found ${issueLinks.length} potential issue links.`);
      if (issueLinks.length > 0) {
        const firstIssueLink = issueLinks[0];
        const issueHref = await firstIssueLink.getAttribute('href');
        const issueText = await firstIssueLink.innerText();
        console.log(`Attempting to test first issue link: ${issueText} (${issueHref})`);
        await testLink(issueHref, `First issue: ${issueText}`);
        results.issueListComponent.interacted = true;
      } else {
        console.log('No links found within the issue list that match pattern.');
        results.issueListComponent.details.push('No matching issue links found within the list.');
      }
    } else { console.log('IssueList-like element not found.'); results.issueListComponent.error = 'IssueList component not found.'; }

  } catch (e) {
    console.error('General Playwright script error:', e);
    results.generalErrors.push({ url: page.url(), description: 'General Playwright failure', error: e.message });
  } finally {
    fs.writeFileSync('playwright_results.json', JSON.stringify(results, null, 2));
    // For stdout, just a summary
    console.log('\n--- Test Summary (more details in playwright_results.json) ---');
    console.log('Navigation Errors/Warnings:', JSON.stringify(navigationErrors, null, 2));
    console.log('\nConsole Errors:');
    console.log(JSON.stringify(results.consoleErrors, null, 2));
    await browser.close();
    console.log('Browser closed.');
  }
})();

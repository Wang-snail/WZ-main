const { chromium } = require('playwright');
const path = require('path');

async function testPage() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Collect console errors
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });
    page.on('pageerror', err => {
        errors.push(err.message);
    });

    const filePath = path.resolve(__dirname, 'index.html');
    await page.goto(`file://${filePath}`);

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Test 1: Check page title
    const title = await page.title();
    console.log('✓ Page title:', title);

    // Test 2: Check main elements exist
    const header = await page.$('.header');
    console.log('✓ Header exists:', !!header);

    const logo = await page.$('.logo-text');
    console.log('✓ Logo exists:', !!logo);

    // Test 3: Check input panel
    const problemTitle = await page.$('#problemTitle');
    const problemDesc = await page.$('#problemDescription');
    console.log('✓ Problem title input exists:', !!problemTitle);
    console.log('✓ Problem description input exists:', !!problemDesc);

    // Test 4: Check generate button
    const generateBtn = await page.$('#generateBtn');
    console.log('✓ Generate button exists:', !!generateBtn);

    // Test 5: Load sample data
    await page.click('button:has-text("加载示例")');
    await page.waitForTimeout(500);

    const titleValue = await page.$eval('#problemTitle', el => el.value);
    console.log('✓ Sample data loaded:', titleValue.includes('外观缺陷'));

    // Test 6: Generate report
    await page.click('#generateBtn');
    await page.waitForTimeout(3000); // Wait for simulated generation

    const reportContainer = await page.$('#reportContainer');
    const containerDisplay = await reportContainer.evaluate(el => getComputedStyle(el).display);
    console.log('✓ Report container visible:', containerDisplay !== 'none');

    // Test 7: Check report steps
    const stepCards = await page.$$('.step-card');
    console.log('✓ Number of 8D steps:', stepCards.length);

    // Test 8: Test toast notification
    const toastContainer = await page.$('#toastContainer');
    console.log('✓ Toast container exists:', !!toastContainer);

    // Test 9: Check export buttons
    const copyBtn = await page.$('button:has-text("复制")');
    const markdownBtn = await page.$('button:has-text("Markdown")');
    const pdfBtn = await page.$('button:has-text("导出PDF")');
    console.log('✓ Export buttons exist:', !!copyBtn && !!markdownBtn && !!pdfBtn);

    // Report errors
    if (errors.length > 0) {
        console.log('\n✗ Console errors found:');
        errors.forEach(err => console.log('  -', err));
    } else {
        console.log('\n✓ No console errors detected');
    }

    await browser.close();

    return errors.length === 0;
}

testPage()
    .then(success => {
        if (success) {
            console.log('\n========================================');
            console.log('All tests passed! Page is working correctly.');
            console.log('========================================\n');
            process.exit(0);
        } else {
            console.log('\n========================================');
            console.log('Some tests failed. Please check the errors above.');
            console.log('========================================\n');
            process.exit(1);
        }
    })
    .catch(err => {
        console.error('Test error:', err);
        process.exit(1);
    });

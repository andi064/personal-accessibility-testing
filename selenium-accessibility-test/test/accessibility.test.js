 const { Builder, By } = require('selenium-webdriver');
const { expect } = require('chai');
const axe = require('@axe-core/webdriverjs');
const mocha = require('mocha');

describe('Mars Demo Accessibility Tests', function () {
  this.timeout(30000); // extend timeout for Selenium

  let driver;

  before(async () => {
    driver = await new Builder().forBrowser('chrome').build();
    await driver.get('https://dequeuniversity.com/demo/mars');
  });

  after(async () => {
    await driver.quit();
  });

  it('should load the main-nav element', async () => {
    const nav = await driver.findElement(By.css('.main-nav'));
    const isDisplayed = await nav.isDisplayed();
    expect(isDisplayed).to.be.true;
  });

  it('should have no accessibility violations', async () => {
    await axe(driver).analyze().then((results) => {
      console.log('Accessibility Violations:', results.violations);
      expect(results.violations.length).to.equal(0);
    });
  });
});


const { Builder, By } = require('selenium-webdriver'); // Import classes from Selenium WebDriver Builder and By to control the browser
const { expect } = require('chai'); // expect assertion from npm modules
const AxeBuilder = require('@axe-core/webdriverjs').default; 
const mocha = require('mocha'); //import mocha to run the test from npm modules

describe('Mars Demo Accessibility Tests', function () {
  this.timeout(30000); //default time out for mocha is 2 secs extend to 30 secs

  let driver;

  before(async () => { //hook function from mocha to decide what runs first and after
    driver = await new Builder().forBrowser('chrome').build();
    await driver.get('https://dequeuniversity.com/demo/mars');
  });

  after(async () => {
    await driver.quit();
  });

  it('should load the main-nav element', async () => { //it is used to define the test case
    const nav = await driver.findElement(By.css('.main-nav'));
    const isDisplayed = await nav.isDisplayed();
    expect(isDisplayed).to.be.true;
  });

  it('should have no accessibility violations', async () => {
    const builder = new AxeBuilder(driver);
    const results = await builder.analyze();
    console.log('Accessibility Violations:', results.violations);
    expect(results.violations.length).to.equal(0);
  });
});

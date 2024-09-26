const { defineConfig } = require('cypress');

module.exports = defineConfig({
  video: false,
  screenshotOnRunFailure: false,
  chromeWebSecurity: false,
  fixturesFolder: 'tests/e2e/fixtures',
  screenshotsFolder: 'tests/e2e/screenshots',
  e2e: {
    baseUrl: 'http://libris.kb.se.localhost:5000/katalogisering',
    testIsolation: false,
    experimentalRunAllSpecs: true,
    specPattern: 'tests/e2e/specs/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'tests/e2e/support/index.js',
  },
});

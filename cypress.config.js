const { defineConfig } = require("cypress");

module.exports = defineConfig({
  // ─── Global Settings ────────────────────────────────────────────
  projectId: "cypress-qa-showcase",
  viewportWidth: 1280,
  viewportHeight: 720,
  video: true,
  screenshotOnRunFailure: true,
  defaultCommandTimeout: 8000,
  requestTimeout: 10000,
  responseTimeout: 10000,
  retries: {
    runMode: 2,    // retry failed tests in CI
    openMode: 0,
  },

  // ─── Reporter ────────────────────────────────────────────────────
  reporter: "mochawesome",
  reporterOptions: {
    reportDir: "cypress/reports",
    overwrite: false,
    html: true,
    json: true,
    timestamp: "mmddyyyy_HHMMss",
  },

  // ─── Environment Variables ───────────────────────────────────────
  env: {
    // Base URLs
    BASE_URL: "https://www.saucedemo.com",
    API_BASE_URL: "https://reqres.in/api",
    TODO_BASE_URL: "https://todo.ly",

    // Credentials (in real projects these come from CI secrets)
    STANDARD_USER: "standard_user",
    LOCKED_USER: "locked_out_user",
    PERFORMANCE_USER: "performance_glitch_user",
    PASSWORD: "secret_sauce",

    // API keys placeholder
    API_KEY: "reqres-free-v1",
  },

  e2e: {
    // Base URL maps to SauceDemo for UI tests
    baseUrl: "https://www.saucedemo.com",
    specPattern: "cypress/e2e/**/*.cy.js",
    supportFile: "cypress/support/e2e.js",

    setupNodeEvents(on, config) {
      // ── Task: Log to terminal ──────────────────────────────────
      on("task", {
        log(message) {
          console.log(`\n[CYPRESS TASK] ${message}`);
          return null;
        },
        table(data) {
          console.table(data);
          return null;
        },
      });

      // ── Read environment from CI if available ─────────────────
      if (process.env.BASE_URL) config.env.BASE_URL = process.env.BASE_URL;
      if (process.env.API_KEY)  config.env.API_KEY  = process.env.API_KEY;

      return config;
    },
  },
});

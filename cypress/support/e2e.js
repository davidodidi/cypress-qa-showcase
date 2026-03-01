// ─── cypress/support/e2e.js ───────────────────────────────────────────────────
// Global support file — loaded before every spec file.
// Registers custom commands, global hooks, and third-party plugins.

import "./commands";
import "./api.commands";

// ─── Global Hooks ────────────────────────────────────────────────────────────

beforeEach(function () {
  // Attach test metadata to Cypress for reporting
  cy.task("log", `▶ Starting: "${this.currentTest?.fullTitle()}"`);
});

afterEach(function () {
  if (this.currentTest?.state === "failed") {
    cy.task("log", `✖ FAILED: "${this.currentTest.fullTitle()}"`);
    // Screenshot is auto-captured by Cypress on failure
  }
});

// ─── Global Exception Handling ───────────────────────────────────────────────
// Prevent uncaught app exceptions from failing tests unless explicitly needed

Cypress.on("uncaught:exception", (err) => {
  // Ignore common third-party script errors
  if (
    err.message.includes("ResizeObserver loop") ||
    err.message.includes("Script error") ||
    err.message.includes("ChunkLoadError")
  ) {
    return false; // returning false prevents test failure
  }
  // All other errors still fail the test
  return true;
});

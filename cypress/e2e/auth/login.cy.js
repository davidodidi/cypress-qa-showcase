// ─── cypress/e2e/auth/login.cy.js ────────────────────────────────────────────
// Auth test suite covering positive, negative, and edge case login scenarios
// using Page Object Model + data-driven testing from fixtures.

import LoginPage from "../../support/pages/LoginPage";
import InventoryPage from "../../support/pages/InventoryPage";

describe("🔐 Authentication - Login", () => {
  beforeEach(() => {
    LoginPage.visit();
  });

  // ── Positive Scenarios ───────────────────────────────────────────────────
  context("Valid Login", () => {
    it("should login successfully with standard_user credentials", () => {
      LoginPage.loginAs(
        Cypress.env("STANDARD_USER"),
        Cypress.env("PASSWORD")
      );

      cy.url().should("include", "/inventory.html");
      InventoryPage.assertPageTitle("Products");
      InventoryPage.assertProductCount(6);
    });

    it("should redirect to login when accessing inventory without session", () => {
      cy.visit("/inventory.html");
      cy.url().should("eq", `${Cypress.config("baseUrl")}/`);
      LoginPage.loginButton.should("be.visible");
    });
  });

  // ── Negative Scenarios (data-driven) ────────────────────────────────────
  context("Invalid Login — Data-Driven", () => {
    const invalidCases = [
      {
        scenario: "empty credentials",
        username: "",
        password: "",
        expectedError: "Username is required",
      },
      {
        scenario: "username only",
        username: "standard_user",
        password: "",
        expectedError: "Password is required",
      },
      {
        scenario: "wrong credentials",
        username: "wrong_user",
        password: "wrong_pass",
        expectedError: "Username and password do not match",
      },
    ];

    invalidCases.forEach(({ scenario, username, password, expectedError }) => {
      it(`should show error for: ${scenario}`, () => {
        if (username) LoginPage.enterUsername(username);
        if (password) LoginPage.enterPassword(password);
        LoginPage.clickLogin();
        LoginPage.assertErrorVisible(expectedError);
        cy.url().should("eq", `${Cypress.config("baseUrl")}/`);
      });
    });
  });

  // ── Locked User ──────────────────────────────────────────────────────────
  context("Locked Out User", () => {
    it("should display locked out error message", () => {
      LoginPage.loginAs(
        Cypress.env("LOCKED_USER"),
        Cypress.env("PASSWORD")
      );
      LoginPage.assertErrorVisible("Sorry, this user has been locked out");
    });
  });

  // ── Logout ───────────────────────────────────────────────────────────────
  context("Logout", () => {
    it("should logout and return to login page", () => {
      cy.loginUI("standard");
      cy.logout();
      LoginPage.assertOnLoginPage();
    });

    it("should not access inventory after logout", () => {
      cy.loginUI("standard");
      cy.logout();
      cy.visit("/inventory.html");
      cy.url().should("eq", `${Cypress.config("baseUrl")}/`);
    });
  });
});

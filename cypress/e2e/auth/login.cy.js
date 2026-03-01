// ─── cypress/e2e/auth/login.cy.js ────────────────────────────────────────────
import LoginPage from "../../support/pages/LoginPage";
import InventoryPage from "../../support/pages/InventoryPage";

describe("🔐 Authentication - Login", () => {

  // Visit ONCE for the entire suite — SauceDemo rate-limits CI runners
  before(() => {
    LoginPage.visit();
  });

  // ── Valid Login ──────────────────────────────────────────────────────────
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

    // After login we're on inventory — navigate away without a full page reload
    it("should redirect to login when accessing inventory without session", () => {
      // Clear session so we're unauthenticated
      cy.clearCookies();
      cy.clearLocalStorage();
      // Use cy.visit with failOnStatusCode false to avoid full reload blocking
      cy.visit("/inventory.html", { failOnStatusCode: false });
      cy.url().should("eq", `${Cypress.config("baseUrl")}/`);
      LoginPage.loginButton.should("be.visible");
    });
  });

  // ── Invalid Login — Data-Driven ──────────────────────────────────────────
  // Re-use the page that SauceDemo already redirected us to (the login page)
  context("Invalid Login — Data-Driven", () => {
    const invalidCases = [
      { scenario: "empty credentials",   username: "",              password: "",             expectedError: "Username is required" },
      { scenario: "username only",        username: "standard_user", password: "",             expectedError: "Password is required" },
      { scenario: "wrong credentials",    username: "wrong_user",    password: "wrong_pass",   expectedError: "Username and password do not match" },
    ];

    invalidCases.forEach(({ scenario, username, password, expectedError }) => {
      it(`should show error for: ${scenario}`, () => {
        // We're already on the login page — just clear fields and try
        cy.get("[data-test='username']").clear();
        cy.get("[data-test='password']").clear();
        if (username) LoginPage.enterUsername(username);
        if (password) LoginPage.enterPassword(password);
        LoginPage.clickLogin();
        LoginPage.assertErrorVisible(expectedError);
        cy.url().should("eq", `${Cypress.config("baseUrl")}/`);
      });
    });
  });

  // ── Locked Out User ──────────────────────────────────────────────────────
  context("Locked Out User", () => {
    it("should display locked out error message", () => {
      cy.get("[data-test='username']").clear();
      cy.get("[data-test='password']").clear();
      LoginPage.loginAs(Cypress.env("LOCKED_USER"), Cypress.env("PASSWORD"));
      LoginPage.assertErrorVisible("Sorry, this user has been locked out");
    });
  });

  // ── Logout ───────────────────────────────────────────────────────────────
  context("Logout", () => {
    it("should logout and return to login page", () => {
      // Login first using UI (we're already on login page)
      cy.get("[data-test='username']").clear();
      cy.get("[data-test='password']").clear();
      LoginPage.loginAs(
        Cypress.env("STANDARD_USER"),
        Cypress.env("PASSWORD")
      );
      cy.url().should("include", "/inventory.html");
      cy.logout();
      LoginPage.assertOnLoginPage();
    });
  });
});

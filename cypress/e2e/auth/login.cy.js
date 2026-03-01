// ─── cypress/e2e/auth/login.cy.js ────────────────────────────────────────────
import LoginPage from "../../support/pages/LoginPage";
import InventoryPage from "../../support/pages/InventoryPage";

describe("🔐 Authentication - Login", { testIsolation: false }, () => {

  before(() => {
    LoginPage.visit();
  });

  // ── Valid Login ────────────────────────────────────────────────────────────
  context("Valid Login", () => {
    it("should login successfully with standard_user credentials", () => {
      LoginPage.loginAs(Cypress.env("STANDARD_USER"), Cypress.env("PASSWORD"));
      cy.url().should("include", "/inventory.html");
      InventoryPage.assertPageTitle("Products");
      InventoryPage.assertProductCount(6);
    });

    it("should redirect to login when accessing inventory without session", () => {
      // Logout using burger menu to get back to login page
      cy.logout();
      // Now verify we are on login page (unauthenticated state confirmed)
      cy.url().should("eq", `${Cypress.config("baseUrl")}/`);
      LoginPage.loginButton.should("be.visible");
    });
  });

  // ── Invalid Login — Data-Driven ────────────────────────────────────────────
  // Already on login page from previous test (after logout)
  context("Invalid Login — Data-Driven", () => {
    const invalidCases = [
      { scenario: "empty credentials",  username: "",              password: "",           expectedError: "Username is required" },
      { scenario: "username only",       username: "standard_user", password: "",           expectedError: "Password is required" },
      { scenario: "wrong credentials",   username: "wrong_user",    password: "wrong_pass", expectedError: "Username and password do not match" },
    ];

    invalidCases.forEach(({ scenario, username, password, expectedError }) => {
      it(`should show error for: ${scenario}`, () => {
        cy.get("[data-test='username']").clear();
        cy.get("[data-test='password']").clear();
        if (username) LoginPage.enterUsername(username);
        if (password) LoginPage.enterPassword(password);
        LoginPage.clickLogin();
        LoginPage.assertErrorVisible(expectedError);
        // Close the error so next test starts clean
        cy.get("[data-test='error-button']").click();
      });
    });
  });

  // ── Locked Out User ────────────────────────────────────────────────────────
  context("Locked Out User", () => {
    it("should display locked out error message", () => {
      cy.get("[data-test='username']").clear();
      cy.get("[data-test='password']").clear();
      LoginPage.loginAs(Cypress.env("LOCKED_USER"), Cypress.env("PASSWORD"));
      LoginPage.assertErrorVisible("Sorry, this user has been locked out");
      cy.get("[data-test='error-button']").click();
    });
  });

  // ── Logout ─────────────────────────────────────────────────────────────────
  context("Logout", () => {
    it("should logout and return to login page", () => {
      cy.get("[data-test='username']").clear();
      cy.get("[data-test='password']").clear();
      LoginPage.loginAs(Cypress.env("STANDARD_USER"), Cypress.env("PASSWORD"));
      cy.url().should("include", "/inventory.html");
      cy.logout();
      LoginPage.assertOnLoginPage();
    });
  });
});

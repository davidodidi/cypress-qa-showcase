// ─── cypress/e2e/auth/login.cy.js ────────────────────────────────────────────
import LoginPage from "../../support/pages/LoginPage";
import InventoryPage from "../../support/pages/InventoryPage";

// Helper: fill and submit login form WITHOUT visiting the page
const submitLogin = (username, password) => {
  cy.get("[data-test='username']").clear().type(username);
  cy.get("[data-test='password']").clear().type(password, { log: false });
  cy.get("[data-test='login-button']").click();
};

const dismissError = () => {
  cy.get("[data-test='error-button']").click();
};

describe("🔐 Authentication - Login", { testIsolation: false }, () => {

  // Visit ONCE for the entire suite
  before(() => {
    cy.visit("/");
  });

  // ── Valid Login ────────────────────────────────────────────────────────────
  context("Valid Login", () => {
    it("should login successfully with standard_user credentials", () => {
      submitLogin(Cypress.env("STANDARD_USER"), Cypress.env("PASSWORD"));
      cy.url().should("include", "/inventory.html");
      InventoryPage.assertPageTitle("Products");
      InventoryPage.assertProductCount(6);
    });

    it("should redirect to login when accessing inventory without session", () => {
      // Logout using burger menu — no new cy.visit()
      cy.get("#react-burger-menu-btn").click();
      cy.get("#logout_sidebar_link").click();
      cy.url().should("eq", `${Cypress.config("baseUrl")}/`);
      cy.get("[data-test='login-button']").should("be.visible");
    });
  });

  // ── Invalid Login — Data-Driven ────────────────────────────────────────────
  // Already on login page from the logout above
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
        if (username) cy.get("[data-test='username']").type(username);
        if (password) cy.get("[data-test='password']").type(password, { log: false });
        cy.get("[data-test='login-button']").click();
        cy.get("[data-test='error']").should("be.visible").and("contain.text", expectedError);
        dismissError();
      });
    });
  });

  // ── Locked Out User ────────────────────────────────────────────────────────
  context("Locked Out User", () => {
    it("should display locked out error message", () => {
      // Use submitLogin helper — does NOT call cy.visit()
      submitLogin(Cypress.env("LOCKED_USER"), Cypress.env("PASSWORD"));
      cy.get("[data-test='error']").should("be.visible").and("contain.text", "Sorry, this user has been locked out");
      dismissError();
    });
  });

  // ── Logout ─────────────────────────────────────────────────────────────────
  context("Logout", () => {
    it("should logout and return to login page", () => {
      // Login without visiting — already on login page
      submitLogin(Cypress.env("STANDARD_USER"), Cypress.env("PASSWORD"));
      cy.url().should("include", "/inventory.html");
      // Logout via burger menu
      cy.get("#react-burger-menu-btn").click();
      cy.get("#logout_sidebar_link").click();
      cy.url().should("eq", `${Cypress.config("baseUrl")}/`);
      cy.get("[data-test='login-button']").should("be.visible");
    });
  });
});

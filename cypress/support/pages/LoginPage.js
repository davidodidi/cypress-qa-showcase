// ─── cypress/support/pages/LoginPage.js ──────────────────────────────────────
// Page Object Model for the SauceDemo login page.

class LoginPage {
  // ── Selectors ──────────────────────────────────────────────────────────────
  get usernameInput()   { return cy.get("[data-test='username']"); }
  get passwordInput()   { return cy.get("[data-test='password']"); }
  get loginButton()     { return cy.get("[data-test='login-button']"); }
  get errorMessage()    { return cy.get("[data-test='error']"); }
  get errorIcon()       { return cy.get(".error_icon"); }

  // ── Actions ────────────────────────────────────────────────────────────────
  visit() {
    cy.visit("/");
    return this;
  }

  enterUsername(username) {
    this.usernameInput.clear().type(username);
    return this;
  }

  enterPassword(password) {
    this.passwordInput.clear().type(password, { log: false });
    return this;
  }

  clickLogin() {
    this.loginButton.click();
    return this;
  }

  /**
   * Full login flow chained for readability
   */
  loginAs(username, password) {
    return this.visit().enterUsername(username).enterPassword(password).clickLogin();
  }

  // ── Assertions ─────────────────────────────────────────────────────────────
  assertErrorVisible(message) {
    this.errorMessage.should("be.visible").and("contain.text", message);
    return this;
  }

  assertOnLoginPage() {
    cy.url().should("eq", `${Cypress.config("baseUrl")}/`);
    this.loginButton.should("be.visible");
    return this;
  }
}

export default new LoginPage();

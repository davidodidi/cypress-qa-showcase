// ─── cypress/support/commands.js ─────────────────────────────────────────────
// Custom Cypress commands — reusable UI actions used across all spec files.

// ─── Authentication ───────────────────────────────────────────────────────────

/**
 * Login via UI with credentials stored in cypress.env
 * @param {string} userType - 'standard' | 'locked' | 'performance'
 */
Cypress.Commands.add("loginUI", (userType = "standard") => {
  const users = {
    standard:    Cypress.env("STANDARD_USER"),
    locked:      Cypress.env("LOCKED_USER"),
    performance: Cypress.env("PERFORMANCE_USER"),
  };

  const username = users[userType] ?? userType; // allow passing raw username
  const password = Cypress.env("PASSWORD");

  cy.visit("/");
  cy.get("[data-test='username']").type(username);
cy.get("[data-test='password']").type(password, { log: false });
  cy.get("[data-test='login-button']").click();
});

/**
 * Login via session — avoids re-running full login between tests (Cypress 12+)
 */
Cypress.Commands.add("loginSession", (userType = "standard") => {
  cy.session(
    userType,
    () => cy.loginUI(userType),
    {
      validate() {
        cy.getCookie("session-username").should("exist");
      },
    }
  );
  cy.visit("/inventory.html");
});

// ─── Navigation ───────────────────────────────────────────────────────────────

Cypress.Commands.add("openMenu", () => {
  cy.get("#react-burger-menu-btn").click();
  cy.get(".bm-menu-wrap").should("be.visible");
});

Cypress.Commands.add("logout", () => {
  cy.openMenu();
  cy.get("#logout_sidebar_link").click();
  cy.url().should("eq", `${Cypress.config("baseUrl")}/`);
});

// ─── Cart ─────────────────────────────────────────────────────────────────────

/**
 * Add a product to cart by its displayed name
 * @param {string} productName
 */
Cypress.Commands.add("addToCartByName", (productName) => {
  cy.contains(".inventory_item_name", productName)
    .parents(".inventory_item")
    .find("button")
    .click();
});

Cypress.Commands.add("getCartCount", () => {
  return cy.get(".shopping_cart_badge");
});

Cypress.Commands.add("openCart", () => {
  cy.get(".shopping_cart_link").click();
  cy.url().should("include", "/cart.html");
});

// ─── Assertions ───────────────────────────────────────────────────────────────

/**
 * Assert that a toast / error message is visible
 * @param {string} text
 */
Cypress.Commands.add("assertError", (text) => {
  cy.get("[data-test='error']").should("be.visible").and("contain.text", text);
});

/**
 * Sort products and assert order
 * @param {'az'|'za'|'lohi'|'hilo'} option
 */
Cypress.Commands.add("sortProductsBy", (option) => {
  const map = { az: "az", za: "za", lohi: "lohi", hilo: "hilo" };
  cy.get("[data-test='product_sort_container']").select(map[option]);
});

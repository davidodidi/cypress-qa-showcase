// ─── cypress/support/commands.js ─────────────────────────────────────────────
// Custom Cypress commands — reusable UI actions used across all spec files.

// ─── Authentication ───────────────────────────────────────────────────────────

/**
 * Login via UI
 * @param {string} userType - 'standard' | 'locked' | 'performance'
 */
Cypress.Commands.add("loginUI", (userType = "standard") => {
  const users = {
    standard:    Cypress.env("STANDARD_USER"),
    locked:      Cypress.env("LOCKED_USER"),
    performance: Cypress.env("PERFORMANCE_USER"),
  };

  const username = users[userType] ?? userType;
  const password = Cypress.env("PASSWORD");

  cy.visit("/");
  cy.get("[data-test='username']").type(username);
  cy.get("[data-test='password']").type(password, { log: false });
  cy.get("[data-test='login-button']").click();
});

/**
 * Login via full UI login — stable in CI, no session caching needed
 */
Cypress.Commands.add("loginSession", (userType = "standard") => {
  cy.loginUI(userType);
  cy.url().should("include", "/inventory.html");
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

Cypress.Commands.add("assertError", (text) => {
  cy.get("[data-test='error']").should("be.visible").and("contain.text", text);
});

Cypress.Commands.add("sortProductsBy", (option) => {
  const map = { az: "az", za: "za", lohi: "lohi", hilo: "hilo" };
  cy.get("[data-test='product-sort-container']").select(map[option]);
});

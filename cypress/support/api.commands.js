// ─── cypress/support/api.commands.js ─────────────────────────────────────────
// Custom commands wrapping cy.request() for clean, reusable API calls.

const API = () => Cypress.env("API_BASE_URL"); // https://reqres.in/api

// ─── Users ────────────────────────────────────────────────────────────────────

Cypress.Commands.add("apiGetUsers", (page = 1) => {
  return cy.request({
    method: "GET",
    url: `${API()}/users`,
    qs: { page },
  });
});

Cypress.Commands.add("apiGetSingleUser", (id) => {
  return cy.request({
    method: "GET",
    url: `${API()}/users/${id}`,
    failOnStatusCode: false, // allow 404 assertions
  });
});

Cypress.Commands.add("apiCreateUser", (payload) => {
  return cy.request({
    method: "POST",
    url: `${API()}/users`,
    body: payload,
    headers: { "Content-Type": "application/json" },
  });
});

Cypress.Commands.add("apiUpdateUser", (id, payload) => {
  return cy.request({
    method: "PUT",
    url: `${API()}/users/${id}`,
    body: payload,
    headers: { "Content-Type": "application/json" },
  });
});

Cypress.Commands.add("apiDeleteUser", (id) => {
  return cy.request({
    method: "DELETE",
    url: `${API()}/users/${id}`,
  });
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

Cypress.Commands.add("apiRegister", (email, password) => {
  return cy.request({
    method: "POST",
    url: `${API()}/register`,
    body: { email, password },
    failOnStatusCode: false,
  });
});

Cypress.Commands.add("apiLogin", (email, password) => {
  return cy.request({
    method: "POST",
    url: `${API()}/login`,
    body: { email, password },
    failOnStatusCode: false,
  });
});

// ─── Generic helper ───────────────────────────────────────────────────────────

/**
 * Validate standard API response shape
 */
Cypress.Commands.add("validateApiResponse", (response, expectedStatus) => {
  expect(response.status).to.eq(expectedStatus);
  expect(response.headers["content-type"]).to.include("application/json");
  expect(response.duration).to.be.lessThan(3000); // performance gate
});

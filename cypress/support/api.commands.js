// ─── cypress/support/api.commands.js ─────────────────────────────────────────
// Custom commands wrapping cy.request() for clean, reusable API calls.

const API = () => Cypress.env("API_BASE_URL"); // https://reqres.in/api

// ─── Shared headers ───────────────────────────────────────────────────────────
// reqres.in requires an API key for automated/CI requests (free tier)
const apiHeaders = () => ({
  "Content-Type": "application/json",
  "x-api-key": Cypress.env("API_KEY") || "reqres-free-v1",
});

// ─── Users ────────────────────────────────────────────────────────────────────

Cypress.Commands.add("apiGetUsers", (page = 1) => {
  return cy.request({
    method: "GET",
    url: `${API()}/users`,
    qs: { page },
    headers: apiHeaders(),
  });
});

Cypress.Commands.add("apiGetSingleUser", (id) => {
  return cy.request({
    method: "GET",
    url: `${API()}/users/${id}`,
    headers: apiHeaders(),
    failOnStatusCode: false, // allow 404 assertions
  });
});

Cypress.Commands.add("apiCreateUser", (payload) => {
  return cy.request({
    method: "POST",
    url: `${API()}/users`,
    body: payload,
    headers: apiHeaders(),
  });
});

Cypress.Commands.add("apiUpdateUser", (id, payload) => {
  return cy.request({
    method: "PUT",
    url: `${API()}/users/${id}`,
    body: payload,
    headers: apiHeaders(),
  });
});

Cypress.Commands.add("apiDeleteUser", (id) => {
  return cy.request({
    method: "DELETE",
    url: `${API()}/users/${id}`,
    headers: apiHeaders(),
  });
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

Cypress.Commands.add("apiRegister", (email, password) => {
  return cy.request({
    method: "POST",
    url: `${API()}/register`,
    body: { email, password },
    headers: apiHeaders(),
    failOnStatusCode: false,
  });
});

Cypress.Commands.add("apiLogin", (email, password) => {
  return cy.request({
    method: "POST",
    url: `${API()}/login`,
    body: { email, password },
    headers: apiHeaders(),
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

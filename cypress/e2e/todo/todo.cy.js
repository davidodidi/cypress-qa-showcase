// ─── cypress/e2e/todo/todo.cy.js ─────────────────────────────────────────────
// Network intercept tests using cy.intercept() correctly.
// cy.intercept() only captures browser-level (XHR/fetch) traffic.
// We trigger requests via cy.window().fetch() so intercepts fire in CI.

const TODO_API = "https://jsonplaceholder.typicode.com";

describe("✅ Todo App — Network Intercept & Stubbing", () => {

  // Helper: trigger a fetch from inside the browser (not Node/cy.request)
  const browserFetch = (url, options = {}) => {
    return cy.window().then((win) => {
      return win.fetch(url, {
        headers: { "Content-Type": "application/json" },
        ...options,
      });
    });
  };

  beforeEach(() => {
    // Need an active browser page for intercepts to work
    cy.visit("/");
  });

  // ── Spy on Real Requests ──────────────────────────────────────────────────
  context("Intercepting Real API Calls", () => {
    it("should intercept and validate a GET todos request", () => {
      cy.intercept("GET", `${TODO_API}/todos*`).as("getTodos");

      browserFetch(`${TODO_API}/todos?_limit=5`);

      cy.wait("@getTodos").then(({ response }) => {
        expect(response.statusCode).to.eq(200);
        expect(response.body).to.be.an("array");
        expect(response.body.length).to.be.greaterThan(0);
      });
    });

    it("should intercept POST and validate request payload", () => {
      cy.intercept("POST", `${TODO_API}/todos`).as("createTodo");

      browserFetch(`${TODO_API}/todos`, {
        method: "POST",
        body: JSON.stringify({ title: "Write Cypress tests", completed: false, userId: 1 }),
      });

      cy.wait("@createTodo").then(({ response }) => {
        expect(response.statusCode).to.eq(201);
        expect(response.body.id).to.exist;
      });
    });
  });

  // ── Stub Responses ────────────────────────────────────────────────────────
  context("Stubbing API Responses", () => {
    it("should stub a GET todos response with custom data", () => {
      const stubbedTodos = [
        { id: 1, title: "Stubbed Todo 1", completed: false },
        { id: 2, title: "Stubbed Todo 2", completed: true  },
        { id: 3, title: "Stubbed Todo 3", completed: false },
      ];

      cy.intercept("GET", `${TODO_API}/todos*`, {
        statusCode: 200,
        body: stubbedTodos,
        headers: { "content-type": "application/json" },
        delay: 100,
      }).as("stubbedTodos");

      browserFetch(`${TODO_API}/todos`);

      cy.wait("@stubbedTodos").then(({ response }) => {
        expect(response.body).to.have.length(3);
        expect(response.body[0].title).to.eq("Stubbed Todo 1");
        expect(response.body[1].completed).to.be.true;
      });
    });

    it("should stub a 500 server error response", () => {
      cy.intercept("GET", `${TODO_API}/todos/error`, {
        statusCode: 500,
        body: { error: "Internal Server Error" },
      }).as("serverError");

      browserFetch(`${TODO_API}/todos/error`);

      cy.wait("@serverError").then(({ response }) => {
        expect(response.statusCode).to.eq(500);
        expect(response.body.error).to.eq("Internal Server Error");
      });
    });

    it("should stub a slow response with a 1.5s delay", () => {
      cy.intercept("GET", `${TODO_API}/todos/1`, {
        statusCode: 200,
        body: { id: 1, title: "Slow response stub" },
        delay: 1500,
      }).as("slowRequest");

      browserFetch(`${TODO_API}/todos/1`);

      cy.wait("@slowRequest", { timeout: 5000 })
        .its("response.statusCode")
        .should("eq", 200);
    });

    it("should modify an intercepted response body in-flight", () => {
      cy.intercept("GET", `${TODO_API}/todos/2`, (req) => {
        req.continue((res) => {
          res.body = { ...res.body, title: "Title modified by Cypress intercept" };
        });
      }).as("modifiedResponse");

      browserFetch(`${TODO_API}/todos/2`);

      cy.wait("@modifiedResponse")
        .its("response.body.title")
        .should("eq", "Title modified by Cypress intercept");
    });
  });

  // ── Chaining Multiple Intercepts ──────────────────────────────────────────
  context("Chaining Multiple Intercepts", () => {
    it("should capture multiple sequential requests to the same route", () => {
      cy.intercept("GET", `${TODO_API}/todos/*`).as("todoRequest");

      browserFetch(`${TODO_API}/todos/1`);
      cy.wait("@todoRequest");

      browserFetch(`${TODO_API}/todos/2`);
      cy.wait("@todoRequest");

      browserFetch(`${TODO_API}/todos/3`);
      cy.wait("@todoRequest").then(({ response }) => {
        expect(response.statusCode).to.eq(200);
      });
    });
  });
});

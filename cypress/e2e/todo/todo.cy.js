// ─── cypress/e2e/todo/todo.cy.js ─────────────────────────────────────────────
// Todo app tests using cy.intercept() for network stubbing and request spying.
// Demonstrates: intercept, aliasing, stub responses, network wait patterns.

describe("✅ Todo App — Network Intercept & Stubbing", () => {
  // We'll test against a real public todo API (jsonplaceholder)
  const TODO_API = "https://jsonplaceholder.typicode.com";

  // ── Intercept — Spy on Real Requests ─────────────────────────────────────
  context("Intercepting Real API Calls", () => {
    it("should intercept and validate a GET todos request", () => {
      cy.intercept("GET", `${TODO_API}/todos*`).as("getTodos");

      // Trigger the network call
      cy.request(`${TODO_API}/todos?_limit=5`);
      cy.wait("@getTodos").then(({ response }) => {
        expect(response.statusCode).to.eq(200);
        expect(response.body).to.be.an("array");
      });
    });

    it("should intercept POST and validate request payload", () => {
      cy.intercept("POST", `${TODO_API}/todos`).as("createTodo");

      cy.request({
        method: "POST",
        url: `${TODO_API}/todos`,
        body: { title: "Write Cypress tests", completed: false, userId: 1 },
      });

      cy.wait("@createTodo").then(({ request, response }) => {
        // Assert request payload
        expect(request.body.title).to.eq("Write Cypress tests");
        expect(request.body.completed).to.be.false;
        // Assert response
        expect(response.statusCode).to.eq(201);
        expect(response.body.id).to.exist;
      });
    });
  });

  // ── Intercept — Stub Responses ────────────────────────────────────────────
  context("Stubbing API Responses", () => {
    it("should stub a GET todos response with fixture data", () => {
      const stubbedTodos = [
        { id: 1, title: "Stubbed Todo 1", completed: false },
        { id: 2, title: "Stubbed Todo 2", completed: true  },
        { id: 3, title: "Stubbed Todo 3", completed: false },
      ];

      cy.intercept("GET", `${TODO_API}/todos*`, {
        statusCode: 200,
        body: stubbedTodos,
        headers: { "content-type": "application/json" },
        delay: 100, // simulate network latency
      }).as("stubbedTodos");

      cy.request(`${TODO_API}/todos`);
      cy.wait("@stubbedTodos").then(({ response }) => {
        expect(response.body).to.have.length(3);
        expect(response.body[0].title).to.eq("Stubbed Todo 1");
        expect(response.body[1].completed).to.be.true;
      });
    });

    it("should stub a 500 error and handle gracefully", () => {
      cy.intercept("GET", `${TODO_API}/todos/999`, {
        statusCode: 500,
        body: { error: "Internal Server Error" },
      }).as("serverError");

      cy.request({
        url: `${TODO_API}/todos/999`,
        failOnStatusCode: false,
      });

      cy.wait("@serverError").then(({ response }) => {
        expect(response.statusCode).to.eq(500);
        expect(response.body.error).to.eq("Internal Server Error");
      });
    });

    it("should stub a network timeout scenario", () => {
      cy.intercept("GET", `${TODO_API}/todos/slow`, {
        statusCode: 200,
        body: { id: 1, title: "Slow response" },
        delay: 2000, // 2 second simulated delay
      }).as("slowRequest");

      cy.request(`${TODO_API}/todos/slow`);
      cy.wait("@slowRequest", { timeout: 5000 }).its("response.statusCode").should("eq", 200);
    });

    it("should modify an intercepted request before it reaches the server", () => {
      cy.intercept("GET", `${TODO_API}/todos/1`, (req) => {
        // Modify request headers before forwarding
        req.headers["x-custom-header"] = "cypress-test";
        req.continue((res) => {
          // Modify response before it reaches Cypress
          res.body.title = "Title was modified by intercept";
        });
      }).as("modifiedRequest");

      cy.request(`${TODO_API}/todos/1`);
      cy.wait("@modifiedRequest").its("response.body.title").should("eq", "Title was modified by intercept");
    });
  });

  // ── Multiple Intercepts ───────────────────────────────────────────────────
  context("Chaining Multiple Intercepts", () => {
    it("should track call count for repeated requests", () => {
      let callCount = 0;

      cy.intercept("GET", `${TODO_API}/todos*`, (req) => {
        callCount++;
        req.continue();
      }).as("todosCalled");

      // Fire 3 requests
      cy.request(`${TODO_API}/todos?_limit=1`);
      cy.request(`${TODO_API}/todos?_limit=2`);
      cy.request(`${TODO_API}/todos?_limit=3`);

      cy.wait(["@todosCalled", "@todosCalled", "@todosCalled"]).then(() => {
        expect(callCount).to.eq(3);
      });
    });
  });
});

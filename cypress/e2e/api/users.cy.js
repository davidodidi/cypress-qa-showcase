// ─── cypress/e2e/api/users.cy.js ─────────────────────────────────────────────
// API test suite using reqres.in — covers CRUD, auth endpoints, and validations.
// Demonstrates: custom API commands, schema validation, status codes, perf gates.

describe("🔌 API Testing — Users (reqres.in)", () => {
  const API = Cypress.env("API_BASE_URL");

  // ── GET ───────────────────────────────────────────────────────────────────
  context("GET /users", () => {
    it("should return 200 and a list of users on page 1", () => {
      cy.apiGetUsers(1).then((res) => {
        cy.validateApiResponse(res, 200);

        // Schema validation
        expect(res.body).to.have.all.keys("page", "per_page", "total", "total_pages", "data", "support");
        expect(res.body.data).to.be.an("array").and.have.length.greaterThan(0);
        expect(res.body.page).to.eq(1);
      });
    });

    it("should return paginated results on page 2", () => {
      cy.apiGetUsers(2).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.page).to.eq(2);
        expect(res.body.data).to.be.an("array").and.have.length.greaterThan(0);
      });
    });

    it("each user object should have required fields", () => {
      cy.apiGetUsers(1).then((res) => {
        res.body.data.forEach((user) => {
          expect(user).to.have.all.keys("id", "email", "first_name", "last_name", "avatar");
          expect(user.email).to.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/); // email format
          expect(user.avatar).to.include("https://");                 // avatar is URL
        });
      });
    });
  });

  // ── GET Single User ───────────────────────────────────────────────────────
  context("GET /users/:id", () => {
    it("should return 200 for a valid user id", () => {
      cy.apiGetSingleUser(2).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.data.id).to.eq(2);
        expect(res.body.data.email).to.eq("janet.weaver@reqres.in");
      });
    });

    it("should return 404 for a non-existent user", () => {
      cy.apiGetSingleUser(9999).then((res) => {
        expect(res.status).to.eq(404);
        expect(res.body).to.deep.eq({});
      });
    });
  });

  // ── POST ──────────────────────────────────────────────────────────────────
  context("POST /users — Create User", () => {
    it("should create a new user and return 201", () => {
      const payload = { name: "David QA", job: "SDET" };

      cy.apiCreateUser(payload).then((res) => {
        expect(res.status).to.eq(201);
        expect(res.body.name).to.eq(payload.name);
        expect(res.body.job).to.eq(payload.job);
        expect(res.body.id).to.exist.and.to.be.a("string");
        expect(res.body.createdAt).to.exist;

        // Verify the timestamp is recent (within 10s)
        const created = new Date(res.body.createdAt).getTime();
        const now     = Date.now();
        expect(now - created).to.be.lessThan(10_000);
      });
    });

    it("should handle missing fields gracefully", () => {
      cy.apiCreateUser({}).then((res) => {
        // reqres.in always returns 201 — asserting the contract
        expect(res.status).to.eq(201);
        expect(res.body.id).to.exist;
      });
    });
  });

  // ── PUT ───────────────────────────────────────────────────────────────────
  context("PUT /users/:id — Update User", () => {
    it("should update a user and return 200 with updated fields", () => {
      const updates = { name: "David Updated", job: "Senior SDET" };

      cy.apiUpdateUser(2, updates).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.name).to.eq(updates.name);
        expect(res.body.job).to.eq(updates.job);
        expect(res.body.updatedAt).to.exist;
      });
    });
  });

  // ── DELETE ────────────────────────────────────────────────────────────────
  context("DELETE /users/:id", () => {
    it("should delete a user and return 204 with no body", () => {
      cy.apiDeleteUser(2).then((res) => {
        expect(res.status).to.eq(204);
        expect(res.body).to.be.empty;
      });
    });
  });

  // ── Auth Endpoints ────────────────────────────────────────────────────────
  context("POST /register", () => {
    it("should register successfully with valid credentials", () => {
      cy.apiRegister("eve.holt@reqres.in", "pistol").then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.token).to.exist.and.to.be.a("string");
        expect(res.body.id).to.exist;
      });
    });

    it("should return 400 when password is missing", () => {
      cy.apiRegister("peter@klaven.com", undefined).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.error).to.eq("Missing password");
      });
    });
  });

  context("POST /login", () => {
    it("should login and return a token", () => {
      cy.apiLogin("eve.holt@reqres.in", "cityslicka").then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.token).to.exist.and.to.be.a("string");

        // Store token for potential downstream use
        Cypress.env("AUTH_TOKEN", res.body.token);
      });
    });

    it("should return 400 for unregistered user", () => {
      cy.apiLogin("nobody@nowhere.com", "badpass").then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.error).to.eq("user not found");
      });
    });
  });

  // ── Performance Gate ──────────────────────────────────────────────────────
  context("API Response Time", () => {
    const performanceCases = [
      { name: "GET /users",       fn: () => cy.apiGetUsers(1)       },
      { name: "GET /users/2",     fn: () => cy.apiGetSingleUser(2)  },
      { name: "POST /users",      fn: () => cy.apiCreateUser({ name: "Perf Test", job: "QA" }) },
    ];

    performanceCases.forEach(({ name, fn }) => {
      it(`${name} should respond in under 3 seconds`, () => {
        fn().then((res) => {
          expect(res.duration).to.be.lessThan(3000);
        });
      });
    });
  });
});

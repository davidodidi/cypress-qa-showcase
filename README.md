# 🧪 Cypress QA Automation Showcase

> A production-grade test automation framework built with **Cypress 13 + JavaScript**, demonstrating real-world SDET skills across UI testing, API testing, network interception, Page Object Model, and CI/CD with GitHub Actions.

![CI](https://github.com/davidodidi/cypress-qa-showcase/actions/workflows/cypress.yml/badge.svg)
![Cypress](https://img.shields.io/badge/Cypress-13.x-04C38E?logo=cypress)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2021-F7DF1E?logo=javascript)
![Node](https://img.shields.io/badge/Node-20.x-339933?logo=node.js)

---

## 📁 Project Structure

```
cypress-qa-showcase/
├── cypress/
│   ├── e2e/
│   │   ├── auth/            # Login, logout, session tests
│   │   ├── ecommerce/       # Product browsing, cart, checkout
│   │   ├── api/             # Full CRUD + auth API tests
│   │   └── todo/            # cy.intercept() & network stubbing
│   ├── support/
│   │   ├── pages/           # Page Object Model classes
│   │   │   ├── LoginPage.js
│   │   │   ├── InventoryPage.js
│   │   │   └── CheckoutPage.js
│   │   ├── commands.js      # Custom UI commands
│   │   ├── api.commands.js  # Custom API commands
│   │   └── e2e.js           # Global hooks & exception handling
│   └── fixtures/
│       └── testData.json    # Centralized test data
├── .github/
│   └── workflows/
│       └── cypress.yml      # Parallel CI/CD pipeline
├── cypress.config.js        # Global config, env vars, retry strategy
├── .eslintrc.js             # ESLint + Cypress plugin
└── package.json
```

---

## ✅ Test Coverage

### 🔐 Authentication (`/auth`)
- Valid login with session assertion
- Data-driven invalid login (3 negative scenarios)
- Locked user error handling
- Logout + session clearance
- Redirect guard (unauthenticated access)

### 🛒 E-Commerce (`/ecommerce`)
- Product catalog display & count
- Sort by A→Z, Z→A, Price Low→High (with value assertions)
- Product detail page navigation
- Cart add / remove / badge counter
- Full end-to-end checkout (happy path)
- Computed total = subtotal + tax assertion
- Checkout form validation (3 negative scenarios)

### 🔌 API Testing (`/api`)
- `GET /users` - pagination, schema validation, field format
- `GET /users/:id` - 200 and 404 handling
- `POST /users` - 201, payload, timestamp freshness
- `PUT /users/:id` - update and response contract
- `DELETE /users/:id` - 204 and empty body
- `POST /register` + `POST /login` - success and error flows
- Response time performance gates (< 3s)

### ✅ Network Intercept (`/todo`)
- Spy on real GET/POST requests and validate payload
- Stub 200 responses with custom fixture data
- Simulate 500 server errors
- Simulate slow responses (2s delay)
- Modify request/response in-flight with `req.continue()`
- Track call count across multiple requests

---

## 🏗️ Key Design Patterns

| Pattern | Where Used |
|---|---|
| **Page Object Model** | All UI specs - `LoginPage`, `InventoryPage`, `CheckoutPage` |
| **Custom Commands** | `commands.js` (UI), `api.commands.js` (REST) |
| **testIsolation: false** | Ecommerce suite - single login shared across all tests to avoid SauceDemo CI rate limiting |
| **Data-Driven Testing** | Auth invalid cases, checkout validation - `forEach` loops |
| **Network Intercept** | Todo suite - spy, stub, modify in-flight requests |
| **cy.task()** | Terminal logging for test start/failure |
| **Retry Strategy** | `runMode: 2` in config - resilient CI execution |
| **Performance Gates** | API suite asserts `res.duration < 3000` |
| **Schema Validation** | API responses validated with `.to.include.all.keys()` |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Install
```bash
git clone https://github.com/davidodidi/cypress-qa-showcase.git
cd cypress-qa-showcase
npm install
cp cypress.env.example.json cypress.env.json
```

### Run
```bash
# Open Cypress Test Runner (interactive)
npm run cy:open

# Run all tests headless
npm run cy:run

# Run individual suites
npm run cy:run:auth
npm run cy:run:ecommerce
npm run cy:run:api

# Generate Mochawesome HTML report
npm run cy:report
```

---

## 🔄 CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/cypress.yml`) provides:

- ✅ **Linting** on every push (ESLint + Cypress plugin)
- ✅ **Parallel matrix execution** - 4 suites run simultaneously
- ✅ **`fail-fast: false`** - all suites complete even if one fails
- ✅ **Screenshot upload** on failure
- ✅ **Video upload** always (14-day retention)
- ✅ **Nightly scheduled run** at 2:00 AM UTC
- ✅ **Manual trigger** with suite selector via `workflow_dispatch`
- ✅ **GitHub Actions Step Summary** with test result table

---

## ⚠️ Known Limitations

### SauceDemo (UI / E-Commerce / Auth)
SauceDemo rate-limits repeated page loads from CI runner IP addresses. To work around this:
- The ecommerce suite uses `testIsolation: false` so the browser session persists across all 14 tests
- Login happens once in a `before()` hook - not before every test
- Navigation between tests uses the burger menu (☰ → All Items) rather than `cy.visit()`, which avoids triggering a new page load request
- `cy.visit()` is only called once per suite run

### ReqRes.in (API Suite)
ReqRes.in enforces a **250 requests/day** limit on the free tier. If the CI pipeline has been triggered many times in a single day, the API suite may return `429 Too Many Requests` for some tests. The rate limit resets daily at **midnight UTC**. This is an external service constraint, not a framework issue.

### ESLint - `no-unnecessary-waiting`
The `cypress/no-unnecessary-waiting` ESLint rule is disabled in `.eslintrc.js`. The burger menu on SauceDemo uses CSS animations with no reliable completion signal, so intentional `cy.wait()` calls are necessary for stable headless execution.

---

## 🛠️ Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| Cypress | 13.x | Test framework |
| JavaScript | ES2021 | Language |
| Node.js | 20.x | Runtime |
| Mochawesome | 7.x | HTML reporting |
| ESLint | 8.x | Code quality |
| GitHub Actions | - | CI/CD |

**Test Apps Used:**
- [SauceDemo](https://www.saucedemo.com) - UI / Auth / E-Commerce
- [ReqRes.in](https://reqres.in) - REST API testing
- [JSONPlaceholder](https://jsonplaceholder.typicode.com) - Network intercept

---

## 👤 Author

**David Odidi** - QA Automation Engineer  
Java • Selenium • Playwright • Cypress • RestAssured • Python • CI/CD (Github Actions and Jenkins)  
[github.com/davidodidi](https://github.com/davidodidi)

---

*This project is part of a QA Automation Portfolio - built to demonstrate production-level testing skills across multiple disciplines.*

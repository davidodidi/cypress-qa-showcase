// ─── cypress/e2e/ecommerce/checkout.cy.js ────────────────────────────────────
import InventoryPage from "../../support/pages/InventoryPage";
import CheckoutPage from "../../support/pages/CheckoutPage";

describe("🛒 E-Commerce — Product Browsing & Checkout", { testIsolation: false }, () => {

  before(() => {
    cy.loginUI("standard");
    cy.url().should("include", "/inventory.html");
    cy.get(".inventory_list", { timeout: 30000 }).should("be.visible");
  });

  // Navigate to inventory using window.location — avoids SauceDemo rate limiting
  // cy.visit() triggers rate limiting; window.location navigates within existing session
  const goToInventory = () => {
    cy.url().then((url) => {
      if (url.includes("checkout-complete")) {
        cy.get("[data-test='back-to-products']").click();
      } else if (!url.includes("/inventory.html")) {
        cy.window().then((win) => {
          win.location.href = "https://www.saucedemo.com/inventory.html";
        });
      }
    });
    cy.get(".inventory_list", { timeout: 15000 }).should("be.visible");
    cy.get("[data-test='product_sort_container']", { timeout: 15000 }).should("be.visible");
  };

  // Clear all items from cart if any exist
  const clearCart = () => {
    cy.get("body").then(($body) => {
      if ($body.find(".shopping_cart_badge").length) {
        cy.get(".shopping_cart_link").click();
        cy.get(".cart_item button").each(($btn) => {
          cy.wrap($btn).click();
        });
        cy.window().then((win) => {
          win.location.href = "https://www.saucedemo.com/inventory.html";
        });
        cy.get(".inventory_list").should("be.visible");
      }
    });
  };

  // ── Product Catalog ────────────────────────────────────────────────────────
  context("Product Catalog", () => {

    beforeEach(() => {
      goToInventory();
    });

    it("should display 6 products on inventory page", () => {
      InventoryPage.assertProductCount(6);
    });

    it("should sort products A → Z correctly", () => {
      InventoryPage.sortBy("az");
      InventoryPage.assertSortedAlphaAsc();
    });

    it("should sort products Z → A correctly", () => {
      InventoryPage.sortBy("za");
      InventoryPage.productNames.then(($names) => {
        const names = [...$names].map((el) => el.innerText);
        expect(names).to.deep.equal([...names].sort().reverse());
      });
    });

    it("should sort products by price low → high", () => {
      InventoryPage.sortBy("lohi");
      InventoryPage.assertSortedPriceLowHigh();
    });

    it("should navigate to product detail page", () => {
      InventoryPage.sortBy("az");
      InventoryPage.openProductByName("Sauce Labs Backpack");
      cy.url().should("include", "/inventory-item.html");
      cy.get(".inventory_details_name").should("contain.text", "Sauce Labs Backpack");
      cy.go("back");
      cy.get(".inventory_list").should("be.visible");
    });
  });

  // ── Cart Management ────────────────────────────────────────────────────────
  context("Cart Management", () => {
    beforeEach(() => {
      goToInventory();
      clearCart();
    });

    it("should add a single product and update cart badge", () => {
      InventoryPage.addProductToCartByName("Sauce Labs Backpack");
      InventoryPage.assertCartBadge(1);
    });

    it("should add multiple products and update cart badge", () => {
      InventoryPage.addProductToCartByName("Sauce Labs Backpack");
      InventoryPage.addProductToCartByName("Sauce Labs Bike Light");
      InventoryPage.addProductToCartByName("Sauce Labs Bolt T-Shirt");
      InventoryPage.assertCartBadge(3);
    });

    it("should remove product from cart and update badge", () => {
      InventoryPage.addProductToCartByName("Sauce Labs Backpack");
      InventoryPage.assertCartBadge(1);
      InventoryPage.removeFromCartByName("Sauce Labs Backpack");
      InventoryPage.assertCartBadgeNotVisible();
    });

    it("should show correct products in cart", () => {
      const product = "Sauce Labs Fleece Jacket";
      InventoryPage.addProductToCartByName(product);
      InventoryPage.goToCart();
      cy.get(".cart_item").should("have.length", 1);
      cy.get(".inventory_item_name").should("contain.text", product);
    });
  });

  // ── Checkout Happy Path ────────────────────────────────────────────────────
  context("Checkout — Happy Path", () => {
    beforeEach(() => {
      goToInventory();
      clearCart();
      InventoryPage.addProductToCartByName("Sauce Labs Backpack");
      InventoryPage.goToCart();
      cy.get("[data-test='checkout']").click();
    });

    it("should complete checkout with valid shipping info", () => {
      CheckoutPage.completeShippingInfo({ firstName: "David", lastName: "QA", postalCode: "M5V 3L9" });
      CheckoutPage.assertSummaryVisible();
      CheckoutPage.clickFinish();
      CheckoutPage.assertOrderComplete();
    });

    it("should display correct order summary on step 2", () => {
      CheckoutPage.completeShippingInfo({ firstName: "David", lastName: "QA", postalCode: "M5V 3L9" });
      CheckoutPage.cartItems.should("have.length", 1);
      CheckoutPage.assertSummaryVisible();
      CheckoutPage.summarySubtotal.invoke("text").then((subtotalText) => {
        CheckoutPage.summaryTax.invoke("text").then((taxText) => {
          const subtotal = parseFloat(subtotalText.replace("Item total: $", ""));
          const tax      = parseFloat(taxText.replace("Tax: $", ""));
          const expected = parseFloat((subtotal + tax).toFixed(2));
          CheckoutPage.getTotalAmount().should("eq", expected);
        });
      });
    });
  });

  // ── Checkout Validation ────────────────────────────────────────────────────
  context("Checkout — Form Validation", () => {
    const validationCases = [
      { scenario: "missing first name", firstName: "",      lastName: "QA", postalCode: "12345", error: "First Name is required" },
      { scenario: "missing last name",  firstName: "David", lastName: "",   postalCode: "12345", error: "Last Name is required" },
      { scenario: "missing postal",     firstName: "David", lastName: "QA", postalCode: "",      error: "Postal Code is required" },
    ];

    beforeEach(() => {
      goToInventory();
      clearCart();
      InventoryPage.addProductToCartByName("Sauce Labs Onesie");
      InventoryPage.goToCart();
      cy.get("[data-test='checkout']").click();
    });

    validationCases.forEach(({ scenario, firstName, lastName, postalCode, error }) => {
      it(`should show error for: ${scenario}`, () => {
        if (firstName)  cy.get("[data-test='firstName']").clear().type(firstName);
        if (lastName)   cy.get("[data-test='lastName']").clear().type(lastName);
        if (postalCode) cy.get("[data-test='postalCode']").clear().type(postalCode);
        CheckoutPage.clickContinue();
        CheckoutPage.assertShippingError(error);
      });
    });
  });
});

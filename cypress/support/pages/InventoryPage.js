// ─── cypress/support/pages/InventoryPage.js ──────────────────────────────────
// Page Object Model for the SauceDemo product inventory page.

class InventoryPage {
  // ── Selectors ──────────────────────────────────────────────────────────────
  get productList()      { return cy.get(".inventory_list"); }
  get productItems()     { return cy.get(".inventory_item"); }
  get productNames()     { return cy.get(".inventory_item_name"); }
  get productPrices()    { return cy.get(".inventory_item_price"); }
  get sortDropdown()     { return cy.get("[data-test='product-sort-container']"); }
  get cartBadge()        { return cy.get(".shopping_cart_badge"); }
  get cartIcon()         { return cy.get(".shopping_cart_link"); }
  get pageTitle()        { return cy.get(".title"); }
  get burgerMenu()       { return cy.get("#react-burger-menu-btn"); }

  // ── Actions ────────────────────────────────────────────────────────────────
  visit() {
    cy.visit("/inventory.html");
    return this;
  }

  sortBy(value) {
    // value: 'az' | 'za' | 'lohi' | 'hilo'
    this.sortDropdown.select(value);
    return this;
  }

  addProductToCartByIndex(index = 0) {
    this.productItems.eq(index).find("button").click();
    return this;
  }

  addProductToCartByName(name) {
    cy.contains(".inventory_item_name", name)
      .parents(".inventory_item")
      .find("button")
      .should("contain.text", "Add to cart")
      .click();
    return this;
  }

  removeFromCartByName(name) {
    cy.contains(".inventory_item_name", name)
      .parents(".inventory_item")
      .find("button")
      .should("contain.text", "Remove")
      .click();
    return this;
  }

  openProductByName(name) {
    cy.contains(".inventory_item_name", name).click();
    return this;
  }

  goToCart() {
    this.cartIcon.click();
    return this;
  }

  // ── Assertions ─────────────────────────────────────────────────────────────
  assertProductCount(count) {
    this.productItems.should("have.length", count);
    return this;
  }

  assertCartBadge(count) {
    this.cartBadge.should("have.text", String(count));
    return this;
  }

  assertCartBadgeNotVisible() {
    this.cartBadge.should("not.exist");
    return this;
  }

  assertPageTitle(title = "Products") {
    this.pageTitle.should("have.text", title);
    return this;
  }

  /**
   * Assert products are sorted A→Z by name
   */
  assertSortedAlphaAsc() {
    this.productNames.then(($names) => {
      const names = [...$names].map((el) => el.innerText);
      expect(names).to.deep.equal([...names].sort());
    });
    return this;
  }

  /**
   * Assert products are sorted by price low→high
   */
  assertSortedPriceLowHigh() {
    this.productPrices.then(($prices) => {
      const prices = [...$prices].map((el) => parseFloat(el.innerText.replace("$", "")));
      expect(prices).to.deep.equal([...prices].sort((a, b) => a - b));
    });
    return this;
  }
}

export default new InventoryPage();

// ─── cypress/support/pages/CheckoutPage.js ───────────────────────────────────
// Page Object for the SauceDemo checkout flow (Step 1, Step 2, Complete).

class CheckoutPage {
  // ── Step 1 Selectors ───────────────────────────────────────────────────────
  get firstNameInput()   { return cy.get("[data-test='firstName']"); }
  get lastNameInput()    { return cy.get("[data-test='lastName']"); }
  get postalCodeInput()  { return cy.get("[data-test='postalCode']"); }
  get continueButton()   { return cy.get("[data-test='continue']"); }
  get cancelButton()     { return cy.get("[data-test='cancel']"); }
  get errorMessage()     { return cy.get("[data-test='error']"); }

  // ── Step 2 Selectors ───────────────────────────────────────────────────────
  get cartItems()        { return cy.get(".cart_item"); }
  get summarySubtotal()  { return cy.get(".summary_subtotal_label"); }
  get summaryTax()       { return cy.get(".summary_tax_label"); }
  get summaryTotal()     { return cy.get(".summary_total_label"); }
  get finishButton()     { return cy.get("[data-test='finish']"); }

  // ── Complete Selectors ─────────────────────────────────────────────────────
  get confirmationHeader() { return cy.get(".complete-header"); }
  get confirmationText()   { return cy.get(".complete-text"); }
  get backHomeButton()     { return cy.get("[data-test='back-to-products']"); }

  // ── Actions ────────────────────────────────────────────────────────────────
  visitStep1() {
    cy.visit("/checkout-step-one.html");
    return this;
  }

  fillShippingInfo({ firstName, lastName, postalCode }) {
    this.firstNameInput.clear().type(firstName);
    this.lastNameInput.clear().type(lastName);
    this.postalCodeInput.clear().type(postalCode);
    return this;
  }

  clickContinue() {
    this.continueButton.click();
    return this;
  }

  clickFinish() {
    this.finishButton.click();
    return this;
  }

  clickCancel() {
    this.cancelButton.click();
    return this;
  }

  /**
   * Full Step 1 → Step 2 flow
   */
  completeShippingInfo(info) {
    return this.fillShippingInfo(info).clickContinue();
  }

  // ── Assertions ─────────────────────────────────────────────────────────────
  assertShippingError(message) {
    this.errorMessage.should("be.visible").and("contain.text", message);
    return this;
  }

  assertOrderComplete() {
    cy.url().should("include", "/checkout-complete.html");
    this.confirmationHeader.should("contain.text", "Thank you for your order");
    return this;
  }

  assertSummaryVisible() {
    this.summarySubtotal.should("be.visible");
    this.summaryTax.should("be.visible");
    this.summaryTotal.should("be.visible");
    return this;
  }

  /**
   * Parse and return the total as a float for arithmetic assertions
   */
  getTotalAmount() {
    return this.summaryTotal.invoke("text").then((text) => {
      return parseFloat(text.replace("Total: $", ""));
    });
  }
}

export default new CheckoutPage();

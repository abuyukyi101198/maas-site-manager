describe("index", () => {
  it("displays a correct page title", () => {
    cy.visit("/");
    cy.title().should("match", /MAAS Site Manager/);
  });
});

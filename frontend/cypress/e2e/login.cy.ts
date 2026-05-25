describe("Login Workflow", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  it("should login successfully", () => {
    cy.intercept("POST", "/api/auth/login").as("login");

    cy.visit("/login");

    cy.contains(/email/i).parent().find('input').should('be.visible').type("yoga@studio.com");
    cy.contains(/password/i).parent().find('input').should('be.visible').type("test!1234");
    
    cy.get('button').filter(':contains("Login"), :contains("Connexion")').click().then(() => {
        cy.log("Bouton cliqué");
    });

    cy.wait("@login", { timeout: 10000 }).then((interception) => {
        cy.log("Requête interceptée :", interception);
    });
});
});
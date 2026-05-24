describe("Login Workflow", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  it("should login successfully", () => {
    cy.intercept("POST", "/api/auth/login").as("login");

    cy.visit("/login");

    // Debug 1 : Vérifier qu'on est bien sur la page et que les champs sont remplis
    cy.contains(/email/i).parent().find('input').should('be.visible').type("yoga@studio.com");
    cy.contains(/password/i).parent().find('input').should('be.visible').type("test!1234");
    
    // Debug 2 : On s'assure de cliquer sur le bon bouton et on ajoute un log
    cy.get('button').filter(':contains("Login"), :contains("Connexion")').click().then(() => {
        cy.log("Bouton cliqué");
    });

    // Debug 3 : Au lieu de cy.wait('@login') tout de suite, vérifions si quelque chose se passe
    // On attend 2 secondes pour voir si la requête finit par apparaître
    cy.wait("@login", { timeout: 10000 }).then((interception) => {
        cy.log("Requête interceptée :", interception);
    });
});
});
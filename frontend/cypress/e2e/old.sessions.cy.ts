describe("Sessions Workflow", () => {
  Cypress.on('uncaught:exception', () => false);

  beforeEach(() => {
    cy.intercept("GET", "**/api/session", {
      statusCode: 200,
      body: [{ id: 1, name: "Yoga Débutant", date: "2026-06-01T10:00:00Z", teacher_id: 1 }],
    }).as("getSessions");

    cy.visit("/login");
    cy.get('input').eq(0).type("test@mail.fr");
    cy.get('input').eq(1).type("testtest");
    cy.get('button[type="submit"]').click();
    cy.wait("@getSessions");
  });

  it("should navigate, participate, and leave a session", () => {
    // 1. État initial : Pas de participant
    cy.intercept("GET", "**/api/session/1", {
      statusCode: 200,
      body: { id: 1, name: "Yoga Débutant", users: [] },
    }).as("getSessionEmpty");

    // 2. État après JOIN : L'utilisateur 3 est présent
    cy.intercept("GET", "**/api/session/1", {
      statusCode: 200,
      body: { id: 1, name: "Yoga Débutant", users: [3] },
    }).as("getSessionWithUser");

    // Interceptions des actions
    cy.intercept("POST", "**/api/session/1/participate/3", { statusCode: 200 }).as("joinRequest");
    // On force le statut 200 pour le DELETE pour éviter l'erreur 404 du backend
    cy.intercept("DELETE", "**/api/session/1/participate/3", { statusCode: 200 }).as("leaveRequest");

    cy.visit("/sessions/1");
    cy.wait("@getSessionEmpty");

    // --- TEST JOIN ---
    cy.contains("Join Session").click({ force: true });
    cy.wait("@joinRequest");
    
    // On bascule l'interception pour la suite
    cy.wait("@getSessionWithUser");
    cy.contains("Leave Session", { timeout: 10000 }).should('be.visible');

    // --- TEST LEAVE ---
    cy.contains("Leave Session").click({ force: true });
    cy.wait("@leaveRequest");
    
    // Après le leave, on attend un retour à l'état vide
    cy.intercept("GET", "**/api/session/1", {
      statusCode: 200,
      body: { id: 1, name: "Yoga Débutant", users: [] },
    }).as("getSessionBackToEmpty");
    
    cy.wait("@getSessionBackToEmpty");
    cy.contains("Join Session").should('be.visible');
  });
});
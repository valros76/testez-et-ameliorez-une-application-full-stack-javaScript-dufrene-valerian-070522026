describe("Sessions Workflow - Scénarios Utilisateur vs Admin", () => {
  Cypress.on('uncaught:exception', () => false);

  const mockSessionData = {
    id: 1,
    name: "Yoga Débutant",
    date: "2026-06-01T10:00:00Z",
    teacher_id: 1,
    description: "Cours"
  };

  describe("As a Standard User", () => {
    beforeEach(() => {
      cy.intercept("POST", "**/api/auth/login", {
        statusCode: 200,
        body: { token: "fake-jwt", id: 3, username: "test@mail.fr", firstName: "John", lastName: "Doe", admin: false }
      }).as("loginUser");

      cy.intercept("GET", "**/api/session", {
        statusCode: 200,
        body: [{ ...mockSessionData, users: [] }],
      }).as("getSessions");

      cy.visit("/login");
      cy.get('input').eq(0).type("user@mail.fr");
      cy.get('input').eq(1).type("testtest");
      cy.get('button[type="submit"]').click();
      cy.wait("@loginUser");
      cy.wait("@getSessions");
    });

    it("should navigate, participate, and leave a session", () => {
      cy.intercept("GET", "**/api/session/1", {
        statusCode: 200,
        body: { ...mockSessionData, users: [] },
      }).as("getSession");

      cy.intercept("POST", "**/api/session/1/participate/3", { statusCode: 200 }).as("joinRequest");
      cy.intercept("DELETE", "**/api/session/1/participate/3", { statusCode: 200 }).as("leaveRequest");

      cy.visit("/sessions/1");
      cy.wait("@getSession");

      cy.intercept("GET", "**/api/session/1", {
        statusCode: 200,
        body: { ...mockSessionData, users: [3] },
      }).as("getSessionWithUser");

      cy.contains("Join Session").click({ force: true });
      cy.wait("@joinRequest");
      cy.wait("@getSessionWithUser");

      cy.contains("Leave Session", { timeout: 10000 }).should('be.visible');

      cy.intercept("GET", "**/api/session/1", {
        statusCode: 200,
        body: { ...mockSessionData, users: [] },
      }).as("getSessionEmpty");

      cy.contains("Leave Session").click({ force: true });
      cy.wait("@leaveRequest");
      cy.wait("@getSessionEmpty");

      cy.contains("Join Session", { timeout: 10000 }).should('be.visible');
    });
  });

  describe("As an Admin User", () => {
    beforeEach(() => {
      cy.intercept("POST", "**/api/auth/login", {
        statusCode: 200,
        body: { token: "fake-jwt", id: 1, username: "admin@mail.fr", firstName: "Admin", lastName: "User", admin: true }
      }).as("loginAdmin");

      cy.intercept("GET", "**/api/session", {
        statusCode: 200,
        body: [{ ...mockSessionData, users: [3] }],
      }).as("getSessionsAdmin");

      cy.visit("/login");
      cy.get('input').eq(0).type("admin@mail.fr");
      cy.get('input').eq(1).type("testtest");
      cy.get('button[type="submit"]').click();
      cy.wait("@loginAdmin");
      cy.wait("@getSessionsAdmin");
    });

    it("should display administrative elements and delete button on details", () => {
      cy.contains("a", /Create Session/i).should("be.visible"); 

      cy.intercept("GET", "**/api/session/1", {
        statusCode: 200,
        body: { ...mockSessionData, users: [3] },
      }).as("getSessionDetailAdmin");

      cy.intercept("DELETE", "**/api/session/1", { statusCode: 200 }).as("deleteSessionRequest");

      cy.visit("/sessions/1");
      cy.wait("@getSessionDetailAdmin");

      cy.contains("button", /Edit/i).should("be.visible");
      cy.contains("button", /Delete/i).should("be.visible");
      
      cy.contains("button", /Join Session/i).should("not.exist");
      cy.contains("button", /Leave Session/i).should("not.exist");

      cy.contains("button", /Delete/i).click();
      cy.wait("@deleteSessionRequest");
      cy.url().should("include", "/sessions");
    });
  });
});
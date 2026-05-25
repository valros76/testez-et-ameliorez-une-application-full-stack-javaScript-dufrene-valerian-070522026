describe("User Full Lifecycle (Register -> Login -> Profile -> Delete)", () => {
  Cypress.on('uncaught:exception', () => false);

  it("should complete the entire user lifecycle successfully", () => {
    cy.intercept("POST", "**/api/auth/register", {
      statusCode: 200,
    }).as("registerRequest");

    cy.intercept("POST", "**/api/auth/login", {
      statusCode: 200,
      body: {
        token: "fake-jwt-token",
        id: 5,
        username: "lucas@studio.com",
        firstName: "Lucas",
        lastName: "Martin",
        admin: false
      }
    }).as("loginRequest");

    cy.intercept("GET", "**/api/session", {
      statusCode: 200,
      body: [],
    }).as("getSessions");

    cy.intercept("GET", "**/api/user/5", {
      statusCode: 200,
      body: {
        id: 5,
        firstName: "Lucas",
        lastName: "Martin",
        email: "lucas@studio.com",
        admin: false,
        createdAt: "2026-05-25T20:00:00Z"
      },
    }).as("getUserProfile");

    cy.intercept("DELETE", "**/api/user/5", {
      statusCode: 200,
    }).as("deleteAccountRequest");


    cy.visit("/register");
    cy.get('input[name="firstName"]').type("Lucas");
    cy.get('input[name="lastName"]').type("Martin");
    cy.get('input[name="email"]').type("lucas@studio.com");
    cy.get('input[name="password"]').type("password123");
    cy.get('button[type="submit"]').click();
    cy.wait("@registerRequest");

    cy.visit("/login");
    cy.get('input').eq(0).type("lucas@studio.com");
    cy.get('input').eq(1).type("password123");
    cy.get('button[type="submit"]').click();
    cy.wait("@loginRequest");
    cy.wait("@getSessions");

    cy.visit("/profile");
    cy.wait("@getUserProfile");

    cy.contains("Lucas").should("be.visible");
    cy.contains("Martin").should("be.visible");
    cy.contains("lucas@studio.com").should("be.visible");

    cy.on("window:confirm", () => true);
    cy.contains("Delete Account").click();
    cy.wait("@deleteAccountRequest");

    cy.url().should("include", "/login");
  });
});
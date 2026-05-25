describe("Register Workflow", () => {
  beforeEach(() => {
    cy.visit("/register");
  });

  it("should register successfully and redirect to /login", () => {
    cy.intercept("POST", "**/api/auth/register", {
      statusCode: 200,
      body: { message: "User registered successfully" },
    }).as("registerRequest");

    cy.get('input').eq(0).type("John");
    cy.get('input').eq(1).type("Doe");
    cy.get('input').eq(2).type("john.doe@test.com");
    cy.get('input').eq(3).type("password123");

    cy.get('form').submit().then(() => {
      cy.log("Formulaire soumis");
    });

    cy.wait("@registerRequest", { timeout: 10000 });
    cy.url().should("include", "/login");
  });

  it("should show error if registration fails", () => {
    cy.intercept("POST", "**/api/auth/register", {
      statusCode: 400,
      body: { message: "Email already exists" },
    }).as("registerFail");

    cy.get('input').eq(2).type("existing@test.com");

    cy.get('form').submit();

    cy.wait("@registerFail", { timeout: 10000 });
    
    cy.contains(/already exists/i).should("be.visible");
  });
});
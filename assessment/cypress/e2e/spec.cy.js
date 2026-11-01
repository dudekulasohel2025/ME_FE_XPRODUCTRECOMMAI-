describe("Product Recommendation AI Application", () => {
  beforeEach(() => {
    // Navigate to the app before each test
    cy.visit("https://me-fe-xproductrecommai-ashy.vercel.app");
  });

  it("should navigate to the Past Conversations page on button click", () => {
    cy.get('a[href="/history"]').click();
    cy.url().should("include", "/history");
  });

  it("should display the Product Recommendation AI header with correct title", () => {
    cy.get("header").within(() => {
      cy.contains("h1", "Product Recommendation AI").should("be.visible");
    });
  });

  it("should allow user to type a message in the input field", () => {
    const userMessage = "Hello";
    cy.get('input[placeholder="Please tell me about your query!"]')
      .type(userMessage)
      .should("have.value", userMessage);
  });

  it("Should have an input field to ask queries and return a response", () => {
    cy.get("input[placeholder='Please tell me about your query!']")
      .should("exist")
      .type("Jeans");
    cy.get("button[type='submit']").click();
    cy.contains("Product Recommendation AI").should("exist");
    cy.contains("Please select your budget (500 - 1000, 1000 - 1500, 1500 - 2000)").should("exist");
  });

  it("Should show a default message if the question is not present in the static JSON data", () => {
    cy.get("input[placeholder='Please tell me about your query!']").type(
      "What is the capital of Mars?"
    );
    cy.get("button[type='submit']").click();
    cy.contains("Sorry, I did not understand your query!").should("exist");
  });

  it("Should show valid message if the question is present in the static JSON data", () => {
    cy.get("input[placeholder='Please tell me about your query!']").type(
      "Jeans"
    );
    cy.get("button[type='submit']").click();
    cy.contains(
        "Please select your budget (500 - 1000, 1000 - 1500, 1500 - 2000)"
      )
      .should("exist"); // Default message
  });

  it("Should have a Past Conversations page which lists all the previous messages", () => {
    cy.get("a[href='/history']").click({ multiple: true });
    cy.url().should("include", "/history");
    cy.contains("Previous Suggestions").should("exist");
  });

  it("Past Conversations should be persistent across page refreshes using localStorage", () => {
    // Save a conversation
    cy.get("input[placeholder='Please tell me about your query!']").type(
      "Jeans"
    );
    cy.get("button[type='submit']").first().click();
    cy.get("button[type='button']").last().click();

    // Refresh the page
    cy.reload();

    // Navigate to Past Conversations page
    cy.get("a[href='/history']").click();
    cy.contains("Jeans").should("exist"); // Verify persistence
  });

  it("Should have a New suggestion button to start a new conversation", () => {
    // Ensure New Chat button exists
    cy.get("a[href='/']").contains("Want new suggestion?").should("exist").click();

    // Verify the input field is empty and ready for a new chat
    cy.get("input[placeholder='Please tell me about your query!']").should(
      "have.value",
      ""
    );
  });
});


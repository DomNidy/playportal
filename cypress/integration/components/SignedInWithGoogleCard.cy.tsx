import React from "react";
import SignInWithGoogle from "@/components/SignInWithGoogle";
import { Interception } from "cypress/types/net-stubbing";

describe("<SignInWithGoogle />", () => {
  /*
  This test ensures that the component can successfully mount
   */
  it("renders", () => {
    // see: https://on.cypress.io/mounting-react
    // Mount the component
    cy.mount(<SignInWithGoogle />);
  });
  /*
  This test ensures that the user can click the div, and that the div correctly directs the user to the google api
   */
  it("requests google auth on click", () => {
    // Mount the component
    cy.mount(<SignInWithGoogle />);
    // Set up interception with an alias
    cy.intercept("https://identitytoolkit.googleapis.com/v1/projects?key=*").as(
      "googleRequest"
    );

    // Find the component, then click it
    cy.get(".flex").click();

    // Intercept request to google api
    cy.wait("@googleRequest").then((interception: Interception) => {
      // Access the intercepted request
      const request = interception.request;

      const statusCode = interception?.response?.statusCode;

      // Perform assertions
      expect(request.method).to.equal("GET");
      expect(statusCode).to.equal(200);

      // TODO: Close the google login window
    });
  });
});

import React from "react";
import SignInWithSpotify from "@/app/components/SignInWithSpotify";
import { SpotifyUserProfile } from "@/app/definitions/SpotifyInterfaces";


describe("<SignInWithSpotify />", () => {
  it("renders", () => {
    // see: https://on.cypress.io/mounting-react
    // Mount the component
    cy.mount(
      <html lang="en">
        <body>
          <SignInWithSpotify />
        </body>
      </html>
    );
  });

  it("requests spotify login page on click", () => {
    // Mount the component
    cy.mount(
      <html>
        <body>
          <SignInWithSpotify />
        </body>
      </html>
    );

    // Set up interception with an alias
    cy.intercept("GET", "https://apresolve.spotify.com/*").as("spotifyRequest");

    // Find the component, then click it
    cy.get(".flex").click();

    // TODO: Due to CORS policy we cannot automatically test that the spotify request worked
  });
});

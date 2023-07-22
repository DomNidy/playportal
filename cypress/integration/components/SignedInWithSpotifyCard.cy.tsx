import React from "react";
import SignedInWithSpotifyCard from "@/app/components/SignedInWithSpotifyCard";
import { SpotifyUserProfile } from "@/app/interfaces/SpotifyInterfaces";


describe("<SignedInWithSpotifyCard />", () => {
  it("renders", () => {
    // see: https://on.cypress.io/mounting-react
    // Mount the component
    cy.mount(
      <html lang="en">
        <body>
          <SignedInWithSpotifyCard />
        </body>
      </html>
    );
  });

  it("requests spotify login page on click", () => {
    // Mount the component
    cy.mount(
      <html>
        <body>
          <SignedInWithSpotifyCard />
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

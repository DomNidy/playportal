import React from "react";
import SignedInWithSpotifyCard from "./SignedInWithSpotifyCard";
import { SpotifyUserProfile } from "../interfaces/SpotifyInterfaces";
import { Interception } from "cypress/types/net-stubbing";

describe("<SignedInWithSpotifyCard />", () => {
  it("renders", () => {
    // see: https://on.cypress.io/mounting-react
    // Mount the component
    cy.mount(<SignedInWithSpotifyCard spotifyUserProfile={false} />);
  });

  it("requests spotify login page on click", () => {
    // Mount the component
    cy.mount(<SignedInWithSpotifyCard spotifyUserProfile={false} />);

    // Set up interception with an alias
    cy.intercept("GET", "https://apresolve.spotify.com/*").as("spotifyRequest");

    // Find the component, then click it
    cy.get(".flex").click();

   // TODO: Due to CORS policy we cannot automatically test that the spotify request worked
  });
});

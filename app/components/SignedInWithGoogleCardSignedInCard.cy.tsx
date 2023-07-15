import React from "react";
import SignedInCard from "./SignedInWithGoogleCard";
import { User } from "firebase/auth";

describe("<SignedInCard />", () => {
  it("renders", () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(
      <SignedInCard
        photoURL={
          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
        }
        displayName={"Test"}
        email={"test@gmail.com"}
        updateUser={function (newUser: User): void {
          throw new Error("Function not implemented.");
        }}
      />
    );
  });
 
});

"use client";
import { Auth, User, getAuth } from "firebase/auth";
import { createContext, useEffect, useState } from "react";

type AuthCTX = {
  auth: Auth | undefined;
  user: User | undefined;
};

export const AuthContext = createContext<AuthCTX>({
  auth: undefined,
  user: undefined,
});

export default function AuthProvider({ children }: { children: any }) {
  const [auth, setAuth] = useState<Auth | undefined>(getAuth());
  const [user, setUser] = useState<User | undefined>();

  // Add an event listener that runs when auth state changes
  // We receive the User object when the listener runs, then we update our state to that updated User object
  // We then update the user state, this causes a re-render which then allows us to render the most recent state

  // NOTE: We dont have to access the user state for the most recent state, we can also access it in auth.currentUser
  useEffect(() => {
    auth?.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      }
    });
  });

  return (
    <AuthContext.Provider
      value={{
        auth: auth,
        user: user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

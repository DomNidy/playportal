"use client";
import { Platforms } from "@/definitions/Enums";
import { createContext, useContext, useEffect, useState } from "react";
import { fetchAllConnections } from "../fetching/FetchConnections";
import { AuthContext } from "./AuthContext";

// This type stores the profiles of the users connected platform accounts
type ConnectionsCTX = Record<Platforms, any> & {
  fetchConnections?: () => Promise<void>;
};

export const ConnectionsContext = createContext<ConnectionsCTX>({
  spotify: undefined,
  youtube: undefined,
});

export function ConnectionsProvider({ children }: { children: any }) {
  const auth = useContext(AuthContext);

  const [connectionsState, setConnectionsState] = useState<ConnectionsCTX>({
    spotify: undefined,
    youtube: undefined,
    fetchConnections: fetchConnections,
  });

  async function fetchConnections() {
    if (auth.auth) {
      console.log("ran fetch");

      const allConnections = await fetchAllConnections(auth.auth);

      // Update the connections state
      setConnectionsState((prev) => {
        return {
          ...prev,
          ...allConnections,
        } as ConnectionsCTX;
      });
    }
  }

  return (
    <ConnectionsContext.Provider value={connectionsState}>
      {children}
    </ConnectionsContext.Provider>
  );
}

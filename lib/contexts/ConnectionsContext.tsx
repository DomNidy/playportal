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

  // Fetches all connected accounts from the user, then updates connections state
  // Profiles are cached on users client, this is handled in the internal function calls
  async function fetchConnections() {
    if (auth.auth) {
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

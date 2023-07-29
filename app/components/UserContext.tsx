"use client";

import { Auth, User } from "firebase/auth";
import { createContext } from "react";

interface UserContext {
  user: User | undefined | null;
  auth: Auth;
}

export const UserContext = createContext<UserContext | undefined>(undefined);

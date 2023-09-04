import { NotificationType } from "@/definitions/UserInterfaces";
import { createContext } from "react";

export const NotificationContext = createContext<
  NotificationType[] | undefined
>(undefined);

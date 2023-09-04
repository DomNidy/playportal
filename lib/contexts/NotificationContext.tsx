"use client";
import { NotificationType } from "@/definitions/UserInterfaces";
import { SetStateAction, createContext, useState } from "react";

type NotifCTX = {
  notifications: NotificationType[];
  clearNotifications: () => void | undefined;
  addNotification: (notification: NotificationType) => void | undefined;
};

export const NotificationContext = createContext<NotifCTX>({
  notifications: [],
  clearNotifications: () => {},
  addNotification: () => {},
});

export function NotificationProvider({ children }: { children: any }) {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  function clearNotifications() {
    setNotifications([]);
  }

  function addNotification(notification: NotificationType) {
    setNotifications(
      notifications ? [...notifications, notification] : [notification]
    );
  }

  return (
    <NotificationContext.Provider
      value={{
        addNotification: addNotification,
        clearNotifications: clearNotifications,
        notifications: notifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

"use client";
import { NotificationType } from "@/definitions/UserInterfaces";
import { Auth } from "firebase/auth";
import { getDatabase, onValue, ref, update } from "firebase/database";
import {
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { getFirebaseApp } from "../utility/GetFirebaseApp";
import { AuthContext } from "./AuthContext";
import { NotificationObjectSchema } from "@/definitions/Schemas";

const app = getFirebaseApp();
// Get realtime db
const db = getDatabase(app);

type NotifCTX = {
  notifications: NotificationType[];
  addNotification: (notification: NotificationType) => void | undefined;
  markNotificationsAsRead: () => void | undefined;
  markNotificationsAsSeen: () => void | undefined;
  markNotificationAsRead: (notificationID: string) => void | undefined;
};

export const NotificationContext = createContext<NotifCTX>({
  notifications: [],
  markNotificationsAsRead: () => {},
  markNotificationsAsSeen: () => {},
  markNotificationAsRead: () => {},
  addNotification: () => {},
});

export function NotificationProvider({ children }: { children: any }) {
  const auth = useContext(AuthContext);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  useEffect(() => {
    if (!auth || !auth.currentUser) {
      return;
    }

    const notificationDoc = ref(db, `notifications/${auth.currentUser.uid}`);

    const unsubscribe = onValue(notificationDoc, (snap) => {
      const data = snap.toJSON() as object;
      console.log(data);

      if (typeof data == "object") {
        // Use zod on each notification object to ensure it is valid schema and we can create a Notification item from it
        Object.values(data).forEach((child) => {
          const parseResult = NotificationObjectSchema.safeParse(child);

          if (parseResult.success) {
            const notificationObject: NotificationType = child;
            console.log(
              `Notification object with id ${notificationObject.id} was valid`
            );


            // TODO: Create notifications on the client side from the notificationObject
          }
        });
      }
    });

    console.log("Added listener", auth.currentUser.uid);

    return unsubscribe;
  });

  /**
   * Mark all notifications as seen on the server side and cause them to not increment notification counter
   *
   * This does NOT remove them from the client side, they will still be on the client side and will still be on the server side,
   * but will not increment the notifications counter (the red circle with a number in it indicating the number of unseen notifications)
   * @returns {any}
   */

  function markNotificationsAsSeen() {
    setNotifications(
      notifications.map((notif) => {
        return { ...notif, seen: true };
      })
    );
  }

  function markNotificationsAsRead() {
    const _notifs = notifications;

    setNotifications([]);

    // TODO: Using the _notifs array, send a request to the api which marks all notifications as read, this will
    // TODO: cause the notification to no longer be fetched from the server and the notification object will eventually be deleted entirely (or maybe instantly, not sure yet)
  }

  /**
   * Create a notification in the ui from a notification object received from the server side
   * @param {any} notification
   * @returns {any}
   */
  function addNotification(notification: NotificationType) {
    setNotifications(
      notifications ? [...notifications, notification] : [notification]
    );
  }

  /**
   * Mark a single notification as read based on a notifiation id
   */
  // TODO: Implement this method
  function markNotificationAsRead(notificationID: string) {}

  return (
    <NotificationContext.Provider
      value={{
        markNotificationAsRead: markNotificationAsRead,
        markNotificationsAsSeen: markNotificationsAsSeen,
        markNotificationsAsRead: markNotificationsAsRead,
        addNotification: addNotification,
        notifications: notifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

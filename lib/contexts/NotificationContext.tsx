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
import {
  NotificationObjectSchema,
  NotificationResponseObjectSchema,
} from "@/definitions/Schemas";

const app = getFirebaseApp();
// Get realtime db
const db = getDatabase(app);

type NotifCTX = {
  notifications: NotificationType[];
  unseenNotificationCount: number;
  addNotification: (notification: NotificationType) => void | undefined;
  markNotificationsAsRead: () => void | undefined;
  markNotificationsAsSeen: () => void | undefined;
  markNotificationAsRead: (notificationID: string) => void | undefined;
};

export const NotificationContext = createContext<NotifCTX>({
  notifications: [],
  unseenNotificationCount: 0,
  markNotificationsAsRead: () => {},
  markNotificationsAsSeen: () => {},
  markNotificationAsRead: () => {},
  addNotification: () => {},
});

export function NotificationProvider({ children }: { children: any }) {
  const auth = useContext(AuthContext);
  const [unseenNotificationCount, setUnseenNotificationCount] =
    useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  // Add event listener to react to changes in the realtime db notifications object for the user
  useEffect(() => {
    if (!auth || !auth.currentUser) {
      return;
    }

    // Get reference to the notification doc which cooresponds to the current user
    const notificationDoc = ref(db, `notifications/${auth.currentUser.uid}`);

    // Create the event listener for whenever the noficiationDoc changes
    const unsubscribe = onValue(notificationDoc, (snap) => {
      const data = snap.toJSON() as object;

      // In order to avoid slow incrementation of the unseen notifications text on the ui, we will update the count here all at once
      if (NotificationResponseObjectSchema.safeParse(data).success) {
        let unseenCount = 0;
        Object.values(data).forEach((notif: NotificationType) => {
          if (notif.seen === false) {
            unseenCount += 1;
          }
        });

        setUnseenNotificationCount(unseenCount);
      }

      // If the realtime db data is an object
      if (typeof data == "object") {
        // Use zod on each notification object to ensure it is valid schema and we can create a Notification item from it
        Object.values(data).forEach((child) => {
          const parseResult = NotificationObjectSchema.safeParse(child);

          // If this specific entry was deemed to be an instance of NotificationType , log it out and add it to the notifications array
          if (parseResult.success) {
            const notificationObject: NotificationType = child;
            console.log(
              `Notification object with id ${notificationObject.id} was valid`
            );

            addNotification(notificationObject);
          }
        });
      }
    });

    console.log("Added listener", auth.currentUser.uid);

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  // When the notifications array chages, update the unseen notification count all at once
  useEffect(() => {
    let unseenAmount = 0;
    notifications.forEach((notification) => {
      if (!notification.seen) {
        unseenAmount += 1;
      }
    });

    setUnseenNotificationCount(unseenAmount);
  }, [notifications]);
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
    // TODO: Figure out the problem that is causing the notification counter to be updated one after the other (THIS IS NOT GOOD!)
    // TODO: we want the notification counter to instantly be set the the amount of notifications the user actually has (THAT IS WHAT WE WANT!)
    if (notifications.find((notif) => notif.id === notification.id)) {
      console.log("Already created this notification, ignoring!");
      return;
    }
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
        unseenNotificationCount: unseenNotificationCount,
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

"use client";
import { NotificationType } from "@/definitions/UserInterfaces";
import { Auth } from "firebase/auth";
import {
  DatabaseReference,
  getDatabase,
  onValue,
  ref,
  set,
  update,
} from "firebase/database";
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

interface NotificationProviderState {
  notifications: NotificationType[];
  unseenNotificationCount: number;
}

type NotifCTX = {
  notifications: NotificationType[];
  unseenNotificationCount: number;
  markNotificationsAsRead: () => void;
};

export const NotificationContext = createContext<NotifCTX>({
  notifications: [],
  markNotificationsAsRead: () => {},
  unseenNotificationCount: 0,
});

export function NotificationProvider({ children }: { children: any }) {
  const auth = useContext(AuthContext);

  const [state, setState] = useState<NotificationProviderState>({
    notifications: [],
    unseenNotificationCount: 0,
  });

  const [notificationDoc, setNotificationDoc] = useState<
    undefined | DatabaseReference
  >();

  useEffect(() => {
    if (auth && auth?.currentUser?.uid) {
      setNotificationDoc(ref(db, `notifications/${auth.currentUser.uid}`));
    }
  }, [auth, auth?.currentUser]);

  useEffect(() => {
    if (!auth?.currentUser) {
      return;
    }

    const notificationDoc = ref(db, `notifications/${auth.currentUser.uid}`);

    const unsubscribe = onValue(notificationDoc, (snap) => {
      console.log(notificationDoc);
      const data = snap.val();
      console.log(data);
      if (typeof data === "object" && data !== null) {
        const newNotifications: NotificationType[] = [];

        // Process data and create newNotifications array
        Object.values(data).forEach((child) => {
          const parseResult = NotificationObjectSchema.safeParse(child);

          // Make sure object has not already been created
          if (parseResult.success) {
            // Push the new notification
            newNotifications.push(child as NotificationType);
          }
        });

        // Update the state once for all new notifications
        setState((prevState) => ({
          ...prevState,
          notifications: [...prevState.notifications, ...newNotifications],
          unseenNotificationCount: calculateUnseenCount(newNotifications),
        }));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [auth]);

  /**
   * Mark a single notification as read based on a notifiation id
   */
  // TODO: Implement this method
  function markNotificationAsRead(notificationID: string) {}

  /**
   * Mark all notifications as read
   *
   * This deletes them from the realtime DB, these notifications will only be able to be fetched from the normal db
   */
  function markNotificationsAsRead() {
    if (!notificationDoc) {
      console.log("Cant, no doc");
      return;
    }

    set(notificationDoc, {});
    setState({
      notifications: [],
      unseenNotificationCount: 0,
    });
  }

  return (
    <NotificationContext.Provider
      value={{
        unseenNotificationCount: state.unseenNotificationCount,
        markNotificationsAsRead: markNotificationsAsRead,
        notifications: state.notifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// Helper function to calculate unseen notification count
function calculateUnseenCount(notifications: NotificationType[]): number {
  return notifications.filter((notification) => !notification.seen).length;
}

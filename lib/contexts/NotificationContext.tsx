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
import { useToast } from "@/components/ui/use-toast";

const app = getFirebaseApp();
// Get realtime db
const db = getDatabase(app);

// The NotificationProvider uses this type as its state
interface NotificationProviderState {
  notifications: NotificationType[];
  unseenNotificationCount: number;
}

// Type for the notification context
type NotifCTX = {
  notifications: NotificationType[];
  unseenNotificationCount: number;
  markNotificationsAsRead: () => void;
};

// Creating the context object
export const NotificationContext = createContext<NotifCTX>({
  notifications: [],
  markNotificationsAsRead: () => {},
  unseenNotificationCount: 0,
});

export function NotificationProvider({ children }: { children: any }) {
  // Current auth state for the user
  const auth = useContext(AuthContext);

  // Shadcn toast component hook
  const { toast } = useToast();

  const [state, setState] = useState<NotificationProviderState>({
    notifications: [],
    unseenNotificationCount: 0,
  });

  // Tracks notification ids that have already been rendered
  const [renderedNotifications, setRenderedNotifications] =
    useState<Set<string>>();

  // This is the document in realtime db which cooresponds to the current users notifications
  const [userNotificationRef, setUserNotificationRef] = useState<
    undefined | DatabaseReference
  >();

  useEffect(() => {
    if (auth && auth?.auth?.currentUser?.uid) {
      setUserNotificationRef(
        ref(db, `notifications/${auth.auth?.currentUser.uid}`)
      );
    }
  }, [auth, auth?.auth?.currentUser]);

  useEffect(() => {
    if (!auth?.auth?.currentUser) {
      return;
    }

    const notificationDoc = ref(
      db,
      `notifications/${auth.auth?.currentUser.uid}`
    );

    const unsubscribe = onValue(notificationDoc, (snap) => {
      const data = snap.val();
      if (typeof data === "object" && data !== null) {
        const newNotifications: NotificationType[] = [];

        // Process data and create newNotifications array
        Object.values(data).forEach((child) => {
          const parseResult = NotificationObjectSchema.safeParse(child);

          // If the object has a valid schema for a notification object
          // And the renderedNotifications set does not include the id
          // Add it to the notifications
          if (
            parseResult.success &&
            !renderedNotifications?.has((child as NotificationType).id)
          ) {
            // Push the new notification
            newNotifications.push(child as NotificationType);

            // If it should popup, create the toast popup
            toast({
              title: (child as NotificationType).title,
              description: (child as NotificationType).message,
            });

            // Add it to already rendered hashmap
            setRenderedNotifications((prev) =>
              new Set(prev).add((child as NotificationType).id)
            );
          }
        });

        // Update the state once for all new notifications
        setState((prevState) => ({
          notifications: [...prevState.notifications, ...newNotifications],
          unseenNotificationCount: calculateUnseenCount([
            ...prevState.notifications,
            ...newNotifications,
          ]),
        }));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [auth, renderedNotifications]);

  /**
   * Mark all notifications as read
   *
   * This deletes them from the realtime DB, these notifications will only be able to be fetched from the normal db
   */
  function markNotificationsAsRead() {
    if (!userNotificationRef) {
      console.log("Cant, no doc");
      return;
    }

    set(userNotificationRef, {});
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

"use client";
import { NotificationType } from "@/definitions/UserInterfaces";
import {
  DatabaseReference,
  getDatabase,
  onValue,
  ref,
  set,
} from "firebase/database";
import { createContext, useContext, useEffect, useState } from "react";
import { getFirebaseApp } from "../utility/GetFirebaseApp";
import { AuthContext } from "./AuthContext";
import { NotificationObjectSchema } from "@/definitions/Schemas";
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

  // This is the document in realtime db which cooresponds to the current users notifications
  const [userNotificationRef, setUserNotificationRef] = useState<
    undefined | DatabaseReference
  >();

  useEffect(() => {
    if (auth?.auth?.currentUser?.uid) {
      setUserNotificationRef(
        ref(db, `notifications/${auth.auth.currentUser.uid}`)
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
      // Parse notification doc data from firebase
      const notificationDocData = snap.val();
      if (
        typeof notificationDocData === "object" &&
        notificationDocData !== null
      ) {
        // Set which contains the all unique notification ids
        const uniqueNotificationIDS: Set<string> = new Set();

        // Contains all child notification objects from the users notification document
        const updatedNotifications: NotificationType[] = [];

        // Process data and create newNotifications array
        Object.values(notificationDocData).forEach((child) => {
          // Parse the data of the current child in the user notification doc (this should coorespond to a notification object)
          const parseResult = NotificationObjectSchema.safeParse(child);

          // If the object has a valid schema for a notification object
          if (
            parseResult.success &&
            !uniqueNotificationIDS.has((child as NotificationType).id)
          ) {
            // Create a new type for the child notification with the correct type annotation
            const childNotification: NotificationType =
              child as NotificationType;

            // Add notification to updatedNotifications array
            updatedNotifications.push(childNotification);

            // Add id of the notification to the alreadyRendered set
            uniqueNotificationIDS.add(childNotification.id);

            // If the notification should create a popup
            if (childNotification.shouldPopup === true) {
              // Create the popup toast
              toast({
                title: childNotification.title,
                description: childNotification.message,
              });

              // Mark notification as seen since we've created a popup for it
              markNotificationAsSeen(childNotification);
            }
          }
        });

        // Sort the updatedNotifications array to descending order (so that more recent notifications are at the top)
        updatedNotifications.sort((a, b) => {
          if (a.createdAtMS < b.createdAtMS) {
            return 1;
          } else {
            return 0;
          }
        });

        // Update the state once for all new notifications
        setState({
          notifications: updatedNotifications,
          unseenNotificationCount: calculateUnseenCount(updatedNotifications),
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [auth]);

  /**
   * Mark all notifications as read
   *
   * This deletes them from the realtime DB, these notifications will only be able to be fetched from the normal db
   */
  function markNotificationsAsRead() {
    if (!userNotificationRef) {
      return;
    }

    set(userNotificationRef, {});
    setState({
      notifications: [],
      unseenNotificationCount: 0,
    });
  }

  // TODO: Review this
  /**
   * Mark a notification in realtime db as already seen, also updates the shouldPopup value to false
   */
  function markNotificationAsSeen(notification: NotificationType) {
    // If the current user uidis defined
    if (auth.auth?.currentUser?.uid) {
      // Update the notification in the document
      set(
        ref(
          db,
          `notifications/${auth.auth.currentUser?.uid}/${notification.id}`
        ),
        {
          ...notification,
          shouldPopup: false,
          seen: true,
        }
      );
    }
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

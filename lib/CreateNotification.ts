import { NotificationType } from "@/definitions/UserInterfaces";
import { getFirebaseAdminApp } from "./auth/Utility";

const adminApp = getFirebaseAdminApp();

const realtimeDB = adminApp.database(
  "https://multi-migrate-default-rtdb.firebaseio.com/"
);

/**
 * Creates a notification object in the db, both realtime and normal db
 * @param {any} uuid UUID to create the notification for
 * @param {any} notification The notification object
 * @returns {any}
 */

export async function createNotificationForUUID(
  uuid: string,
  notification: NotificationType
) {
  const notificationsRef = await realtimeDB.ref(
    `notifications/${uuid}/${notification.id}`
  );

  notificationsRef.update(notification);
}

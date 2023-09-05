"use client";

import { NotificationType } from "@/definitions/UserInterfaces";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AiOutlineMinus } from "@react-icons/all-files/ai/AiOutlineMinus";
import { useContext } from "react";
import { NotificationContext } from "@/lib/contexts/NotificationContext";

export default function NotificationBoxItem({
  notification,
}: {
  notification: NotificationType;
}) {
  const notificationContext = useContext(NotificationContext);
  return (
    <Alert>
      {" "}
      <AlertTitle className="justify-between flex">
        {notification.title}
        <AiOutlineMinus
          onClick={() => notificationContext.markNotificationsAsSeen()}
          className="hover:bg-secondary text-lg transition-colors duration-100 cursor-pointer p-0.5 rounded-full"
        />
      </AlertTitle>
      <AlertDescription>{notification.message}</AlertDescription>
    </Alert>
  );
}

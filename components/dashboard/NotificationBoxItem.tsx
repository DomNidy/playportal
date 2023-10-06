"use client";

import { NotificationType } from "@/definitions/UserInterfaces";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AiOutlineMinus } from "@react-icons/all-files/ai/AiOutlineMinus";

export default function NotificationBoxItem({
  notification,
}: {
  notification: NotificationType;
}) {
  return (
    <Alert>
      {" "}
      <AlertTitle className="justify-between flex">
        {notification.title}
        <AiOutlineMinus className="hover:bg-secondary text-lg transition-colors duration-100 cursor-pointer p-0.5 rounded-full" />
      </AlertTitle>
      <AlertDescription>{notification.message}</AlertDescription>
    </Alert>
  );
}

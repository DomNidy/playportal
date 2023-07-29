"use client";

import { useState } from "react";

type NotificationType = {
  type: "success" | "error" | "neutral";
  message: string;
};

export default function Notification({
  notification,
}: {
  notification: NotificationType;
}) {
  const [fadingIn, setFadingIn] = useState<boolean>(false);

  const [fadingOut, setFadingOut] = useState<boolean>(false);

  // Fade notification after 4sec
  const fadeOutTimeout = setTimeout(() => {
    setFadingOut(true);
  }, 4000);

  const notificationColor =
    notification.type == "success"
      ? "notification-success"
      : notification.type == "error"
      ? "notification-error"
      : "notification-neutral";

  return (
    <div
      className={`h-fit w-fit transition-all duration-300 rounded-3xl font-semibold tracking-tight
        text-white  p-2 cursor-pointer ${notificationColor} ${
        fadingOut ? "opacity-25 scale-0" : "opacity-100"
      }`}
    >
      {notification.message}
    </div>
  );
}

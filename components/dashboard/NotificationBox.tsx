"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationType } from "@/definitions/UserInterfaces";
import { NotificationContext } from "@/lib/contexts/NotificationContext";
import { useContext, useEffect, useState } from "react";
import { BsBellFill } from "@react-icons/all-files/bs/BsBellFill";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { ScrollArea } from "../ui/scroll-area";
import NotificationBoxItem from "./NotificationBoxItem";

export default function NotificationBox() {
  const [open, setOpen] = useState<boolean>(false);
  const [unseenNotificationCount, setUnseenNotificationCount] =
    useState<number>(0);
  const notifs = useContext(NotificationContext);

  const getNotificationColor = (notification: NotificationType) => {
    return notification.type == "success"
      ? "notification-success"
      : notification.type == "error"
      ? "notification-error"
      : "notification-neutral";
  };

  useEffect(() => {
    let unseenAmount = 0;
    notifs.notifications.forEach((notification) => {
      if (!notification.seen) {
        unseenAmount += 1;
      }
    });

    setUnseenNotificationCount(unseenAmount);
  }, [notifs.notifications]);

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div>
            <BsBellFill
              onClick={() => setOpen(!open)}
              className={`dark:text-foreground/80 relative top-2 text-primary-foreground/80 saturate-50 cursor-pointer ${
                unseenNotificationCount > 0 ? "-top-2" : " mb-[9.2px]"
              }`}
            ></BsBellFill>
            <div
              className={`relative z-20   left-3 bg-red-600 text-white text-xs rounded-full ${
                unseenNotificationCount > 0
                  ? "w-[16px] h-[16px] -top-3"
                  : "hidden scale-0"
              }`}
            >
              {unseenNotificationCount}
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-screen md:max-w-[450px] md:w-fit md:relative md:right-10 max-h-[450px] overflow-y-scroll ">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifs.notifications.map((notif) => (
            <DropdownMenuItem key={Math.random().toString()}>
              <NotificationBoxItem notification={notif} />
            </DropdownMenuItem>
          ))}
          {
            //* Maps out all notifications, these should be received from the server
          }

          {notifs.notifications.length === 0 ? (
            <DropdownMenuLabel className="text-sm text-muted-foreground">
              You have no notifications...
            </DropdownMenuLabel>
          ) : (
            <DropdownMenuLabel className="flex w-full justify-center">
              <h3
                className="text-muted-foreground font-semibold cursor-pointer"
                onClick={() => notifs.markNotificationsAsRead()}
              >
                Mark all as read.
              </h3>
            </DropdownMenuLabel>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

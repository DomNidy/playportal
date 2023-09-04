"use client";

import { NotificationType } from "@/definitions/UserInterfaces";
import { NotificationContext } from "@/lib/contexts/NotificationContext";
import { useContext, useEffect, useState } from "react";
import { BsBellFill } from "@react-icons/all-files/bs/BsBellFill";
import { Button } from "../ui/button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { ScrollArea } from "../ui/scroll-area";
import { GrFormClose } from "@react-icons/all-files/gr/GrFormClose";

export default function NotificationBox() {
  const [open, setOpen] = useState<boolean>(false);
  const notifs = useContext(NotificationContext);

  const getNotificationColor = (notification: NotificationType) => {
    return notification.type == "success"
      ? "notification-success"
      : notification.type == "error"
      ? "notification-error"
      : "notification-neutral";
  };

  useEffect(() => {
    console.log(notifs);
  }, [notifs]);

  return (
    <div>
      <BsBellFill
        onClick={() => setOpen(!open)}
        className="dark:text-foreground/80  text-primary-foreground/80 saturate-50 cursor-pointer"
      ></BsBellFill>
      {open && (
        <div
          className="fixed sm:relative w-full top-7 sm:top-0 left-0 inset-0 flex justify-center items-center  z-50 sm:block"
          style={{ marginLeft: "0px" }}
        >
          <div className="min-h-[220px] w-screen  md:w-72 relative rounded-lg p-1 z-50 top-[4.25rem] sm:top-20 rounded-t-none sm:rounded-t-md flex items-center justify-center  border bg-background border-border">
            <GrFormClose
              className="w-[26.5px] h-[26.5px] text-muted-foreground absolute top-1 right-1 bg-muted rounded-full cursor-pointer transition-all duration-150"
              onClick={() => setOpen(false)}
            />
            {notifs?.length == 0 ? (
              <p className="text-sm text-center text-muted-foreground">
                You have no notifications
              </p>
            ) : (
              <ScrollArea className="h-[200px]">
                {
                  //TODO: Implement a "timestamp" for notifications (when they were receieved, then sort the array by that timestamp, then map the sorted array)
                  //TODO: Also need to implement these on the serverside, then fetch for notifs, shouldnt be too complicated though,
                  //TODO: We might be able to use realtime db for these notifs (that may be unnecessary tho, we'll see)
                  notifs?.map((notif) => (
                    <div key={notif.message}>
                      <Alert className={getNotificationColor(notif)}>
                        <AlertTitle>{notif.message}</AlertTitle>
                        <AlertDescription>AAAAAAAA</AlertDescription>
                      </Alert>
                    </div>
                  ))
                }
              </ScrollArea>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

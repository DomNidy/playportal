"use client";
import SpotifyConnection from "@/components/connected-accounts/SpotifyConnection";
import YoutubeConnection from "@/components/connected-accounts/YoutubeConnection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Metadata } from "next";
import { Suspense, useContext } from "react";
import youtubeIcon from "@/public/youtube-icon.svg";
import Image from "next/image";
import { NotificationContext } from "@/lib/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// export const metadata: Metadata = {
//   title: "Connections",
//   description: "Connect your streaming accounts.",
// };

export default function Page() {
  const notifs = useContext(NotificationContext);

  return (
    <div className="min-h-screen w-full flex flex-col bg-background items-center mt-16">
      <Button
        onClick={() =>
          notifs?.addNotification({
            message:
              "An action occured, please review this! Just kidding, this is actually a test notification. Nothing REALLY happened. ",
            title: "Something happened!",
            type: "success",
          })
        }
      >
        Add notif
      </Button>
      <Accordion type="single" collapsible className="w-80 sm:w-96">
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <Avatar>
              <AvatarImage
                src="https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg"
                className="w-[64px]"
              ></AvatarImage>
            </Avatar>
            Spotify Account
          </AccordionTrigger>
          <AccordionContent>
            <Suspense>
              <SpotifyConnection />
            </Suspense>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>
            <Image
              src={youtubeIcon}
              alt=""
              className="w-[52px] -left-1 relative aspect-square"
            ></Image>
            Youtube Account
          </AccordionTrigger>
          <AccordionContent>
            <Suspense>
              <YoutubeConnection />
            </Suspense>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

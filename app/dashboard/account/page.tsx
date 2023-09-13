"use client";
import SpotifyConnection from "@/components/connected-accounts/SpotifyConnection";
import YoutubeConnection from "@/components/connected-accounts/YoutubeConnection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GetBaseUrl } from "@/lib/utility/GetBaseUrl";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { useRouter } from "next/navigation";
import { Suspense, useContext, useEffect, useState } from "react";
import Image from "next/image";

import spotifyIcon from "@/public/spotify-icon.svg";
import youtubeIcon from "@/public/youtube-icon.svg";
import { AuthContext } from "@/lib/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ChangePasswordAlert from "@/components/dashboard/ChangePasswordAlert";

export default function AccountPage() {
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const authContext = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (authContext?.user) {
      setIsAuthLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authContext?.user]);

  return (
    <main className="w-full min-h-screen  bg-background flex justify-center translate-y-24 sm:-translate-y-16 sm:items-center">
      <section>
        <Tabs
          defaultValue="account"
          className="sm:flex sm:w-[440px] sm:gap-4 items-center "
        >
          <TabsList
            className="flex sm:flex-col gap-4   sm:text-left sm:items-start  "
            aria-orientation="vertical"
            showBG={false}
          >
            <TabsTrigger
              value="account"
              type="button"
              className="text-base sm:text-[17.5px] px-1 sm:px-3.5"
            >
              Account
            </TabsTrigger>
            <TabsTrigger
              value="connections"
              type="button"
              className="text-base sm:text-[17.5px] px-1 sm:px-3.5"
            >
              Connections
            </TabsTrigger>{" "}
            <TabsTrigger
              onClick={() => {
                router.push(`${GetBaseUrl()}dashboard/history`);
              }}
              value="transferHistory"
              type="button"
              className="text-base sm:text-[17.5px] px-1 sm:px-3.5"
            >
              Transfer History
            </TabsTrigger>
          </TabsList>
          <Separator
            className="my-4 h-[100px] hidden sm:visible"
            orientation="vertical"
          />
          <div className="flex items-center flex-col sm:block ">
            <TabsContent
              value="account"
              className="bg-secondary p-4 w-[345px] rounded-md"
            >
              <h3 className="tracking-tight font-semibold text-[18.5px]">
                Account Settings
              </h3>
              <Separator orientation="horizontal" className="mb-1 w-full " />
              <p className="text-muted-foreground text-sm">
                Manage your account settings here.
              </p>{" "}
              <div className="flex flex-col mt-2 gap-6">
                <div>
                  <h4 className="tracking-tighter text-muted-foreground font-semibold text-[15.5px]">
                    EMAIL
                  </h4>
                  <p className={`text-[15.5px]`}>
                    {authContext?.auth?.currentUser?.email || "Loading..."}
                  </p>
                </div>
                <div>
                  <h4 className="tracking-tighter text-muted-foreground font-semibold text-[15.5px]">
                    DISPLAY NAME
                  </h4>
                  <p className="text-[15.5px]">
                    {authContext?.auth?.currentUser?.displayName ||
                      "Loading..."}
                  </p>
                </div>
                <div>
                  <h4 className="tracking-tighter text-muted-foreground font-semibold text-[15.5px]">
                    ACCOUNT CREATED
                  </h4>
                  <p className="text-[15.5px]">
                    {authContext?.auth?.currentUser?.metadata.creationTime ||
                      "Unknown"}
                  </p>
                </div>{" "}
                <div>
                  <h4 className="tracking-tighter text-muted-foreground font-semibold text-[15.5px]">
                    CHANGE PASSWORD
                  </h4>
                  <ChangePasswordAlert />
                </div>
                <div>
                  <h4 className="tracking-tighter text-muted-foreground font-semibold text-[15.5px]">
                    LOG OUT
                  </h4>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button>Log Out</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you wish to log out? You will not be able
                          to access the dashboard until you log in again.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => authContext?.auth?.signOut()}
                        >
                          Logout
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </TabsContent>
            <TabsContent
              value="connections"
              className="bg-secondary p-4 rounded-md"
            >
              <h3 className="tracking-tight font-semibold text-[18.5px]">
                Connected Accounts
              </h3>
              <Separator orientation="horizontal" className="mb-1 w-full " />
              <p className="text-muted-foreground text-sm">
                Here you can connect your streaming accounts.
              </p>{" "}
              <Accordion
                type="single"
                collapsible
                className="w-80 sm:w-96 space-y-1"
              >
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    <Image
                      src={spotifyIcon}
                      alt="Spotify icon"
                      className="w-[45px]  relative aspect-square"
                    />
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
                      alt="a"
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
            </TabsContent>{" "}
          </div>
        </Tabs>
      </section>
    </main>
  );
}

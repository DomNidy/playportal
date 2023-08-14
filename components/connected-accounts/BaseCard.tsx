"use client";
import Image, { ImageProps } from "next/image";
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
} from "../ui/alert-dialog";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

// This component handles the layout of the card and UX
export default function BaseCard({
  unlinkAccountFunction,
  linkAccountFunction,
  profilePicURL,
  profileURL,
  connectedAccountName,
  serviceName,
  children,
  serviceLogoImageProps,
}: {
  linkAccountFunction?: () => any;
  unlinkAccountFunction?: () => any;
  profilePicURL?: string;
  profileURL?: string;
  connectedAccountName?: string;
  serviceName: string;
  children?: JSX.Element[] | JSX.Element;
  serviceLogoImageProps: ImageProps;
}) {
  // Our isConnected state depends on whether the connected account has a name property
  // If the account does not have a name property, then the account will be considered not connected
  const [isConnected, setIsConnected] = useState<boolean>(
    !!connectedAccountName
  );

  // When our connected account name changes, update the connected state
  // Should be set to true if connectedAccountName is defined
  // Should be set to false if connectedAccountName is undefined
  useEffect(() => {
    setIsConnected(!!connectedAccountName);
  }, [connectedAccountName, profileURL, serviceName, profilePicURL]);

  return (
    <div className="w-[85%] lg:w-[50%]  flex flex-col items-center ">
      <div className="bg-secondary  rounded-t-lg p-1 gap-2 text-muted-foreground  flex w-full">
        <h1>{serviceName} Account:</h1>
        <p className="font-light italic truncate text-ellipsis max-w-[82%] ">
          {isConnected ? `${connectedAccountName}` : "Account not connected"}
        </p>
      </div>

      {children}
      <div
        className={`w-full items-center bg-secondary shadow-lg  p-2 transition-all hover:cursor-pointer rounded-b-lg flex justify-evenly ${
          isConnected ? "" : "grayscale "
        }`}
      >
        <Image
          src={serviceLogoImageProps.src}
          width={48}
          height={48}
          alt={serviceLogoImageProps.alt}
          className=""
        ></Image>

        {isConnected && (
          <div className="h-full flex items-center ">
            <Image
              width={48}
              height={48}
              src={
                profilePicURL
                  ? profilePicURL
                  : "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png"
              }
              alt="Profile image"
              className="cover rounded-full "
              onClick={() => {
                if (profileURL) {
                  window.open(profileURL);
                }
              }}
            ></Image>
          </div>
        )}
        {isConnected && (
          <AlertDialog>
            <AlertDialogTrigger>
              <div className="bg-primary  text-primary-foreground rounded-md p-[0.55rem] px-3  text-sm hover:bg-primary/90 transition-all">
                Unlink Account
              </div>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="pointer-events-none">
                  Are you sure?
                </AlertDialogTitle>
                <AlertDialogDescription className="pointer-events-none">
                  This action will remove your account {serviceName} account{" "}
                  <span className="text-primary">{connectedAccountName}</span>{" "}
                  from our servers, you will have to login again in order to
                  view data from this account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    setIsConnected(false);

                    if (unlinkAccountFunction) {
                      unlinkAccountFunction();
                    }
                  }}
                >
                  Unlink Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        {!isConnected && (
          <Button onClick={linkAccountFunction}>Link Account</Button>
        )}
      </div>
    </div>
  );
}

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
  }, [connectedAccountName, profileURL, serviceName]);

  return (
    <div>
      <h1>{serviceName} Account:</h1>
      <p className="font-light italic truncate text-ellipsis max-w-[82%] ">
        {isConnected ? `${connectedAccountName}` : "Account not connected"}
      </p>

      <div
        className={`w-80 bg-primary-foreground p-2 transition-all hover:cursor-pointer rounded-lg flex justify-center ${
          isConnected ? "" : "grayscale "
        }`}
      >
        {children}
        <div className="flex gap-5 justify-between overflow-hidden">
          <Image
            src={serviceLogoImageProps.src}
            width={72}
            height={72}
            alt={serviceLogoImageProps.alt}
          ></Image>

          {profilePicURL && isConnected && (
            <div className="h-full flex items-center ">
              <Image
                width={72}
                height={72}
                src={profilePicURL}
                alt="Profile image"
                className="cover rounded-full h-[72px]"
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
              <AlertDialogTrigger className="bg-secondary rounded-md">
                Unlink Account
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will remove your account from our servers, you
                    will have to login again in order to view data from this
                    account.
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
    </div>
  );
}

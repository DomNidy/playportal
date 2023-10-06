"use client";
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
import { Platforms } from "@/definitions/Enums";
import {
  TransferFormStateProperties,
  TransferFormStates,
} from "@/definitions/UserInterfaces";
import { GetBaseUrl } from "@/lib/utility/GetBaseUrl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

export default function PlatformSelectionCard({
  isLoading,
  platformIconSVG,
  platformName,
  isPlatformConnected,
  selectionType,
  setTransferFormState,
  setTransferFormSettings,
}: {
  isLoading: boolean;
  platformIconSVG: any;
  platformName: Platforms;
  isPlatformConnected: boolean;
  selectionType: "destination" | "origin";
  setTransferFormState: Dispatch<SetStateAction<TransferFormStates>>;
  setTransferFormSettings: Dispatch<
    SetStateAction<TransferFormStateProperties>
  >;
}) {
  const [openAlertDialog, setOpenAlertDialog] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    if (isPlatformConnected && openAlertDialog) {
      setOpenAlertDialog(false);
    }
  }, [isPlatformConnected, openAlertDialog]);
  return (
    <div
      className={`max-h-[150px] max-w-[150px] h-full w-full flex items-center justify-center aspect-square bg-transfer-form-selection 
                    rounded-lg grayscale  ${
                      isPlatformConnected && !isLoading
                        ? "hover:grayscale-0 cursor-pointer duration-150"
                        : "animate-pulse duration-1000 "
                    } transition-all`}
      onClick={() => {
        // If account hasnt loaded yet dont do anything
        if (isLoading) {
          return;
        }

        // If the platform is not connected, open the alert dialog
        if (!isPlatformConnected && !openAlertDialog) {
          setOpenAlertDialog(true);
        }

        // If selection type is origin, update the form state to select the origin playlist
        if (selectionType === "origin" && isPlatformConnected) {
          setTransferFormState(TransferFormStates.SELECTING_ORIGIN_PLAYLIST);
          setTransferFormSettings((past) => {
            return {
              ...past,
              origin: {
                playlistPlatform: platformName,
              },
            };
          });
        }

        // If selection type is destination, update the form state to select the destination playlist
        if (selectionType === "destination" && isPlatformConnected) {
          setTransferFormState(
            TransferFormStates.SELECTING_DESTINATION_PLAYLIST
          );
          setTransferFormSettings((past) => {
            return {
              ...past,
              destination: {
                playlistPlatform: platformName,
              },
            };
          });
        }
      }}
    >
      <AlertDialog open={openAlertDialog} onOpenChange={setOpenAlertDialog}>
        <AlertDialogTrigger asChild></AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Not connected</AlertDialogTitle>
            <AlertDialogDescription>
              Your {platformName} account has not been connected to Playportal.
              You can link it in the Connections tab of your account page. Would
              you like us to take you there?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenAlertDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => router.push(`${GetBaseUrl()}dashboard/account`)}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Image
        src={platformIconSVG as string}
        width={94}
        alt={`${platformName}`}
      />
    </div>
  );
}

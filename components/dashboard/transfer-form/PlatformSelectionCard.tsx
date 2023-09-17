"use client";
import { AlertTitle } from "@/components/ui/alert";
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
  platformIconSVG,
  platformName,
  isPlatformConnected,
  setTransferFormState,
  setTransferFormSettings,
}: {
  platformIconSVG: any;
  platformName: Platforms;
  isPlatformConnected: boolean;
  setTransferFormState: Dispatch<SetStateAction<TransferFormStates>>;
  setTransferFormSettings: Dispatch<
    SetStateAction<TransferFormStateProperties>
  >;
}) {
  const [openAlertDialog, setOpenAlertDialog] = useState<boolean>();
  const router = useRouter();

  useEffect(() => {
    if (isPlatformConnected && openAlertDialog) {
      setOpenAlertDialog(false);
    }
  }, [isPlatformConnected, openAlertDialog]);
  return (
    <div
      className={`max-h-[150px] max-w-[150px] h-full w-full flex items-center justify-center aspect-square bg-background 
                    rounded-lg grayscale cursor-pointer   ${
                      isPlatformConnected ? "hover:grayscale-0" : ""
                    } transition-all duration-150`}
      onClick={() => {
        // If the platform is not connected, open the alert dialog
        if (!isPlatformConnected && !openAlertDialog) {
          setOpenAlertDialog(true);
        }

        // If the platform is connected, update the form state and settings
        setTransferFormState(TransferFormStates.SELECTING_ORIGIN_PLAYLIST);
        setTransferFormSettings({
          originPlatform: platformName,
        });
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

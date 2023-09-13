"use client";

import { AuthContext } from "@/lib/contexts/AuthContext";
import { useContext, useState } from "react";
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
import { sendUserPasswordReset } from "@/lib/auth/GoogleAuthFlow";
import { Button } from "../ui/button";
import { ScaleLoader } from "react-spinners";
import { useTheme } from "next-themes";
import { BsCheckCircle } from "@react-icons/all-files/bs/BsCheckCircle";

export default function ChangePasswordAlert() {
  const authContext = useContext(AuthContext);
  // If the alert dialog is opened
  const [open, setOpen] = useState<boolean>(false);
  // If we are sending a reset email to the user
  const [isSending, setIsSending] = useState<boolean>(false);
  // If we sent the user an email and it finished loading
  const [sentAlready, setSentAlready] = useState<boolean>(false);
  // Used for adjusting the spinners color based on current color theme
  const theme = useTheme();

  return (
    <AlertDialog open={open}>
      <AlertDialogTrigger asChild>
        <Button onClick={() => setOpen(!open)}>Change Password</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {sentAlready
              ? "Email sent!"
              : "Are you sure you wish to change your password?"}
          </AlertDialogTitle>
          {isSending ? (
            <AlertDialogDescription className="flex justify-center">
              {" "}
              <ScaleLoader
                color={`${theme.resolvedTheme == "dark" ? "white" : "#4A179B"}`}
              />
            </AlertDialogDescription>
          ) : (
            <div className="text-sm text-muted-foreground">
              {sentAlready ? (
                <div className="flex gap-2 items-center">
                  <BsCheckCircle className="text-lg" />
                  <p>Your password reset email has been sent!</p>
                </div>
              ) : (
                "You will receive an email containing instructions to change your password."
              )}
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setOpen(false)}>
            {sentAlready ? "Close" : "Cancel"}
          </AlertDialogCancel>
          {!sentAlready ? (
            <AlertDialogAction
              onClick={async () => {
                setIsSending(true);

                if (authContext?.auth?.currentUser?.email) {
                  const resetRequest = await sendUserPasswordReset(
                    authContext?.auth?.currentUser?.email
                  );

                  setIsSending(false);
                  setSentAlready(true);
                }
              }}
            >
              Reset Password
            </AlertDialogAction>
          ) : (
            <></>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

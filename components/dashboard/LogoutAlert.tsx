"use client";

import { AlertTitle } from "../ui/alert";
import { AlertDialog } from "../ui/alert-dialog";

export default function LogoutAlert() {
  return (
    <AlertDialog>
      <AlertTitle>You are logging out</AlertTitle>
    </AlertDialog>
  );
}

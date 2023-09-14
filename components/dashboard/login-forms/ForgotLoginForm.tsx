"use client";

import { useForm } from "react-hook-form";
import * as z from "zod";
import { ResetPasswordFormSchema } from "@/definitions/Schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "../../ui/button";
import { sendUserPasswordReset } from "@/lib/auth/GoogleAuthFlow";
import { useState } from "react";
import { FirebaseUserFacingErrorMessages } from "@/definitions/FirebaseInterfaces";

export default function ForgotLoginForm() {
  // Shows the result of a user attempting to reset their password (if the reset attempt succeeded or not)
  const [resetPasswordStatusMessage, setResetPasswordStatusMessage] =
    useState<string>("");

  // Form used to reset the users password
  const resetPasswordForm = useForm<z.infer<typeof ResetPasswordFormSchema>>({
    resolver: zodResolver(ResetPasswordFormSchema),
    defaultValues: {
      resetEmail: "",
    },
  });

  // Submit handler ran when the user tries to reset their password
  async function onSubmitResetPassword(
    values: z.infer<typeof ResetPasswordFormSchema>
  ) {
    const resetResult = await sendUserPasswordReset(values.resetEmail);

    if (resetResult === true) {
      setResetPasswordStatusMessage(
        "Your password reset email has been sent, please check your inbox."
      );
    }
    if (resetResult !== true && !!resetResult) {
      // Find user facing error message assosciated with error code
      const userFacingErrorMsg =
        FirebaseUserFacingErrorMessages[resetResult || ""];

      // Update error message
      setResetPasswordStatusMessage(
        userFacingErrorMsg
          ? userFacingErrorMsg
          : "Something went wrong, please try again later."
      );
    }
  }

  return (
    <Form {...resetPasswordForm}>
      <form
        onSubmit={resetPasswordForm.handleSubmit(onSubmitResetPassword)}
        className="space-y-2 w-[280px] sm:w-[320px]"
      >
        <FormField
          control={resetPasswordForm.control}
          name="resetEmail"
          render={({ field }) => (
            <FormItem>
              <FormDescription>
                Please enter the email address assosciated with your Playportal
                account.
              </FormDescription>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="tracking-tighter translate-y-2">
          Reset Password
        </Button>
        {resetPasswordStatusMessage && (
          <p className="p-2 text-center text-sm ">
            {resetPasswordStatusMessage}
          </p>
        )}
      </form>
    </Form>
  );
}

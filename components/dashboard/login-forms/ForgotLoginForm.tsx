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

export default function ForgotLoginForm() {
  // Form used to reset the users password
  const resetPasswordForm = useForm<z.infer<typeof ResetPasswordFormSchema>>({
    resolver: zodResolver(ResetPasswordFormSchema),
    defaultValues: {
      resetEmail: "",
    },
  });

  // Submit handler ran when the user tries to reset their password
  function onSubmitResetPassword(
    values: z.infer<typeof ResetPasswordFormSchema>
  ) {
    // TODO: Run the reset user password code here
    console.log(`Reset pass vals: ${JSON.stringify(values)}`);
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
                <Input placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="tracking-tighter translate-y-2">
          Reset Password
        </Button>
      </form>
    </Form>
  );
}

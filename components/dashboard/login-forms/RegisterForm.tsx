"use client";

import { useForm } from "react-hook-form";
import * as z from "zod";
import { RegisterFormSchema } from "@/definitions/Schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "../../ui/button";
import { signUpWithEmail } from "@/lib/auth/GoogleAuthFlow";
import { useState } from "react";
import { FirebaseUserFacingErrorMessages } from "@/definitions/FirebaseInterfaces";

export default function RegisterForm() {
  // Message to display on a failed login attempt
  const [registerFailureMessage, setRegisterFailureMessage] =
    useState<string>();

  const form = useForm<z.infer<typeof RegisterFormSchema>>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Submit handler (ran when the user tries to register with valid credentials)
  async function onSubmit(values: z.infer<typeof RegisterFormSchema>) {
    // TODO: Start the register user code here
    console.log(`Values: ${JSON.stringify(values)}`);

    const registerResult = await signUpWithEmail(values.email, values.password);

    // If account creation succedded
    if (registerResult === true) {
      // TODO: Redirect or something
    }
    // If account creation failed
    if (registerResult !== true) {
      // Find user facing error message assosciated with error code
      const userFacingErrorMsg =
        FirebaseUserFacingErrorMessages[registerResult || ""];

      // Update error message
      setRegisterFailureMessage(
        userFacingErrorMsg
          ? userFacingErrorMsg
          : "Something went wrong, please try again later."
      );
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-2 w-[280px] sm:w-[320px]"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your email..."
                  type="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter a password..."
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  placeholder="Confirm your passsword..."
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="tracking-tighter translate-y-2">
          Register
        </Button>
        {registerFailureMessage && (
          <p className="p-2 text-center text-destructive">
            {registerFailureMessage}
          </p>
        )}
      </form>
    </Form>
  );
}

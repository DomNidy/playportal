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
import { FiEye } from "@react-icons/all-files/fi/FiEye";
import { FiEyeOff } from "@react-icons/all-files/fi/FiEyeOff";

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
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  // Submit handler (ran when the user tries to register with valid credentials)
  async function onSubmit(values: z.infer<typeof RegisterFormSchema>) {
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
                <div
                  className="group flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background 
                             file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50
                             focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 "
                >
                  <input
                    type={`${showPassword ? "text" : "password"}`}
                    className=" border-r-[1.3px]   ring-0 outline-none "
                    placeholder="Enter a password..."
                    {...field}
                  />
                  <div className="w-full h-full flex justify-center items-center space-x-2">
                    {showPassword ? (
                      <FiEye
                        className="cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    ) : (
                      <FiEyeOff
                        className="cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    )}
                  </div>
                </div>
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
                <div
                  className="group flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background 
                             file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50
                             focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 "
                >
                  <input
                    type={`${showConfirmPassword ? "text" : "password"}`}
                    className=" border-r-[1.3px]   ring-0 outline-none "
                    placeholder="Confirm your password..."
                    {...field}
                  />
                  <div className="w-full h-full flex justify-center items-center space-x-2">
                    {showConfirmPassword ? (
                      <FiEye
                        className="cursor-pointer"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      />
                    ) : (
                      <FiEyeOff
                        className="cursor-pointer"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      />
                    )}
                  </div>
                </div>
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

"use client";

import { useForm } from "react-hook-form";
import * as z from "zod";
import { LoginFormSchema } from "@/definitions/Schemas";
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
import { Dispatch, SetStateAction, useState } from "react";
import { loginWithEmail } from "@/lib/auth/GoogleAuthFlow";
import { FirebaseUserFacingErrorMessages } from "@/definitions/FirebaseInterfaces";
import { FiEye } from "@react-icons/all-files/fi/FiEye";
import { FiEyeOff } from "@react-icons/all-files/fi/FiEyeOff";

export default function LoginForm({
  setActiveTab,
}: {
  setActiveTab: Dispatch<SetStateAction<"register" | "login" | "forgot">>;
}) {
  // Message to display on a failed login attempt
  const [loginFailureMessage, setLoginFailureMessage] = useState<string>();

  // Main form used to log the user in
  const loginForm = useForm<z.infer<typeof LoginFormSchema>>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Submit handler (ran when the user tries to login with valid credentials)
  async function onSubmitLogin(values: z.infer<typeof LoginFormSchema>) {
    console.log(`Login Values: ${JSON.stringify(values)}`);

    // Attempt to log the user in
    const loginResult = await loginWithEmail(values.email, values.password);

    // If we successfully logged in
    if (loginResult === true) {
      // TODO: Redirect or something
    }
    // If our login attempt failed
    if (loginResult !== true) {
      // Find user facing error message assosciated with error code
      const userFacingErrorMsg =
        FirebaseUserFacingErrorMessages[loginResult || ""];

      // Update error message
      setLoginFailureMessage(
        userFacingErrorMsg
          ? userFacingErrorMsg
          : "Something went wrong, please try again later."
      );
    }

    console.log(`Login res: ${JSON.stringify(loginResult)}`);
  }

  return (
    <Form {...loginForm}>
      <form
        onSubmit={loginForm.handleSubmit(onSubmitLogin)}
        className="space-y-2 w-[280px] sm:w-[320px]"
      >
        <FormField
          control={loginForm.control}
          name="email"
          shouldUnregister={true}
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
          control={loginForm.control}
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
          control={loginForm.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex justify-between">
                  <div
                    className="flex gap-2 items-center"
                    onClick={() => {
                      loginForm.setValue(field.name, !field.value);
                    }}
                  >
                    <div
                      className="flex items-center  justify-center h-4 w-4 border-black dark:border-neutral-100 border-[1.75px] rounded-sm cursor-pointer "
                      {...field}
                    >
                      <div
                        className={`h-2 w-2 absolute rounded-lg bg-black dark:bg-neutral-100 ${
                          field.value ? "scale-100" : "scale-0"
                        }  transition-transform duration-75`}
                      ></div>
                    </div>
                    <p className="text-foreground text-[15px] tracking-tight cursor-default">
                      Remember me
                    </p>
                  </div>{" "}
                  <p
                    className="text-primary text-[15px]  tracking-tight cursor-pointer"
                    onClick={() => setActiveTab("forgot")}
                  >
                    Forgot Password?
                  </p>
                </div>
              </FormControl>
            </FormItem>
          )}
        ></FormField>

        <Button type="submit" className="tracking-tighter translate-y-2">
          Login
        </Button>
        {loginFailureMessage && (
          <p className="p-2 text-center text-destructive">
            {loginFailureMessage}
          </p>
        )}
      </form>
    </Form>
  );
}

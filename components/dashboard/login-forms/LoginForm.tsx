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

export default function LoginForm({
  setActiveTab,
}: {
  setActiveTab: Dispatch<SetStateAction<"register" | "login" | "forgot">>;
}) {
  // Main form used to log the user in
  const loginForm = useForm<z.infer<typeof LoginFormSchema>>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  // Submit handler (ran when the user tries to login with valid credentials)
  function onSubmitLogin(values: z.infer<typeof LoginFormSchema>) {
    // TODO: Start the login user code here
    console.log(`Values: ${JSON.stringify(values)}`);
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
                <Input placeholder="Enter your email..." {...field} />
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
                <Input placeholder="Enter a password..." {...field} />
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
                      className="flex items-center  justify-center h-4 w-4 border-black border-[1.75px] rounded-sm cursor-pointer "
                      {...field}
                    >
                      <div
                        className={`h-2 w-2 absolute rounded-lg bg-black ${
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
      </form>
    </Form>
  );
}

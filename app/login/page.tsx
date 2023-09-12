"use client";
import SignInWithGoogle from "@/components/SignInWithGoogle";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SignInWithEmail from "@/components/SignInWithEmail";
import { getFirebaseApp } from "@/lib/utility/GetFirebaseApp";
import RegisterForm from "@/components/dashboard/login-forms/RegisterForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginFormSchema } from "@/definitions/Schemas";
import LoginForm from "@/components/dashboard/login-forms/LoginForm";
import ForgotLoginForm from "@/components/dashboard/login-forms/ForgotLoginForm";

export default function LoginPage() {
  // State of the active tab
  const [openTab, setOpenTab] = useState<"register" | "login" | "forgot">(
    "register"
  );

  getFirebaseApp();
  // Next router
  const router = useRouter();

  // Add authstate changed callback
  useEffect(() => {
    const listener = onAuthStateChanged(getAuth(), (authState) => {
      // If the user is authenticated, redirect to the dashboard
      if (authState) {
        router.replace("/dashboard");
      }
    });

    return () => {
      listener();
    };
  });

  return (
    <div className="flex flex-col min-h-screen w-screen items-center">
      <Tabs defaultValue="register" className="w-auto" value={openTab}>
        <TabsList>
          <TabsTrigger value="register" onClick={() => setOpenTab("register")}>
            Register
          </TabsTrigger>
          <TabsTrigger value="login" onClick={() => setOpenTab("login")}>
            Login
          </TabsTrigger>
          <TabsTrigger value="forgot" onClick={() => setOpenTab("forgot")}>
            Forgot Password
          </TabsTrigger>
        </TabsList>
        <TabsContent value="register" className="flex justify-center">
          <RegisterForm />
        </TabsContent>
        <TabsContent value="login">
          <LoginForm setActiveTab={setOpenTab} />
        </TabsContent>
        <TabsContent value="forgot">
          <ForgotLoginForm />
        </TabsContent>
      </Tabs>

      <h1 className="text-gray-500 italic text-lg border-t-2  border-t-gray-300 w-full text-center mt-8 mb-3">
        or
      </h1>
      <div className="flex flex-col gap-4 items-center">
        <SignInWithGoogle
          photoURL={undefined}
          displayName={undefined}
          email={undefined}
        />
      </div>
    </div>
  );
}

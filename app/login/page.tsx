"use client";
import SignInWithGoogle from "@/components/SignInWithGoogle";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFirebaseApp } from "@/lib/utility/GetFirebaseApp";
import RegisterForm from "@/components/dashboard/login-forms/RegisterForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "@/components/dashboard/login-forms/LoginForm";
import ForgotLoginForm from "@/components/dashboard/login-forms/ForgotLoginForm";
import { ScaleLoader } from "react-spinners";
import { useTheme } from "next-themes";

export default function LoginPage() {
  getFirebaseApp();
  // State of the active tab
  const [openTab, setOpenTab] = useState<"register" | "login" | "forgot">(
    "register"
  );
  // If we are loading the auth state
  const [isLoading, setIsLoading] = useState(true);

  // Next router
  const router = useRouter();
  const theme = useTheme();

  // Add authstate changed callback
  useEffect(() => {
    const auth = getAuth();

    if (auth.currentUser) {
      router.replace("/dashboard");
      setIsLoading(false);
    } else {
      const listener = onAuthStateChanged(getAuth(), (authState) => {
        console.log("Added a listener");
        setIsLoading(false);
        // If the user is authenticated, redirect to the dashboard
        if (authState) {
          router.replace("/dashboard");
        }
      });

      return () => {
        listener();
      };
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <>
        {" "}
        <ScaleLoader
          color={`${theme.resolvedTheme == "dark" ? "white" : "#4A179B"}`}
          className="fixed w-screen min-h-screen translate-x-[47%] translate-y-1/3 sm:translate-y-[40%] "
        />
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-screen items-center">
      <h2 className="text-center text-4xl text-primary tracking-tight font-semibold p-12 sm:p-16">
        Playportal
      </h2>
      <Tabs
        defaultValue="register"
        className="flex flex-col items-center"
        value={openTab}
      >
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
        <TabsContent
          value="register"
          className="flex flex-col gap-2 items-center"
        >
          <RegisterForm />
          <h1 className="text-gray-500 italic text-lg dark:border-t-secondary border-t-gray-300 w-[200px] text-center mt-4 mb-3">
            or
          </h1>
          <SignInWithGoogle />
        </TabsContent>
        <TabsContent value="login" className="flex flex-col gap-2 items-center">
          <LoginForm setActiveTab={setOpenTab} />
          <h1 className="text-gray-500 italic text-lg dark:border-t-secondary border-t-gray-300 w-[200px] text-center mt-4 mb-3">
            or
          </h1>
          <SignInWithGoogle />
        </TabsContent>
        <TabsContent value="forgot">
          <ForgotLoginForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

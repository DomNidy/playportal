"use client";
import Image from "next/image";
import { loginWithGoogle } from "@/lib/auth/GoogleAuthFlow";

export default function SignInWithGoogle() {
  return (
    <div className="drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.4)]">
      <div
        className="flex bg-card border-border dark:bg-secondary hover:bg-card/90 transition-opacity duration-150 text-foreground rounded-xl p-2 items-center gap-2 w-fit h-fit  cursor-pointer  "
        onClick={async () => {
          const user = await loginWithGoogle();
          if (!user) {
            return;
          }
        }}
      >
        <Image
          alt={"Profile image"}
          src={
            "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
          }
          width={32}
          height={32}
          className="rounded-full"
        />

        <h2 className="font-semibold tracking-tight pointer-events-none">
          Sign in with Google
        </h2>
      </div>
    </div>
  );
}

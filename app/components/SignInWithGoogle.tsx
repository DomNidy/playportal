import Image from "next/image";
import { loginWithGoogle } from "../auth/GoogleAuthFlow";
import { Auth, User, getAuth } from "firebase/auth";
import { Dispatch, SetStateAction, useState } from "react";

export default function SignInWithGoogle({
  photoURL,
  displayName,
  email,
  updateUser,
}: {
  photoURL: string | undefined | null;
  displayName: string | undefined | null;
  email: string | undefined | null;
  updateUser: (newUser: User) => void;
}) {
  // Gets auth instance (firebase)
  const [auth, setAuth] = useState<Auth>(getAuth());
  return (
    <div className="drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.4)]">
      <div
        className="flex bg-neutral-200 rounded-3xl p-2 items-center gap-2 w-fit text-neutral-600 cursor-pointer hover:bg-neutral-100 hover:text-neutral-700 transition-all duration-75"
        onClick={async () => {
          const user = await loginWithGoogle();
          if (!user) {
            return;
          }
          updateUser(user);
        }}
      >
        <Image
          alt={"Profile image"}
          src={
            photoURL
              ? photoURL
              : "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
          }
          width={48}
          height={48}
          className="rounded-full"
        />


        <h2 className="font-bold pointer-events-none">
          {auth.currentUser ? `${auth.currentUser.displayName}` : "Sign in with Google"}
        </h2>
      </div>
    </div>
  );
}

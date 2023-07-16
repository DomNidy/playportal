import Image from "next/image";
import { loginGoogle } from "../auth/GoogleAuthFlow";
import { User } from "firebase/auth";
import { Dispatch, SetStateAction } from "react";

export default function SignedInWithGoogleCard({
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
  return (
    <div className="drop-shadow-lg">
      {displayName && photoURL && email ? (
        <div
          className="flex bg-neutral-200 rounded-3xl p-2 items-center gap-2 w-fit text-neutral-600 cursor-pointer hover:bg-neutral-100 hover:text-neutral-700 transition-all duration-75"
          onClick={async () => {
            const user = await loginGoogle();
            if (!user) {
              return;
            }
            updateUser(user);
          }}
        >
          <Image
            alt={"Profile image"}
            src={photoURL}
            width={48}
            height={48}
            className="rounded-full"
          />

          <h2 className="font-bold pointer-events-none">{displayName}</h2>
        </div>
      ) : (
        <div
          className=" bg-neutral-300 rounded-3xl p-2 text-center gap-2 w-24 text-neutral-500 cursor-pointer hover:bg-neutral-400 hover:text-neutral-200 transition-all duration-75"
          onClick={async () => {
            const user = await loginGoogle();
            if (!user) {
              return;
            }
            updateUser(user);
          }}
        >
          <h2 className="font-bold pointer-events-none ">Sign In</h2>
        </div>
      )}
    </div>
  );
}

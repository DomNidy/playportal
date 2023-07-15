"use client";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { initializeApp } from "firebase/app";

export default function Home() {
  async function signIn() {
    const app = initializeApp({
      apiKey: "AIzaSyAPczHoT5cJ1fxv4fk_fQjnRHaL8WXPX-o",
      authDomain: "multi-migrate.firebaseapp.com",
      projectId: "multi-migrate",
      storageBucket: "multi-migrate.appspot.com",
      messagingSenderId: "296730327999",
      appId: "1:296730327999:web:74c09b878bd58e8a28ff0a",
      measurementId: "G-V87LXV2M29",
    });
    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential!.accessToken;
        // The signed-in user info.
        const user = result.user;
        // IdP data available using getAdditionalUserInfo(result)
        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  }
  return (
    <div className="min-h-screen w-full bg-gray-900">
      <button className="p-2 bg-neutral-300 text-black " onClick={signIn}>
        Sign in
      </button>
    </div>
  );
}

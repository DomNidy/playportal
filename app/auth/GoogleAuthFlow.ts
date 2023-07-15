import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";

// Returns the user object if successful, otherwise returns undefined
export async function loginGoogle() {
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
  return signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential!.accessToken;
      // The signed-in user info.
      const user = result.user;
      return user;
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
      return undefined;
    });
}

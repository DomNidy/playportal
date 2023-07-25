import { initializeApp } from "firebase/app";
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailLink,
  signInWithPopup,
} from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";

export const firebase_options = {
  apiKey: "AIzaSyAPczHoT5cJ1fxv4fk_fQjnRHaL8WXPX-o",
  authDomain: "multi-migrate.firebaseapp.com",
  projectId: "multi-migrate",
  storageBucket: "multi-migrate.appspot.com",
  messagingSenderId: "296730327999",
  appId: "1:296730327999:web:74c09b878bd58e8a28ff0a",
  measurementId: "G-V87LXV2M29",
};
// Initialize Firebase
const app = initializeApp(firebase_options);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Writes a temp spotify token to database
async function setUserDocument(user: User) {
  const userData = user.toJSON();

  await setDoc(doc(db, "users", `${user.uid}`), {
    displayName: user.displayName,
    uid: user.uid,
    email: user.email,
    emailVerified: user.emailVerified,
    creationTime: user.metadata.creationTime,
    lastSignIn: user.metadata.lastSignInTime,
  });
}
// Returns the user object if successful, otherwise returns undefined
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const auth = getAuth();
  return signInWithPopup(auth, provider)
    .then(async (result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential!.accessToken;
      // The signed-in user info.
      const user = result.user;

      // Update user document on each sign in
      await setUserDocument(user);

      return user;
    })
    .catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;

      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      // ...
      return undefined;
    });
}

export async function loginWithEmail(email: string, password: string) {
  const provider = new EmailAuthProvider();
  const auth = getAuth();
  return createUserWithEmailAndPassword(auth, email, password).then((result) =>
    console.log(result)
  );
}

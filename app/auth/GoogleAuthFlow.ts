import { FirebaseError, initializeApp } from "firebase/app";
import {
  AuthError,
  AuthErrorCodes,
  EmailAuthProvider,
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
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
    displayName: user.displayName ? user.displayName : user.email,
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

export async function signUpWithEmail(
  email: string,
  password: string
): Promise<true | string | undefined> {
  const auth = getAuth();
  try {
    const createAccountResult = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    // The newly created user info
    const user = createAccountResult.user;
    // Update user document
    await setUserDocument(user);

    // Send user an email with a verification link
    await sendEmailVerification(user);
    return true;
  } catch (err) {
    if (err instanceof FirebaseError) {
      return err.code;
    } else {
      console.log(err);
    }
  }
  return undefined;
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<true | string | undefined> {
  const auth = getAuth();
  try {
    const loginAttempt = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    // The logged in user info
    const user = loginAttempt.user;
    // Update user document
    await setUserDocument(user);
    return true;
  } catch (err) {
    if (err instanceof FirebaseError) {
      return err.code;
    } else {
      console.log(err);
    }
  }
  return undefined;
}

// Sends a user an email to reset their password
export async function resetPassword(email: string) {
  const auth = getAuth();
  try {
    sendPasswordResetEmail(auth, email);
  } catch (err) {
    console.log(err);
  }
}

// Tests if the email is a valid format with regex
export function isEmailValidFormat(email?: string) {
  if (!email) {
    return undefined;
  }
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return true;
  }
  return false;
}
// Tests if the email is a valid format with multiple conditions
export function isPasswordValidFormat(
  passToTest: string,
  confirmPassword: string
): {
  issues: string[];
  valid: boolean;
} {
  const issues = [];

  if (!passToTest) {
    return { issues: ["Password is undefined"], valid: false };
  }

  // Password is less than 8 characters
  if (passToTest.length < 8) {
    issues.push(
      `Password must be at least 8 characters, current length ${passToTest.length}`
    );
  }

  // Password is longer than 128 characters
  if (passToTest.length > 128) {
    issues.push(
      `Password must be at most 128 characters, current length ${passToTest.length}`
    );
  }

  // Password does not have any capital letters
  if (!/[A-Z]/.test(passToTest)) {
    issues.push(`Password must contain at least 1 capital letter`);
  }

  // Password does not have any lowercase letters
  if (!/[a-z]/.test(passToTest)) {
    issues.push(`Password must contain at least 1 lowercase letter`);
  }

  // Password does not have any numbers
  if (!/[0-9]/.test(passToTest)) {
    issues.push(`Password must contain at least 1 number`);
  }

  if (passToTest !== confirmPassword) {
    issues.push(`Passwords must match`);
  }

  return { issues: issues, valid: issues.length == 0 };
}

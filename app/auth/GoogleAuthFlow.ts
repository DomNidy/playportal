import { FirebaseError, initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { GetBaseUrl } from "../utility/GetBaseUrl";
import { getFirebaseApp } from "../utility/GetFirebaseApp";

getFirebaseApp();

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore();

/**
 * Method to run when a user logs in. It updates the user document and signs the user in with a custom authorization token
 * We update the user document, then we create a NEW IdToken, then sign the user in with that custom one
 * TODO: Review this and make sure this 'sign in' flow is somewhat optimal
 * This authorization token is necessary to access the `UserPerms` of a user
 * @param {any} user: A `User` object
 * @returns {any}
 */

async function onLogin(user: User): Promise<void> {
  await setUserDocument(user);
  await signInWithCustomAuthorizationToken(user);
}

/**
 * Updates information about a user in our firebase users collection
 * @param {User} user The user who we want to update the document of
 * @returns {any}
 *
 * ### The following properties are updated
 * - displayName
 * - email
 * - emailVerified
 * - creationTime
 * - lastSignIn
 */
async function setUserDocument(user: User): Promise<void> {
  await setDoc(doc(db, "users", `${user.uid}`), {
    displayName: user.displayName ? user.displayName : user.email,
    uid: user.uid,
    email: user.email,
    emailVerified: user.emailVerified,
    creationTime: user.metadata.creationTime,
    lastSignIn: user.metadata.lastSignInTime,
  });
}

/**
 * Method which uses firebase api to create a sign in with google popup menu
 * Upon successful login the document pertaining to the user id will be updated in firebase
 * @returns {any} The user object upon successful login, or undefined if login fails
 */
export async function loginWithGoogle(): Promise<User | undefined> {
  const provider = new GoogleAuthProvider();
  const auth = getAuth();
  return signInWithPopup(auth, provider)
    .then(async (result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential!.accessToken;
      // The signed-in user info.
      const user = result.user;

      await onLogin(user);

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

// * SIGN THE USER IN WITH CUSTOM TOKEN (FOR AUTHORIZATION PERMS)
async function signInWithCustomAuthorizationToken(user: User) {
  const auth = getAuth();
  // Fetch custom token from server
  const customTokenRequest = await fetch(
    `${GetBaseUrl()}api/user/login?uid=${user.uid}`,
    {
      method: "POST",
      headers: {
        idtoken: await user.getIdToken(),
      },
    }
  );

  const customToken = await customTokenRequest.text();

  await signInWithCustomToken(auth, customToken);
}

/**
 * Attempt to register a using with email
 * @param {any} email Email to register the account with
 * @param {any} password Password which will be used by the user to login
 * @returns {any}
 * - If account creation succeded, returns `true`
 * - If account creation failed, returns a `string` containing the error
 * - If an unexpected error occured, returns `undefined`
 */
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

    await onLogin(user);

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

/**
 * Attempt to login a user via email using the provided credentials
 * @param {any} email Email to login with
 * @param {any} password Password to login with
 * @returns {any}
 * - If there login was successful, returns true,
 * - If login failed, an `string` containing the error code will be returned
 * - If there was an unexpected error, returns `undefined`
 */

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

    await onLogin(user);

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

/**
 * Send a user a password reset email using the firebase `sendPasswordResetEmail()` method
 * @param {any} email Email of user to send password reset email to
 * @returns {any} True if successfully sent, false if not
 *
 *  Note: The email will only be sent to the user if the `isEmailValidFormat()` method returns true on the passed email
 */
export async function sendUserPasswordReset(email: string): Promise<boolean> {
  const auth = getAuth();
  try {
    if (isEmailValidFormat(email)) {
      sendPasswordResetEmail(auth, email);
    }
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

/**
 * Runs a regex test to determine if the format of the email is valid
 * @param {any} email Email to test format of
 * @returns {boolean} True if valid format, false if invalid
 */
export function isEmailValidFormat(email?: string): true | false {
  if (!email) {
    return false;
  }
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return true;
  }
  return false;
}

/**
 * Tests if the password meets the necessary conditions in order to be valid
 * @param {any} passToTest The password we want to test
 * @param {any} confirmPassword The confirm password value (this password should match passToTest in order for the password to be considered a vaid format)
 * @returns {any}
 */

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

/**
 * Attempts to create a URL from which we can obtain user authorization from (for the youtube api)
 * @returns {any} A url if method was successful, undefined if a url was not returned from our api
 */
export async function requestYoutubeAuthorizationURL(): Promise<
  string | undefined
> {
  // We should be redirected with an authorization url from the api endpoint we are requesting, unless it fails
  const authUrlRequest = await fetch(`${GetBaseUrl()}api/user/youtube/token`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  // TODO: REDIRECT USER TO THIS TO CONTINUE WORKING ON AUTH FLOW FOR YOUTUBE DATA API
  // TODO: https://developers.google.com/youtube/v3/guides/auth/server-side-web-apps#node.js_1
  const { authorizationUrl } = await authUrlRequest.json();

  if (authorizationUrl) {
    return authorizationUrl;
  }
  return undefined;
}

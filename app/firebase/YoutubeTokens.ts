import { doc, getFirestore, setDoc } from "firebase/firestore";
import { YoutubeAccessToken } from "../interfaces/YoutubeInterfaces";
import { decryptYoutubeToken, encryptYoutubeToken } from "./TokenCryptography";
import { initializeApp } from "firebase/app";
/**
 * Writes a youtube access token to the YoutubeAccessTokens collection in firestore DB
 * @param {any} key The name of the document we will store the token in
 * @param {any} token The `YoutubeAccessToken` we will write to the database
 * @param {any} temp Whether or not this is a temporary token entry (A temporary token entry will have `temp-` prefixing its name)
 * We have temporary token entries because our auth flow has to write the token, with a random code as the key, then request the user for their uid,
 * after the user uid is requested, the user will send a request to an endpoint which will execute the `makeOwnerOfYoutubeToken()` method, this method will
 *  rename the document name to their uid; effectively granting ownership of the token to the uid.
 *
 */
const firebaseConfig = {
  apiKey: "AIzaSyAPczHoT5cJ1fxv4fk_fQjnRHaL8WXPX-o",
  authDomain: "multi-migrate.firebaseapp.com",
  projectId: "multi-migrate",
  storageBucket: "multi-migrate.appspot.com",
  messagingSenderId: "296730327999",
  appId: "1:296730327999:web:74c09b878bd58e8a28ff0a",
  measurementId: "G-V87LXV2M29",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export function writeYoutubeToken(
  key: string,
  token: YoutubeAccessToken,
  temp: boolean
): true | false | undefined {
  try {
    const encryptedToken = encryptYoutubeToken(token);

    if (encryptedToken) {
      setDoc(
        doc(db, "YoutubeAccessTokens", `${temp ? `temp-` : ``}${key}`),
        encryptedToken
      );
      console.log(`Wrote token to DB ${key}`);
      return true;
    } else {
      console.log(`Encrypted token is undefined ${encryptedToken}, uid=${key}`);
      return false;
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 * Tests if the passed token has the necessary properties of a valid `YoutubeAccessToken`
 * @param {YoutubeAccessToken} token Token to test validity of
 *
 *  ### The following properties are necessary for a `YoutubeAccessToken` to be deemed valid
 *  - `access_token`
 *  - `expiry_date`
 * - `scope`
 * - `token_type`
 * - `id_token`
 *
 * Additionally, the passed token must also satisfy `token instanceof Object`
 */
export function isValidYoutubeToken(token: YoutubeAccessToken): boolean {
  if (
    token instanceof Object &&
    "access_token" in token &&
    "scope" in token &&
    "id_token" in token &&
    "token_type" in token &&
    "expiry_date" in token
  ) {
    return true;
  }
  return false;
}

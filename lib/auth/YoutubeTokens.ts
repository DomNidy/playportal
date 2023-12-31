import {
  EncryptedYoutubeAccessToken,
  YoutubeAccessToken,
} from "@/definitions/YoutubeInterfaces";
import { decryptYoutubeToken, encryptYoutubeToken } from "./TokenCryptography";
import { FirestoreCollectionNames } from "@/definitions/Enums";
import { google } from "googleapis";
import { firestore } from "../firestore";

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
export function writeYoutubeToken(
  key: string,
  token: YoutubeAccessToken,
  temp: boolean
): true | false | undefined {
  try {
    const encryptedToken = encryptYoutubeToken(token);

    if (encryptedToken) {
      firestore
        .doc(
          `${FirestoreCollectionNames.YOUTUBE_ACCESS_TOKENS}/${
            temp ? `temp-` : ``
          }${key}`
        )
        .set(encryptedToken);

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
 * - `scope`
 *
 * Additionally, the passed token must also satisfy `token instanceof Object`
 */
export function isValidYoutubeToken(token: YoutubeAccessToken): boolean {
  if (token instanceof Object && "access_token" in token && "scope" in token) {
    return true;
  }
  return false;
}

/**
 * This method will return a valid, non-expired youtube token, or undefined if it fails
 * @param {string} uid The firebase UID of the user which we want to get the youtube token of
 * @returns {YoutubeAccessToken | undefined}  This method will return a non-expired youtube token, or undefined if it fails
 *
 * Note: Since we will not return an expired `YoutubeAccessToken` , we don't need to check if it is
 * expired with the `isSpotifyTokenExpired()` method.
 *
 * ### However we may still return undefined, so make sure to check if it is defined before using it.
 */
export async function getYoutubeToken(
  uid: string,
  returnEncrypted = false
): Promise<YoutubeAccessToken | EncryptedYoutubeAccessToken | undefined> {
  try {
    // Find the document containing the access token for the uid
    const tokenDoc = await firestore
      .doc(`${FirestoreCollectionNames.YOUTUBE_ACCESS_TOKENS}/${uid}`)
      .get();

    // Read document data
    const token = tokenDoc.data() as EncryptedYoutubeAccessToken;

    // If we could not retreive a token
    if (!token) {
      return undefined;
    }

    // We found an encrypted youtube access token, decrypt it
    const decryptedToken = decryptYoutubeToken(token) as YoutubeAccessToken;

    // If the decrypted token is not a valid spotify access token
    // If this condition is met, the user must re-authenticate with youtube
    if (isValidYoutubeToken(decryptedToken) == false) {
      throw new Error("Decrypted youtube access token is invalid");
    }

    // If our token exists and is expired
    if (isYoutubeTokenExpired(decryptedToken)) {
      console.log("Youtube token is expired, refreshing");

      // Refresh the token
      const newToken = await refreshYoutubeTokenAndWriteItToDB(
        decryptedToken,
        uid
      );

      // If returnEncrypted is true, return the encrypted newToken
      if (returnEncrypted) {
        return encryptYoutubeToken(newToken!);
      }

      // Return newly refreshed token
      return newToken as YoutubeAccessToken;
    }

    // If the token is still valid, return it

    // If returnEncrypted is true, return the encrypted token
    if (returnEncrypted) {
      return token;
    }

    return decryptedToken as YoutubeAccessToken;
  } catch (err) {
    console.log("Caught error in getYoutubeToken", err);
    return undefined;
  }
}

/**
 * If the youtube token is expired, returns true, if not, returns false
 * @param {YoutubeAccessToken} token A `YoutubeAccessToken` (an unecrypted one)
 * @returns {boolean} Returns true if the `token.expiry_date` property
 * is less than `Date.now()` , otherwise returns false
 */
function isYoutubeTokenExpired(token: YoutubeAccessToken): boolean {
  return token.expiry_date < Date.now();
}

/**
 * Requests a new token using the refresh token property of `YoutubeAccessToken`
 * @param {YoutubeAccessToken} token A `YoutubeAccessToken` with the `refresh_token` property
 * @param {string} uid Firebase UID of user we should assosciate this token with
 * @returns {Promise<YoutubeAccessToken | undefined>} A promise containing the newly refreshed `YoutubeAccessToken` or `undefined`
 *
 */
async function refreshYoutubeTokenAndWriteItToDB(
  token: YoutubeAccessToken,
  uid: string
): Promise<YoutubeAccessToken | undefined> {
  try {
    // Create oauth2client for managing token
    const oauth2Client = new google.auth.OAuth2({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_CLIENT_REDIRECT_URI,
    });

    // Give the client the token so it knows which token to refresh
    oauth2Client.setCredentials(token);

    // Tell the client to refresh the token
    const refreshRequest = await oauth2Client.refreshAccessToken();

    // The newly refreshed token received
    const newToken = refreshRequest.credentials as YoutubeAccessToken;

    // If we were able to refresh the token
    if (newToken) {
      console.log(
        "Refreshed the token, new TOKEN:",
        `${JSON.stringify(newToken)}`
      );

      // Write the new token to database
      writeYoutubeToken(uid, newToken, false);

      return newToken;
    }

    if (!newToken) {
      // If we could not refresh the token
      return undefined;
    }
  } catch (err) {
    console.log(err);
  }
}

import {
  EncryptedSpotifyAccessToken,
  SpotifyAccessToken,
} from "@/definitions/SpotifyInterfaces";
import { encryptSpotifyToken, decryptSpotifyToken } from "./TokenCryptography";
import { FirestoreCollectionNames } from "@/definitions/Enums";
import { getFirebaseAdminApp } from "./Utility";

const adminApp = getFirebaseAdminApp();

// Writes a temp spotify token to database
export async function writeSpotifyToken(
  key: string,
  token: SpotifyAccessToken,
  temp: boolean
) {
  const encryptedToken = encryptSpotifyToken(token);

  if (encryptedToken) {
    await adminApp
      .firestore()
      .doc(
        `${FirestoreCollectionNames.SPOTIFY_ACCESS_TOKENS}/${
          temp ? `temp-` : ``
        }${key}`
      )
      .set(encryptedToken);

    console.log(`Wrote token to DB ${key}`);
  } else {
    console.log(`Encrypted token is undefined ${encryptedToken}, uid=${key}`);
  }
}

/**
 * This method will return a valid, non-expired spotify token, or undefined if it fails
 * @param {string} uid The firebase UID of the user which we want to get the spotify token of
 * @param {boolean} returnEncrypted If this is set to true, we will return the encrypted spotify token (after we verified it is valid)
 * @returns {SpotifyAccessToken | undefined}  This method will return a non-expired spotify token, or undefined if it fails
 *
 * Note: Since we will not return an expired `SpotifyAccessToken` , we don't need to check if it is
 * expired with the `isSpotifyTokenExpired()` method.
 *
 * ### However we may still return undefined, so make sure to check if it is defined before using it.
 */
export async function getSpotifyToken(
  uid: string,
  returnEncrypted = false
): Promise<SpotifyAccessToken | EncryptedSpotifyAccessToken | undefined> {
  try {
    // Find the document containing the access token for the uid
    const tokenDoc = await adminApp
      .firestore()
      .doc(`${FirestoreCollectionNames.SPOTIFY_ACCESS_TOKENS}/${uid}`)
      .get();

    // Read document data
    const token = tokenDoc.data() as EncryptedSpotifyAccessToken;

    // If we could not retreive a token
    if (!token) {
      return undefined;
    }

    // We found an encrypted spotify access token, decrypt it
    const decryptedToken = decryptSpotifyToken(token) as SpotifyAccessToken;

    // If the decrypted token is not a valid spotify access token
    // If this condition is met, the user must re-authenticate with spotify
    if (isValidSpotifyToken(decryptedToken) == false) {
      return undefined;
    }

    // If our token exists and is expired
    if (isSpotifyTokenExpired(decryptedToken)) {
      // Refresh the token
      const newToken = await refreshSpotifyTokenAndWriteItToDB(
        decryptedToken,
        uid
      );

      // If returnEncrypted is true, return the encrypted newToken
      if (returnEncrypted) {
        return encryptSpotifyToken(newToken!);
      }

      // Return newly refreshed token
      return newToken as SpotifyAccessToken;
    }

    // If the token is still valid, return it

    // If returnEncrypted is true, return the encrypted token
    if (returnEncrypted) {
      return token;
    }

    return decryptedToken as SpotifyAccessToken;
  } catch (err) {
    console.log("Caught error in getSpotifyToken", err);
    return undefined;
  }
}

/**
 * If the spotify token is expired, returns true, if not, returns false
 * @param {SpotifyAccessToken} token A `SpotifyAccessToken` (an unecrypted one)
 * @returns {boolean} Returns true if the `token.expires_in` property
 * is less than `Date.now()` , otherwise returns false
 */
function isSpotifyTokenExpired(token: SpotifyAccessToken): boolean {
  return token.expires_in < Date.now();
}

// If the function has the requried properties
/**
 * Tests if the passed token has the necessary properties of a valid `SpotifyAccessToken`
 * @param {SpotifyAccessToken} token Token to test validity of
 *
 *  ### The following properties are necessary for a `SpotifyAccessToken` to be deemed valid
 *  - `access_token`
 *  - `expires_in`
 * - `scope`
 * - `token_type`
 *
 * Additionally, the passed token must also satisfy `token instanceof Object`
 */
export function isValidSpotifyToken(token: SpotifyAccessToken): boolean {
  if (
    token instanceof Object &&
    "access_token" in token &&
    "expires_in" in token &&
    "scope" in token &&
    "token_type" in token
  ) {
    return true;
  }
  return false;
}

//
/**
 * Requests a new token using the refresh token property of SpotifyAccessToken
 * @param {SpotifyAccessToken} token A valid `SpotifyAccessToken` with the `refresh_token` property
 * @param {string} uid Firebase UID of user we should assosciate this token with
 * @returns {Promise<SpotifyAccessToken | undefined>} A promise containing the newly refreshed `SpotifyAccessToken` or `undefined`
 *
 *  # Control flow:
 * - Requests a new access token from the spotify api
 * - If the request result was successful, convert the response into json
 * - If the newly refreshed spotify token does not contain a `refresh_token` property, add the `refresh_token` of the old access token to it.
 * *(we do this because the Spotify api sometimes 'resets' refresh_tokens and will return a new refresh token occasionally)*
 *
 * Note: The `isValidSpotifyToken()` method does not check if the token has the `refresh_token` property
 */
async function refreshSpotifyTokenAndWriteItToDB(
  token: SpotifyAccessToken,
  uid: string
): Promise<SpotifyAccessToken | undefined> {
  try {
    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", token.refresh_token);

    const tokenResult = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      body: params,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(
            process.env.SPOTIFY_CLIENT_ID +
              ":" +
              process.env.SPOTIFY_CLIENT_SECRET
          ).toString("base64"),
      },
    });

    // If the request was successful
    if (tokenResult.ok) {
      // Convert response to json
      const newToken = await tokenResult.json();

      // Check if this new token did not return a new refresh token
      // If it did not return a new refresh token, set the refresh_token prop to the old tokens refresh_token prop
      if (!newToken.refresh_token) {
        newToken.refresh_token = token.refresh_token;
      }

      // The spotify accesss token expires_in parameter is written in seconds
      // Here we are converting it to miliseconds, then we are adding the current time in ms to it
      // With this we can simply check if(accessToken.expires_in < Date.now()) to see if our token is expired
      newToken.expires_in = newToken?.expires_in * 1000 + Date.now();

      // Write token to database
      await writeSpotifyToken(uid, newToken, false);

      return newToken;
    }
    return undefined;
  } catch (err) {
    console.log(err);
  }
}

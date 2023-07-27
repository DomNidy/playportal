import { auth } from "firebase-admin";

/**
 * Given an id token (as a string) decode it, then check if the proprties are valid
 * @param id_token The id token (JWT) to verify user of
 * @param uid The uid we should check for in the id token
 * @returns {any} A Promise of true if it is valid, a promise of false if it does not mathc
 */
export async function IdTokenIsValid(
  id_token: string,
  uid: string
): Promise<true | false> {
  try {
    // Decode the token
    const decodedToken = await auth().verifyIdToken(id_token);

    if (decodedToken.uid === uid) {
      return true;
    }
    return false;
  } catch (err) {
    console.error(err);
    return false;
  }
}

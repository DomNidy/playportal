import { auth } from "firebase-admin";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { getFirebaseAdminApp } from "./Utility";
import { UserPermissionError, UserPerms } from "../definitions/UserInterfaces";
/**
 * Given an id token (as a string) decode it, then check if the proprties are valid
 * @param id_token The id token (JWT) to verify user of
 * @param uid The uid we should check for in the id token
 * @param perms `UserPerms` a user must in order to be considered valid
 * @returns {any} A Promise of `true` if it is valid, A promise of `UserPermissionError` if the user does not have the required perms,
 * or a promise of false if an error occured
 */
export async function IdTokenIsValid(
  id_token: string,
  uid: string,
  requiredPerms?: UserPerms
): Promise<true | false | UserPermissionError> {
  try {
    getFirebaseAdminApp();

    // Decode the token
    const decodedToken = await auth().verifyIdToken(id_token);

    // Return false if the token uid and uid of requester does not match
    if (decodedToken.uid !== uid) {
      return false;
    }

    // Check if the user has the required permissions in their token claims
    if (requiredPerms) {
      const hasPerms = await tokenHasPerms(decodedToken, requiredPerms);

      // If we hasPerms is not true, return the error from tokenHasPerms
      if (hasPerms !== true) {
        return hasPerms;
      }
    }

    // Return true if all prior validity checks pass
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

/**
 * Retreieves the perms from firebase, then creates a custom token with those perms
 * @param {any} uid The uid we are creating the token for
 * @param {any} perms The permissions to include in the tokens claims
 * @returns {any}
 */
export async function createAuthorizationTokenForUser(
  uid: string,
  perms?: UserPerms
): Promise<string | undefined> {
  getFirebaseAdminApp();

  // Create a custom token
  const token = await auth()
    .createCustomToken(uid, {
      perms: perms,
    })
    .then((customToken) => customToken)
    .catch((error) => {
      console.log(`Error creating custom token: ${error}`);
      return undefined;
    });
  return token;
}

/**
 * Given a `DecodedIdToken` , parses the `UserPerms` from it and returns it
 * @param {any} id_token The `DecodedIdToken` to get perms from
 * @returns {any} A `UserPerms` object or `undefined` if the provided id token did not have a perms property
 */
async function getUserPermsFromDecodedIdToken(
  id_token: DecodedIdToken
): Promise<UserPerms | undefined> {
  const perms: UserPerms = JSON.parse(JSON.stringify(id_token?.perms));

  if (perms) {
    return perms;
  }
  console.log(`ID token from ${id_token.uid} does not have a perms property!`);
  return undefined;
}

/**
 * Checks if the provided `id_token` has the necessary `UserPerms`
 * @param {any} id_token a `DecodedIdToken`
 * @param {any} required_perms a `UserPerms` object
 * @returns {any} `true` or a `UserPermissionError` object
 */
async function tokenHasPerms(
  id_token: DecodedIdToken,
  required_perms: UserPerms
): Promise<true | UserPermissionError> {
  const ourPerms = await getUserPermsFromDecodedIdToken(id_token);

  if (!ourPerms) {
    return {
      errorMessage: "You do not have permission to perform this action",
      permissionLacked: undefined,
    };
  }

  // If the permissions do not match, return an error message
  for (var property in required_perms) {
    if (ourPerms[property] !== required_perms[property]) {
      return {
        errorMessage: "You do not have permission to perform this action",
        permissionLacked: property,
      };
    }
  }

  return true;
}

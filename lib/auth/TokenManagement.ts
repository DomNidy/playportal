import { FirestoreCollectionNames } from "@/definitions/Enums";
import { firestore } from "../firestore";

/**
 * We sometimes write 'temporary' tokens to our database (tokens prefixed with the string `temp-`), this method removes the `temp-` prefix
 * and replaces the rest of the document name (temp documents typically have a random string of characters) with the users uid
 * The resulting document name is simply the users UID who owns it. When we query the database for a token, we search for documents named
 * with their UID
 * @param {string} uid The UID of the person we will make own the document (we rename the document to this UID)
 * @param {string} state The temp key we used to write the document can be a random string, or state returned from an oauth flow
 * @param {string} collection The name of the collection we want to search for the temp document in
 * @returns {any} True if successful, undefined if it fails
 */
export async function makeOwnerOfAccessToken(
  uid: string,
  state: string,
  collection: FirestoreCollectionNames | string
): Promise<true | undefined> {
  try {
    const oldDoc = await firestore.doc(`${collection}/temp-${state}`).get();

    const oldDocData = oldDoc.data();

    if (oldDocData) {
      // Create a new doc with the id being the UID of the user who owns the access token
      // The data in this doc is the same as the old one
      await firestore.doc(`${collection}/${uid}`).set(oldDocData);
    }

    // Delete the oldDoc because it was temporary and we made a new one
    await firestore.doc(`${collection}/temp-${state}`).delete();
    return true;
  } catch (err) {
    console.log("Error occured setting owner", err);
    return undefined;
  }
}

/**
 * Deletes an access token from the database
 *
 * ### Note: THIS DOES NOT REVOKE THE ACCESS TOKEN, THIS METHOD SHOULD ONLY BE CALLED AFTER IT HAS BEEN REVOKED FROM THE PROVIDER FIRST
 * @param {any} uid UID Of the user which we will delete the access token of (also the document name of the access token)
 * @param {any} collection The acccess token we actually will revoke (this just the name of a collection)
 * @returns {any} `Promise<true>` on success, Throws an error on failure
 */
export async function deleteAccessTokenFromDatabase(
  uid: string,
  collection: FirestoreCollectionNames | string
): Promise<true | undefined> {
  try {
    const docToDelete = await firestore.doc(`${collection}/${uid}`).delete();

    console.log(`Deleted access token in document ${collection}/${uid}`);
    return true;
  } catch (err) {
    throw new Error(
      `Failed to delete access token from database path=${collection}/${uid}`
    );
  }
}

import { initializeApp } from "firebase/app";
import {
  getDoc,
  doc,
  setDoc,
  deleteDoc,
  getFirestore,
} from "firebase/firestore";
import { FirestoreCollectionNames } from "../interfaces/Enums";
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
    const oldDoc = await getDoc(doc(db, collection, `temp-${state}`));

    if (oldDoc.exists()) {
      // Create a new doc with the id being the UID of the user who owns the access token
      // The data in this doc is the same as the old one
      await setDoc(doc(db, collection, uid), oldDoc.data());
    }

    // Delete the oldDoc because it was temporary and we made a new one
    await deleteDoc(doc(db, collection, `temp-${state}`));
    return true;
  } catch (err) {
    console.log("Error occured setting owner", err);
    return undefined;
  }
}

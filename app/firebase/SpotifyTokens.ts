import { initializeApp } from "firebase/app";
import {
  collection,
  deleteDoc,
  getDoc,
  getFirestore,
} from "firebase/firestore";
import { doc, setDoc } from "firebase/firestore";

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

// Writes a temp spotify token to database
export async function writeSpotifyToken(key: string, token: any) {
  await setDoc(doc(db, "SpotifyAccessTokens", `temp-${key}`), token);
}

// Makes a new document in firestore (creates a new document with the id of the document being the uid, the state is used to retrieve the temp document)
export async function makeOwnerOfSpotifyToken(uid: string, state: any) {
  try {
    const oldDoc = await getDoc(
      doc(db, "SpotifyAccessTokens", `temp-${state}`)
    );

    if (oldDoc.exists()) {
      // Create a new doc with the id being the UID of the user who owns the access token
      // The data in this doc is the same as the old one
      await setDoc(doc(db, "SpotifyAccessTokens", uid), oldDoc.data());
    }

    // Delete the oldDoc because it was temporary and we made a new one
    await deleteDoc(doc(db, "SpotifyAccessTokens", `temp-${state}`));
    return true;
  } catch (err) {
    console.log("Error occured setting owner", err);
    return false;
  }
}

// Tries to find the document cooresponding the UID
export async function getSpotifyToken(uid: string, state: any) {
  try {
    const tokenDoc = await getDoc(doc(db, "SpotifyAccessTokens", uid));

    return tokenDoc.data();
  } catch (err) {
    console.log(err);
  }
}

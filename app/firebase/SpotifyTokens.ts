import { initializeApp } from "firebase/app";
import { deleteDoc, getDoc, getFirestore } from "firebase/firestore";
import { doc, setDoc } from "firebase/firestore";
import {
  EncryptedSpotifyAccessToken,
  SpotifyAccessToken,
} from "../interfaces/SpotifyInterfaces";
import { NextResponse } from "next/server";
import { randomBytes, createCipheriv, createDecipheriv } from "crypto";
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
export async function writeSpotifyToken(
  key: string,
  token: SpotifyAccessToken,
  temp: boolean
) {
  const encryptedToken = encryptSpotifyToken(token);

  if (encryptedToken) {
    await setDoc(
      doc(db, "SpotifyAccessTokens", `${temp ? `temp-` : ``}${key}`),
      encryptedToken
    );
    console.log(`Wrote token to DB ${key}`);
  } else {
    console.log(`Encrypted token is undefined ${encryptedToken}, uid=${key}`);
  }
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
export async function getSpotifyToken(
  uid: string
): Promise<SpotifyAccessToken | undefined> {
  try {
    // Find the document containing the access token for the uid
    const tokenDoc = await getDoc(doc(db, "SpotifyAccessTokens", uid));
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
      // Return newly refreshed token
      return newToken as SpotifyAccessToken;
    }

    // If the token is still valid, return it
    return decryptedToken as SpotifyAccessToken;
  } catch (err) {
    console.log("Caught error in getSpotifyToken", err);
    return undefined;
  }
}

// If the current time exceeds the expiry time, the token is expired (return true), otherwise it is not (return false)
function isSpotifyTokenExpired(token: SpotifyAccessToken): boolean {
  return token.expires_in < Date.now();
}

// If the function has the requried properties
function isValidSpotifyToken(token: SpotifyAccessToken): boolean {
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

// Requests a new token using the refresh token property of SpotifyAccessToken
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

      // Write token to database
      await writeSpotifyToken(uid, newToken, false);

      return newToken;
    }
    return undefined;
  } catch (err) {
    console.log(err);
  }
}

function encryptSpotifyToken(
  token: SpotifyAccessToken
): { iv: any; encrypted: any } | undefined {
  const tokenString = JSON.stringify(token);
  const iv = randomBytes(16);

  if (process.env.ENCRYPT_KEY) {
    const cipher = createCipheriv(
      "aes-256-cbc",
      Buffer.from(process.env.ENCRYPT_KEY),
      iv
    );

    let encrypted = cipher.update(tokenString);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return {
      iv: iv.toString("hex"),
      encrypted: encrypted.toString("hex"),
    };
  }
  console.log("Could not encrypt access token, ENCRYPT_KEY is undefined");
  return undefined;
}

function decryptSpotifyToken(token: {
  iv: string;
  encrypted: string;
}): SpotifyAccessToken | undefined | any {
  let iv = Buffer.from(token.iv, "hex");
  let encryptedText = Buffer.from(token.encrypted, "hex");

  if (process.env.ENCRYPT_KEY) {
    const decipher = createDecipheriv(
      "aes-256-cbc",
      Buffer.from(process.env.ENCRYPT_KEY),
      iv
    );

    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    const decryptedToken = JSON.parse(decrypted.toString("utf-8"));

    if (isValidSpotifyToken(decryptedToken)) {
      return decryptedToken;
    }

    console.error("Decrypted token was invalid", decryptedToken);
    return undefined;
  }
  return undefined;
}

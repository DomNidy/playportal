import {
  IdTokenIsValid,
  createAuthorizationTokenForUser,
} from "@/lib/auth/Authorization";
import { firestore } from "@/lib/firestore";
import { Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  const id_token = req.headers.get("idtoken") as string;
  const uid = req.nextUrl.searchParams.get("uid");

  // read request body
  const {
    displayName,
    email,
    emailVerified,
    metadata,
  }: {
    displayName: string;
    email: string;
    emailVerified: boolean;
    metadata: { createdAt: string; lastLoginAt: string };
  } = await req.json();

  // If no uid was provided
  if (!uid) {
    return new NextResponse("Request needs a UID", {
      status: 400,
    });
  }

  // Validiting id token
  if (!(await IdTokenIsValid(id_token, uid))) {
    return new NextResponse(
      JSON.stringify({
        error: "Invalid session, please login again.",
      }),
      {
        status: 400,
      }
    );
  }

  const userDoc = await firestore.doc(`users/${uid}`).get();

  if (userDoc.exists) {
    await firestore.doc(`users/${uid}`).update({
      displayName: displayName ? displayName : email,
      uid: uid,
      email: email,
      emailVerified: emailVerified,
      creationTime: Timestamp.fromMillis(Number(metadata.createdAt)),
      lastSignIn: Timestamp.fromMillis(Number(metadata.lastLoginAt)),
    });
  } else {
    // If the user does not have a document assosciated with the UID, create one
    firestore.doc(`users/${uid}`).create({
      displayName: displayName ? displayName : email,
      uid: uid,
      email: email,
      emailVerified: emailVerified,
      creationTime: Timestamp.fromMillis(Number(metadata.createdAt)),
      lastSignIn: Timestamp.fromMillis(Number(metadata.lastLoginAt)),
    });
  }

  // * THIS IS WHERE USER PERMS ARE SET
  const customToken = await createAuthorizationTokenForUser(uid);

  return new NextResponse(customToken, {
    status: 200,
  });
}

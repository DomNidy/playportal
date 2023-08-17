import {
  IdTokenIsValid,
  createAuthorizationTokenForUser,
} from "@/lib/auth/Authorization";
import { getFirebaseAdminApp } from "@/lib/auth/Utility";
import { Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

const adminApp = getFirebaseAdminApp();

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

  console.log(displayName, email, emailVerified, metadata);

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

  await adminApp
    .firestore()
    .doc(`users/${uid}`)
    .update({
      displayName: displayName ? displayName : email,
      uid: uid,
      email: email,
      emailVerified: emailVerified,
      creationTime: Timestamp.fromMillis(Number(metadata.createdAt)),
      lastSignIn: Timestamp.fromMillis(Number(metadata.lastLoginAt)),
    });

  // * THIS IS WHERE USER PERMS ARE SET
  const customToken = await createAuthorizationTokenForUser(uid);

  return new NextResponse(customToken, {
    status: 200,
  });
}

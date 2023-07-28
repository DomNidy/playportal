import { NextRequest, NextResponse } from "next/server";
import { getSpotifyToken } from "@/app/firebase/SpotifyTokens";
import { auth, credential, initializeApp } from "firebase-admin";
import { IdTokenIsValid } from "@/app/firebase/Authorization";
import { ServiceAccount, applicationDefault, getApp } from "firebase-admin/app";
import * as admin from "firebase-admin";

admin.initializeApp({
  credential: credential.cert({
    type: process.env.FIREBASE_SERVICE_ACCOUNT_TYPE,
    project_id: process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID,
    private_key_id: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY,
    client_email: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_ID,
    auth_uri: process.env.FIREBASE_SERVICE_ACCOUNT_AUTH_URI,
    token_uri: process.env.FIREBASE_SERVICE_ACCOUNT_TOKEN_URI,
    auth_provider_x509_cert_url:
      process.env.FIREBASE_SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url:
      process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FIREBASE_SERVICE_ACCOUNT_UNIVERSE_DOMAIN,
  } as ServiceAccount),
  databaseURL: "https://multi-migrate-default-rtdb.firebaseio.com",
});

export async function POST(req: NextRequest, res: NextResponse) {
  const id_token = req.headers.get("idtoken") as string;
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid")!;

  const limit = searchParams.get("limit") ? searchParams.get("limit") : 20;
  const offset = searchParams.get("offset") ? searchParams.get("offset") : 0;

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

  const token = await getSpotifyToken(uid);

  // If we could not retreive a token, return
  if (!token) {
    return new NextResponse(
      JSON.stringify({
        error:
          "Please authenticate your spotify account, your UID does not have a spotify access token!",
      }),
      {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  console.log(token);
  // If our token exists
  if (
    token instanceof Object &&
    "access_token" in token &&
    "expires_in" in token
  ) {
    const result = await fetch(
      `https://api.spotify.com/v1/me/playlists?offset=${offset}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      }
    );

    // Request for playlists was successful
    if (result.ok) {
      // Parse json from the response
      const playlistResponseJSON = await result.json();
      return new NextResponse(JSON.stringify(playlistResponseJSON), {
        headers: {
          "Content-Type": "application/json",
        },
        status: 200,
      });
    }
    // Request for playlists was not successful
    else {
      // Parse text from the response
      const playlistResponseText = await result.text();
      return new NextResponse(JSON.stringify({ error: playlistResponseText }), {
        headers: {
          "Content-Type": "application/json",
        },
        status: result.status,
      });
    }
  }

  return new NextResponse(
    JSON.stringify({
      error:
        "Something went wrong while trying to retreieve your playlists. Please try re-authenticating with spotify.",
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
      status: 500,
    }
  );
}

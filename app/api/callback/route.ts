import { NextRequest, NextResponse } from "next/server";

import { writeSpotifyToken } from "@/app/firebase/WriteSpotifyToken";

import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";

export async function GET(req: NextRequest, res: NextResponse) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");

  const buffer = Buffer.from(
    `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
  ).toString("base64");

  // Request access token
  const authOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + buffer,
    },
    body: new URLSearchParams({
      code: code!,
      redirect_uri: "http://localhost:3000/api/callback",
      grant_type: "authorization_code",
    }),
  };

  const response = await fetch(
    "https://accounts.spotify.com/api/token",
    authOptions
  );

  if (response.ok) {
    // Our access token
    const accessToken = await response.json();

    // FLOW FOR COMMITING SPOTIFY ACCESS TOKEN TO DATABASE

    // 1. Generate a random string that will be used as a temporary key to store the access token with in firebase
    // We will also send this key in the params to the user
    const tempKey = "tempKey_" + randomUUID();

    // 2. Write the tempKey and access token to database
    writeSpotifyToken(tempKey, accessToken);
    
    console.log(`Got access token for a user ${JSON.stringify(accessToken)}`);

    const params = new URLSearchParams();
    params.append("tempKey", tempKey);
    return NextResponse.redirect("http://localhost:3000?" + params, {
      status: 307,
    });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { Buffer } from "node:buffer";

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

  const data = await response.json();

  console.log(`Got access token for a user ${JSON.stringify(data)}`);
  return new NextResponse(JSON.stringify(data), {
    status: 307,
    headers: {
      Location: "http://localhost:3000",
    },
  });
}

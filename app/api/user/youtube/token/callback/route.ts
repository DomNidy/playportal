import { NextRequest, NextResponse } from "next/server";
import { Buffer } from "node:buffer";
import { GetBaseUrl } from "@/app/utility/GetBaseUrl";
import { google } from "googleapis";
import { URLSearchParams } from "node:url";
import { oauth2 } from "googleapis/build/src/apis/oauth2";
import { writeYoutubeToken } from "@/app/firebase/YoutubeTokens";
import { YoutubeAccessToken } from "@/app/interfaces/YoutubeInterfaces";
import {
  decryptSpotifyToken,
  decryptYoutubeToken,
  encryptYoutubeToken,
} from "@/app/firebase/TokenCryptography";
import { NextApiRequest } from "next";
import { randomUUID } from "node:crypto";

// TODO: https://developers.google.com/youtube/v3/guides/auth/server-side-web-apps#node.js_1
export async function GET(req: NextRequest, res: NextResponse) {
  const oauth2Client = new google.auth.OAuth2({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_CLIENT_REDIRECT_URI,
  });

  // Read url for params
  const code = req.nextUrl.searchParams.get("code");
  const scope = req.nextUrl.searchParams.get("scope");
  const authuser = req.nextUrl.searchParams.get("authuser");
  const prompt = req.nextUrl.searchParams.get("prompt");

  // Get access and refresh tokens (if the code exists in url params)
  if (code) {
    const { tokens } = await oauth2Client.getToken(code);
    console.log(tokens);
    oauth2Client.setCredentials(tokens);

    const tempKey = randomUUID();

    const writeTokenResult = writeYoutubeToken(
      tempKey,
      tokens as YoutubeAccessToken,
      false
    );

    const params = new URLSearchParams();
    params.append("tk", tempKey);

    // TODO: Redirect with tempkey and implement the makeOwnerOfYoutubeToken() logic
    // TODO: This logic should do the same thing as the makeOwnerOfSpotifyToken()
    return NextResponse.redirect(`${GetBaseUrl()}dashboard?` + params, {
      status: 307,
    });
  }
}
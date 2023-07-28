import { NextRequest, NextResponse } from "next/server";
import { GetBaseUrl } from "@/app/utility/GetBaseUrl";
import { google } from "googleapis";
import { URLSearchParams } from "node:url";
import { writeYoutubeToken } from "@/app/firebase/YoutubeTokens";
import { YoutubeAccessToken } from "@/app/interfaces/YoutubeInterfaces";
import { randomUUID } from "node:crypto";
import { URLParamNames } from "@/app/utility/Enums";

export const dynamic = "force-dynamic";

// TODO: https://developers.google.com/youtube/v3/guides/auth/server-side-web-apps#node.js_1
export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const oauth2Client = new google.auth.OAuth2({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_CLIENT_REDIRECT_URI,
    });

    // Read url for params
    const code = req.nextUrl.searchParams.get("code");

    // If no code was received, direct the user to the errors page
    if (!code) {
      console.error(
        "Could not complete youtube authentication process, no code was received in url params from the callback"
      );

      // This error message will be passed as a url param
      const errorMessage = JSON.stringify({
        error: `Failed to authenticate with youtube, please try again.`,
      });

      return NextResponse.redirect(
        `${GetBaseUrl()}/dashboard/error?error-message=${encodeURIComponent(
          errorMessage
        )}`,
        { status: 307 }
      );
    }

    // If the code exists in url params, get access and refresh tokens
    if (code) {
      // Get access and refresh tokens
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // The tempkey to write the document name with
      const tempKey = randomUUID();

      // Write the token to the database
      writeYoutubeToken(tempKey, tokens as YoutubeAccessToken, true);

      const params = new URLSearchParams();
      params.append(URLParamNames.YOUTUBE_TEMP_KEY_PARAM, tempKey);

      // TODO: Redirect with tempkey and implement the makeOwnerOfYoutubeToken() logic
      // TODO: This logic should do the same thing as the makeOwnerOfSpotifyToken()
      return NextResponse.redirect(`${GetBaseUrl()}dashboard?` + params, {
        status: 307,
      });
    }
  } catch (err) {
    console.error(`Error in youtube token callback: ${err}`);
    const errorMessage = JSON.stringify({
      error:
        "Something went wrong while authenticating with youtube, please try again.",
    });

    // Redirect user to error page with error message
    return NextResponse.redirect(
      `${GetBaseUrl()}/dashboard/error?error-message=${encodeURIComponent(
        errorMessage
      )}`,
      { status: 307 }
    );
  }
}

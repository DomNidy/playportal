import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

// TODO: https://developers.google.com/youtube/v3/guides/auth/server-side-web-apps#node.js_1
export async function GET(req: NextRequest, res: NextResponse) {
  try {
    // Create the oauth client
    const oauth2Client = new google.auth.OAuth2({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_CLIENT_REDIRECT_URI,
    });

    // Access scopes for youtube playlists
    const scopes = ["https://www.googleapis.com/auth/youtube"];

    // Generate a url that asks for the permissions defined in the scope
    const authorizationUrl = oauth2Client.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: "offline",
      /** Pass in the scopes array defined above.
       * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
      scope: scopes,
      // Enable incremental authorization. Recommended as a best practice.
      include_granted_scopes: true,
    });

    // Return url to user in json
    return new NextResponse(JSON.stringify({ authorizationUrl }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.log(
      `An error occured while trying to create an authorization url for YouTube api scope permission\nError: ${err}`
    );

    // Send a response incase an error occurs while creating the authorization url
    return new NextResponse(
      JSON.stringify({
        error:
          "An internal error occured which prevented us from requesting your youtube account, please try again.",
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }
}

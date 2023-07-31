import { IdTokenIsValid } from "@/app/auth/Authorization";
import { deleteAccessTokenFromDatabase } from "@/app/auth/TokenManagement";
import { getYoutubeToken } from "@/app/auth/YoutubeTokens";
import { FirestoreCollectionNames } from "@/app/interfaces/Enums";
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

// Fetches the user youtube profile
export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const id_token = req.headers.get("idtoken") as string;
    const uid = req.nextUrl.searchParams.get("uid");

    // If we were not provided with a UID in the request
    if (!uid) {
      return new NextResponse(
        JSON.stringify({
          error:
            "No UID was provided in api request, cannot fetch profile without it!",
        }),
        { status: 400 }
      );
    }

    const tokenValidity = await IdTokenIsValid(id_token, uid);

    // If the token is invalid, send a response with an error message to user
    if (tokenValidity !== true) {
      return new NextResponse(
        JSON.stringify({
          error:
            tokenValidity === false
              ? "An error occured, please try again or log in again."
              : tokenValidity.errorMessage,
        }),
        {
          status: 400,
        }
      );
    }

    // Try to get access token for user
    const youtubeAccessToken = await getYoutubeToken(uid);

    // If the returned token is undefined, throw an error
    if (!youtubeAccessToken) {
      throw new Error("Could not retreieve an access token");
    }

    console.log("Got youtube access token", youtubeAccessToken);

    // Get instance of youtube api
    const youtube = await google.youtube("v3").channels.list({
      access_token: youtubeAccessToken?.access_token,
      part: ["status", "id", "snippet"],
      mine: true,
    });

    return new NextResponse(JSON.stringify(youtube), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.log("Error occured fetching youtube account data", err);
    return new NextResponse(
      JSON.stringify({
        error: "An error occured, please try again or log in again.",
      }),
      {
        status: 400,
      }
    );
  }
}

// Delete the youtube token from database
export async function DELETE(req: NextRequest, res: NextResponse) {
  try {
    const id_token = req.headers.get("idtoken") as string;
    const uid = req.nextUrl.searchParams.get("uid");

    // If we were not provided with a UID in the request
    if (!uid) {
      return new NextResponse(
        JSON.stringify({
          error:
            "No UID was provided in api request, cannot delete profile without it!",
        }),
        { status: 400 }
      );
    }

    const tokenValidity = await IdTokenIsValid(id_token, uid);

    if (tokenValidity !== true) {
      return new NextResponse(
        JSON.stringify({
          error:
            tokenValidity === false
              ? "An error occured, please try again or log in again."
              : tokenValidity.errorMessage,
        }),
        {
          status: 400,
        }
      );
    }
    // Create the oauth client
    const oauth2Client = new google.auth.OAuth2({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_CLIENT_REDIRECT_URI,
    });

    // Get the users youtube access token
    const youtubeAccessToken = await getYoutubeToken(uid);
    console.log("Got token, will revoke", youtubeAccessToken);

    // Revoke the token, making it unable to perform requests to api
    const revokeTokenResult = await oauth2Client.revokeToken(
      youtubeAccessToken?.access_token!
    );

    // Delete the token from our database, only if the revocation was successful
    if (revokeTokenResult.status === 200) {
      console.log(
        "Successfully revoked token, now deleting it from the database"
      );

      // Attempt to delete the access token from the database
      const deleteAccessTokenResult = await deleteAccessTokenFromDatabase(
        uid,
        FirestoreCollectionNames.YOUTUBE_ACCESS_TOKENS
      );

      // If we were able to delete the token in the database successfully
      if (deleteAccessTokenResult) {
        console.log(`Successfully deleted access token for user ${uid}`);

        // Send successful response
        return new NextResponse("Successfully unlinked account", {
          status: 200,
        });
      }
    }
  } catch (err) {
    console.log("Error occured while revoking token", err);
    return new NextResponse(
      JSON.stringify({
        error: "An error occured, please try again or log in again.",
      }),
      {
        status: 500,
      }
    );
  }
}

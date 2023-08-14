import { IdTokenIsValid } from "@/lib/auth/Authorization";
import { getSpotifyToken } from "@/lib/auth/SpotifyTokens";
import { SpotifyAccessToken } from "@/definitions/SpotifyInterfaces";
import { PlaylistModificationPayload } from "@/definitions/UserInterfaces";
import {
  validateIsPlaylistModificationPayload,
  applySpotifyModifications,
} from "@/lib/Modifications";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, res: NextResponse) {
  const idToken = req.headers.get("idtoken") as string;
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");

  // If no uid was provided, return
  if (!uid) {
    return new NextResponse("Request needs a UID", {
      status: 400,
    });
  }

  // Validate the passed idtoken belongs to the uid
  const tokenValidity = await IdTokenIsValid(idToken, uid);

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

  // Get the payload (the specifications on what we should modify, provided by the user)
  const payload = await req.json();

  // Get spotify token for uid
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

  // If we were provided with valid modifications modify the playlist accordingly
  if (validateIsPlaylistModificationPayload(payload)) {
    console.log("Payload is valid!");
    // Send the request
    const modificationRequest = await applySpotifyModifications(
      payload as PlaylistModificationPayload,
      token as SpotifyAccessToken
    );

    // applySpotifyModifications returns true on success
    // if the modificationRequest is true, modification attempt succeded
    if (modificationRequest === true) {
      return new NextResponse("Successfully modified playlist", {
        status: 200,
      });
    }

    // Modification request failed
    console.log("Request failed!", JSON.stringify(modificationRequest));

    return new NextResponse(JSON.stringify(modificationRequest), {
      status: modificationRequest.error.status | 500,
      statusText: modificationRequest.error.message,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

import { IdTokenIsValid } from "@/app/auth/Authorization";
import { getYoutubeToken } from "@/app/auth/YoutubeTokens";
import { PlaylistModificationPayload } from "@/app/definitions/UserInterfaces";
import {
  applyYoutubeModifications,
  validateIsPlaylistModificationPayload,
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
  const payload = (await req.json()) as PlaylistModificationPayload;

  // Get youtube token for uid
  const token = await getYoutubeToken(uid);

  // If we could not retreive a token, return an error response
  if (!token) {
    return new NextResponse(
      JSON.stringify({
        error: "Please connect your youtube account",
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
    const modificationRequest = await applyYoutubeModifications(payload, token);

    console.log("Modification result", modificationRequest);

    if (modificationRequest) {
      return new NextResponse("Successfully modified playlist", {
        status: 200,
      });
    }
    // TODO: Map our modification payload keys to the keys used by youtube
    // TODO: https://developers.google.com/youtube/v3/docs/playlists/update
  }
}

import { getSpotifyToken } from "@/app/auth/SpotifyTokens";
import { PlaylistModificationPayload } from "@/app/interfaces/UserInterfaces";
import {
  validateIsPlaylistModificationPayload,
  applySpotifyModifications,
} from "@/lib/Modifications";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, res: NextResponse) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");

  if (!uid) {
    return new NextResponse("Request needs a UID", {
      status: 400,
    });
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
    applySpotifyModifications(payload as PlaylistModificationPayload, token);
  }
}

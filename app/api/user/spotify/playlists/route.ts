import { NextRequest, NextResponse } from "next/server";
import { getSpotifyToken } from "@/app/firebase/SpotifyTokens";

export async function GET(req: NextRequest, res: NextResponse) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid")!;

  const limit = searchParams.get("limit") ? searchParams.get("limit") : 20;
  const offset = searchParams.get("offset") ? searchParams.get("offset") : 0;

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

  // If our token exists and is not expired
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

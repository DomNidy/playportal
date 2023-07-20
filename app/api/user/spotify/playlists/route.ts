import { NextRequest, NextResponse } from "next/server";
import { getSpotifyToken } from "@/app/firebase/SpotifyTokens";

export async function GET(req: NextRequest, res: NextResponse) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid")!;

  const limit = searchParams.get("limit") ? searchParams.get("limit") : 20;
  const offset = searchParams.get("offset") ? searchParams.get("offset") : 0;

  const token = await getSpotifyToken(uid);

  // If we could not retreive a token, return
  if (token instanceof NextResponse) {
    return token;
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
    ).then(async (res) => await res.json());

    return new NextResponse(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
      },
      status: 200,
    });
  }

  return new NextResponse(
    JSON.stringify({
      error: "Could not get your playlists, please authenticate with spotify.",
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
      status: 500,
    }
  );
}

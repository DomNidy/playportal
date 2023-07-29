import { NextRequest, NextResponse } from "next/server";
import { getSpotifyToken } from "@/app/auth/SpotifyTokens";

async function fetchProfile(token: string): Promise<any> {
  try {
    const result = await fetch("https://api.spotify.com/v1/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    const response = await result.json();
    console.log(response);

    if (!result.ok) {
      // Handle non-OK response (e.g., 4xx or 5xx status codes)
      console.log("Failed to fetch profile from Spotify API.", result);
      return false;
    }

    return response;
  } catch (error) {
    console.log("Error fetching profile:", error);
  }
}

export async function GET(req: NextRequest, res: NextResponse) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");

  // If we were not provided with a UID in the request
  if (uid == null) {
    return new NextResponse(
      JSON.stringify({
        error:
          "No UID was provided in api request, cannot fetch profile without it!",
      }),
      { status: 400 }
    );
  }
  // If we have a uid
  if (uid) {
    const token = await getSpotifyToken(uid);

    // If we could not retreive a token, return
    if (!token) {
      return new NextResponse(
        JSON.stringify({
          error:
            "UID Was invalid or your UID does not have an assosciated spotify account connected.",
        }),
        { headers: { "Content-Type": "application/json" }, status: 404 }
      );
    }

    // If our token exists and is not expired
    if (token) {
      const result = await fetchProfile(token.access_token);

      if (result) {
        return new NextResponse(JSON.stringify(result), {
          headers: {
            "Content-Type": "application/json",
          },
          status: 200,
        });
      }
      return new NextResponse("Failed to fetch spotify profile", {
        status: 400,
      });
    }
  }
}

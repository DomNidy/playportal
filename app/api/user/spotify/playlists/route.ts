import { NextRequest, NextResponse } from "next/server";
import { getSpotifyToken } from "@/lib/auth/SpotifyTokens";
import { IdTokenIsValid } from "@/lib/auth/Authorization";
import { UserSpotifyPlaylists } from "@/definitions/SpotifyInterfaces";

export async function POST(req: NextRequest, res: NextResponse) {
  const id_token = req.headers.get("idtoken") as string;
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");

  const limit = searchParams.get("limit") ? searchParams.get("limit") : 20;
  const offset = searchParams.get("offset") ? searchParams.get("offset") : 0;

  if (!uid) {
    return new NextResponse("Request needs a UID", {
      status: 400,
    });
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

  // this array will store the json of each response from spotify
  const spotifyResponses: UserSpotifyPlaylists[] = [];

  // If our token exists
  if (
    token instanceof Object &&
    "access_token" in token &&
    "expires_in" in token
  ) {
    const initialResponse = await fetch(
      `https://api.spotify.com/v1/me/playlists?offset=${offset}${
        !!limit ? `&limit=${limit}` : ""
      }`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      }
    );

    const parsedResponse = await initialResponse.json();
    // If the response has a next url, indicating there are more playlists to be fetched
    if (initialResponse.ok) {
      // Add the response to responses array
      spotifyResponses.push(parsedResponse);
    }

    // If the most recent response in our responses array has a next url to request
    while (spotifyResponses && !!spotifyResponses.at(-1)?.next) {
      // Send another request with the limit
      console.log("Found a next url,", spotifyResponses.at(-1)?.next);

      const response = await fetch(spotifyResponses.at(-1)?.next!, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      });

      // If the response was successful, add it to the responses array
      if (response.ok) {
        spotifyResponses.push(await response.json());
      }

      // If the response failed, break out of this loop and dont add it to the array
      // Breaking out here is necessary to avoid an infinite request loop
      if (!response.ok) {
        break;
      }
    }

    console.log(
      "Finished with spotify requests!",
      JSON.stringify(spotifyResponses)
    );

    if (spotifyResponses) {
      return new NextResponse(JSON.stringify(spotifyResponses), {
        headers: {
          "Content-Type": "application/json",
        },
        status: 200,
      });
    }
    // Request for playlists was not successful
    else {
      return new NextResponse(
        JSON.stringify({ error: "Failed to fetch playlists" }),
        {
          headers: {
            "Content-Type": "application/json",
          },
          status: 400,
        }
      );
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

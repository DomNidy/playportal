import { NextRequest, NextResponse } from "next/server";
import { getSpotifyToken } from "@/app/auth/SpotifyTokens";
import { IdTokenIsValid } from "@/app/auth/Authorization";
import { deleteAccessTokenFromDatabase } from "@/app/auth/TokenManagement";
import { FirestoreCollectionNames } from "@/app/definitions/Enums";
import { SpotifyAccessToken } from "@/app/definitions/SpotifyInterfaces";

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

export async function POST(req: NextRequest, res: NextResponse) {
  const id_token = req.headers.get("idtoken") as string;
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

  const tokenValidity = await IdTokenIsValid(id_token, uid);

  // If the token is invalid
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
          "UID Was invalid or your UID does not have an assosciated spotify account connected.",
      }),
      { headers: { "Content-Type": "application/json" }, status: 404 }
    );
  }

  // If our token exists and is not expired
  if (token) {
    const result = await fetchProfile(
      (token as SpotifyAccessToken).access_token
    );

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

// Delete spotify access token in database
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

    // Ensure the provided idtoken is valid, if it is not, return a failed response
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

    // Delete users spotify token from our databasse
    const deleteAccessTokenResult = await deleteAccessTokenFromDatabase(
      uid,
      FirestoreCollectionNames.SPOTIFY_ACCESS_TOKENS
    );

    // If we were able to delete the token in the database successfully
    if (deleteAccessTokenResult) {
      console.log(`Successfully deleted access token for user ${uid}`);

      // Send successful response
      return new NextResponse("Successfully unlinked account", {
        status: 200,
      });
    }
  } catch (err) {
    console.log(err);
  }
}

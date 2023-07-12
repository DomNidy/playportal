import axios from "axios";
import dotenv from "dotenv";
import { NextRequest, NextResponse } from "next/server";

// Get a spotify access token from the api
export async function GET(req: NextRequest, res: NextResponse) {
  const accessToken = req.headers.get("accessToken");

  // If the request does not have an access token
  if (!accessToken) {
    return new NextResponse(
      JSON.stringify({
        stats: 400,
        error: "Request did not contain a spotify access token",
        headers: { "Content-Type": "application/json" },
      })
    );
  }

  const url = `https://api.spotify.com/users/`;

  const user = await axios.get("https://api.spotify.com/v1/me", {
    headers: { accessToken },
  });

  console.log(user);
  return user;
}

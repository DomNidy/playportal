import axios from "axios";
import dotenv from "dotenv";
import { NextRequest, NextResponse } from "next/server";
dotenv.config();

// Get environment variables
const { CLIENT_ID, CLIENT_SECRET } = process.env;

// Get a spotify access token from the api
export async function GET(req: NextRequest, res: NextResponse) {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return new NextResponse(
      JSON.stringify({
        error: "Server could not retrieve necessary spotify client tokens",
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    );
  }

  // Request spotify for access token
  const url = "https://accounts.spotify.com/api/token";
  const accessToken = await axios.post(
    url,
    new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID!,
      client_secret: CLIENT_SECRET!,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  if (accessToken.status === 200) {
    // Successfully retrieved the access token
    return new NextResponse(
      JSON.stringify({
        accessToken: accessToken.data,
        client_id: CLIENT_ID,
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
  }

  return new NextResponse(
    JSON.stringify({
      error: "Failed to retrieve access token from spotify api",
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  );
}

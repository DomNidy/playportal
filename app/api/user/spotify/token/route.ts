import { NextRequest, NextResponse } from "next/server";
import { getSpotifyToken } from "@/app/firebase/SpotifyTokens";

export async function GET(req: NextRequest, res: NextResponse) {
  const state = req.nextUrl.searchParams.get("state");
  const uid = req.nextUrl.searchParams.get("uid");

  // If state param is in url
  if (state && uid) {
    // Try to find a document with state as it's name in firestore
    const token = await getSpotifyToken(uid);

    if (res) {
      return new NextResponse(JSON.stringify(token), {
        status: 200,
      });
    }
  }
}

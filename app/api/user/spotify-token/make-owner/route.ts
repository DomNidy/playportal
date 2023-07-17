import { NextRequest, NextResponse } from "next/server";
import { makeOwnerOfSpotifyToken } from "@/app/firebase/SpotifyTokens";

export async function POST(req: NextRequest, res: NextResponse) {
  const state = req.nextUrl.searchParams.get("state");
  const uid = req.nextUrl.searchParams.get("uid");

  console.log(state, uid);

  // If state param is in url
  if (state && uid) {
    // Try to find a document with state as it's name in firestore
    const res = await makeOwnerOfSpotifyToken(uid, state);
    if (res) {
      return new NextResponse("Success", {
        status: 200,
      });
    }
  }
}

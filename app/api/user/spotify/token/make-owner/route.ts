import { NextRequest, NextResponse } from "next/server";
import { makeOwnerOfAccessToken } from "@/app/firebase/TokenManagement";

export async function POST(req: NextRequest, res: NextResponse) {
  const state = req.nextUrl.searchParams.get("state");
  const uid = req.nextUrl.searchParams.get("uid");

  // If state param is in url
  if (state && uid) {
    // Try to find a document with state as it's name in firestore
    const res = await makeOwnerOfAccessToken(uid, state, "SpotifyAccessTokens");
    if (res) {
      return new NextResponse("Success", {
        status: 200,
      });
    }
  }
}

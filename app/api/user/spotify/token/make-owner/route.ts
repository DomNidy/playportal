import { NextRequest, NextResponse } from "next/server";
import { makeOwnerOfAccessToken } from "@/app/auth/TokenManagement";
import { FirestoreCollectionNames, URLParamNames } from "@/app/interfaces/Enums";

export async function POST(req: NextRequest, res: NextResponse) {
  const state = req.nextUrl.searchParams.get(
    URLParamNames.SPOTIFY_TEMP_KEY_PARAM
  );
  const uid = req.nextUrl.searchParams.get("uid");

  // If state param is in url
  if (state && uid) {
    // Try to find a document with state as it's name in firestore
    const res = await makeOwnerOfAccessToken(
      uid,
      state,
      FirestoreCollectionNames.SPOTIFY_ACCESS_TOKENS
    );
    if (res) {
      return new NextResponse("Success", {
        status: 200,
      });
    }
  }
}

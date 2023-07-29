import { NextRequest, NextResponse } from "next/server";
import { makeOwnerOfAccessToken } from "@/app/auth/TokenManagement";
import { FirestoreCollectionNames, URLParamNames } from "@/app/utility/Enums";

// TODO: CONVERT THE MAKE-OWNER ENDPOINTS TO READ BODY INSTEAD OF URL PARAMS
export async function POST(req: NextRequest, res: NextResponse) {
  const tempKey = req.nextUrl.searchParams.get(
    URLParamNames.YOUTUBE_TEMP_KEY_PARAM
  );
  const uid = req.nextUrl.searchParams.get("uid");

  // If state param is in url
  if (tempKey && uid) {
    // Try to find a document with state as it's name in firestore
    const res = await makeOwnerOfAccessToken(
      uid,
      tempKey,
      FirestoreCollectionNames.YOUTUBE_ACCESS_TOKENS
    );
    if (res) {
      return new NextResponse("Success", {
        status: 200,
      });
    }
  }
}

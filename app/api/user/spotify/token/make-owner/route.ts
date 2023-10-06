import { NextRequest, NextResponse } from "next/server";
import { makeOwnerOfAccessToken } from "@/lib/auth/TokenManagement";
import { FirestoreCollectionNames, URLParamNames } from "@/definitions/Enums";
import { createNotificationForUUID } from "@/lib/CreateNotification";
import { randomUUID } from "crypto";

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
      // Add notification to user letting them know that we linked their account
      createNotificationForUUID(uid, {
        createdAtMS: Date.now(),
        id: randomUUID(),
        message:
          "Your Spotify account has been linked! You can now use Spotify in your playlist transfers!",
        recipientUUID: uid,
        seen: false,
        type: "success",
        shouldPopup: true,
        title: "Spotify account linked",
      });

      return new NextResponse("Success", {
        status: 200,
      });
    }
  }
}

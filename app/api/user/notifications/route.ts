import { createNotificationForUUID } from "@/lib/CreateNotification";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

// Create a notification in both the realtime db document for the user, and the normal db for the user
export function POST(req: NextRequest, res: NextResponse) {
  const uid = req.headers.get("uid");

  createNotificationForUUID(uid!, {
    createdAtMS: Date.now(),
    id: randomUUID(),
    message: "Test not",
    recipientUUID: uid!,
    seen: false,
    title: "Test notification!",
    type: "neutral",
    shouldPopup: true,
  });
  return new NextResponse(JSON.stringify("Res"));
}

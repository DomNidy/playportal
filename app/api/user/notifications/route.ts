import { NextRequest, NextResponse } from "next/server";

// Create a notification in both the realtime db document for the user, and the normal db for the user
export function POST(req: NextRequest, res: NextResponse) {
  return new NextResponse(JSON.stringify("Res"));
}

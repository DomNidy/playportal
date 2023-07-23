import { NextRequest, NextResponse } from "next/server";
import { Buffer } from "node:buffer";
import { GetBaseUrl } from "@/app/utility/GetBaseUrl";
import { google } from "googleapis";

// TODO: https://developers.google.com/youtube/v3/guides/auth/server-side-web-apps#node.js_1
export async function GET(req: NextRequest, res: NextResponse) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");

  console.log("Google client", process.env.GOOGLE_CLIENT_ID);
}

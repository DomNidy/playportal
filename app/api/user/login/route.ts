import {
  IdTokenIsValid,
  createAuthorizationTokenForUser,
} from "@/app/auth/Authorization";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  const id_token = req.headers.get("idtoken") as string;
  const uid = req.nextUrl.searchParams.get("uid");

  // If no uid was provided
  if (!uid) {
    return new NextResponse("Request needs a UID", {
      status: 400,
    });
  }

  // Validiting id token
  if (!(await IdTokenIsValid(id_token, uid))) {
    return new NextResponse(
      JSON.stringify({
        error: "Invalid session, please login again.",
      }),
      {
        status: 400,
      }
    );
  }

  // * THIS IS WHERE USER PERMS ARE SET
  const customToken = await createAuthorizationTokenForUser(uid);

  return new NextResponse(customToken, {
    status: 200,
  });
}

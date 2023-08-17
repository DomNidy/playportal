//* This endpoint gets verbose details about an operation (logs) given an operation ID

import { IdTokenIsValid } from "@/lib/auth/Authorization";
import { getFirebaseAdminApp } from "@/lib/auth/Utility";
import { NextResponse } from "next/server";

const adminApp = getFirebaseAdminApp();

export async function GET(
  req: Request,
  { params }: { params: { operationID: string } }
) {
  const operationID = params.operationID;
  const uid = req.headers.get("uid");
  const id_token = req.headers.get("idtoken");

  if (!uid) {
    return new NextResponse("Request needs a UID", {
      status: 400,
    });
  }

  if (!id_token) {
    return new NextResponse("Request needs an id token", {
      status: 400,
    });
  }

  if (!operationID) {
    return new NextResponse("Request is missing an operation id", {
      status: 400,
    });
  }

  const tokenValidity = await IdTokenIsValid(id_token, uid);

  if (tokenValidity !== true) {
    return new NextResponse(
      JSON.stringify({
        error:
          tokenValidity === false
            ? "An error occured, please try again or log in again."
            : tokenValidity.errorMessage,
      }),
      {
        status: 400,
      }
    );
  }

  const operationData = (
    await adminApp.firestore().doc(`operations/${operationID}`).get()
  ).data();

  if (operationData) {
    return new NextResponse(JSON.stringify(operationData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } else {
    return new NextResponse("Operation not found", {
      status: 404,
    });
  }
}

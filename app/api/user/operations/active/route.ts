// This endpoint returns the active operation a user has, if the user does not have one, return 404

import { OperationStates } from "@/definitions/MigrationService";
import { IdTokenIsValid } from "@/lib/auth/Authorization";
import { getFirebaseAdminApp } from "@/lib/auth/Utility";
import { getFirebaseApp } from "@/lib/utility/GetFirebaseApp";
import { NextRequest, NextResponse } from "next/server";

// Initialize Cloud Firestore and get a reference to the service
const adminApp = getFirebaseAdminApp();

export async function GET(req: NextRequest) {
  const id_token = req.headers.get("idtoken") as string;
  const uid = req.headers.get("uid") as string;

  // If we were not provided with a UID in the request
  if (uid == null) {
    return new NextResponse(
      JSON.stringify({
        error:
          "No UID was provided in api request, cannot fetch operations without it!",
      }),
      { status: 400 }
    );
  }

  const tokenValidity = await IdTokenIsValid(id_token, uid);

  // If the token is invalid
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

  const userDoc = await adminApp.firestore().doc(`users/${uid}`).get();
  const userOperations = (userDoc.data()?.operations as string[]).reverse();

  if (!userOperations) {
    return new NextResponse(JSON.stringify("No operations found."), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  for (let i = 0; i < userOperations.length; i += 1) {
    // If we have an operation at current index
    if (userOperations[i]) {
      const operationData = (
        await adminApp.firestore().doc(`operations/${userOperations[i]}`).get()
      ).data();

      if (
        operationData?.status.status == OperationStates.INSERTING_IN_PROGRESS ||
        OperationStates.LOOKUP_IN_PROGRESS ||
        OperationStates.PROCESSING
      ) {
        return new NextResponse(
          JSON.stringify({
            info: operationData!.info,
            status: operationData!.status.status,
            logs: operationData!.logs,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    }
  }
  return new NextResponse(JSON.stringify("No active operations found."), {
    status: 404,
  });
}

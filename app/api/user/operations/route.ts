// This endpoint lists all operations a user has created and simplified details about them
// Details such as (Started at, origin & destination, # of tracks, and status)
import { IdTokenIsValid } from "@/lib/auth/Authorization";
import { OperationTransferSimple } from "@/definitions/MigrationService";
import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdminApp } from "@/lib/auth/Utility";

const adminApp = getFirebaseAdminApp();
export async function GET(req: NextRequest, res: NextResponse) {
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

  // * Fetch operations array from user

  const userDoc = await adminApp.firestore().doc(`users/${uid}`).get();
  const userOperations = (userDoc.data()?.operations as string[]).reverse();

  let operations: OperationTransferSimple[] = [];

  if (!userOperations) {
    return new NextResponse(JSON.stringify(operations), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // * Fetch operations using userOperations array
  // TODO: Implement limit & offset (pagination)
  for (let i = 0; i < userOperations.length; i += 1) {
    
    // If we have an operation at current index
    if (userOperations[i]) {
      const operationData = (
        await adminApp.firestore().doc(`operations/${userOperations[i]}`).get()
      ).data();

      if (!operationData) {
        continue;
      }
      operations.push({
        info: operationData.info,
        status: operationData.status.status,
      });
    }
  }

  operations = operations.filter((op) => !!op);

  // * return operations to client
  if (operations) {
    return new NextResponse(JSON.stringify(operations), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

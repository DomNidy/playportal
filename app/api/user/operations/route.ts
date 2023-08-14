// This endpoint lists all operations a user has created and simplified details about them
// Details such as (Started at, origin & destination, # of tracks, and status)

import { IdTokenIsValid } from "@/lib/auth/Authorization";
import {
  OperationTransfer,
  OperationTransferSimple,
} from "@/definitions/MigrationService";
import { getFirebaseApp } from "@/lib/utility/GetFirebaseApp";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

getFirebaseApp();
// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore();

export async function GET(req: NextRequest, res: NextResponse) {
  const id_token = req.headers.get("idtoken") as string;
  const uid = req.headers.get("uid") as string;
  const { searchParams } = new URL(req.url);

  const limit = searchParams.get("limit");
  const offset = searchParams.get("offset");

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
  const userDoc = await getDoc(doc(db, "users", uid));
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

  console.log(`Limit = ${Number(limit)}, offset = ${Number(offset)}`);
  // * Fetch operations using userOperations array
  // TODO: Implement limit & offset (pagination)
  for (
    let i = Number(offset) || 0;
    i < Number(limit) + Number(offset);
    i += 1
  ) {
    console.log(i);
    console.log(userOperations[i]);
    // If we have an operation at current index
    if (userOperations[i]) {
      const operationData = (
        await getDoc(doc(db, "operations", userOperations[i]))
      ).data();

      console.log(operationData);
      if (!operationData) {
        continue;
      }
      operations.push({
        info: operationData.info,
        status: operationData.status.status,
      });
    }
  }

  console.log(operations);
  operations = operations.filter((op) => !!op);

  console.log("Filtered operations", operations);

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

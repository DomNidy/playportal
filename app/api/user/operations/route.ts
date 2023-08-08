import { IdTokenIsValid } from "@/app/auth/Authorization";
import { OperationTransfer } from "@/app/definitions/MigrationService";
import { getFirebaseApp } from "@/app/utility/GetFirebaseApp";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

getFirebaseApp();
// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore();

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
  const userDoc = await getDoc(doc(db, "users", uid));
  const userOperations = userDoc.data()?.operations as string[];

  // * Fetch operations using userOperations array
  let operations: OperationTransfer[] = await Promise.all(
    userOperations.map(async (operationID) => {
      const operation = (
        await getDoc(doc(db, "operations", operationID))
      ).data();

      return operation as OperationTransfer;
    })
  );

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

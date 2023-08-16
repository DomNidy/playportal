// Fetch operation data from user

import { Auth } from "firebase/auth";
import {
  OperationTransfer,
  TransferTableData,
} from "@/definitions/MigrationService";
import { GetBaseUrl } from "../utility/GetBaseUrl";

/**
 * Returns data to populate the transfer table (this data is a subset of values from operation documents)
 * @param {any} auth Auth context of the user
 * @returns {any}
 */
export async function fetchOperationTransfers(
  auth: Auth
): Promise<OperationTransfer[] | undefined> {
  if (!auth.currentUser) {
    alert("You are not logged in, cannot fetch data.");
    return;
  }

  const request = await fetch(`${GetBaseUrl()}api/user/operations`, {
    method: "GET",
    headers: {
      idtoken: await auth.currentUser.getIdToken(),
      uid: auth.currentUser.uid,
    },
  });

  if (request.ok) {
    return (await request.json()) as OperationTransfer[];
  }
}

/**
 * @param auth The auth state of the user
 * @returns The `OperationTransfer` of the active operation
 */
export async function fetchActiveOperation(
  auth: Auth
): Promise<OperationTransfer | undefined> {
  if (!auth.currentUser) {
    return;
  }

  const activeOp: OperationTransfer = await fetch(
    `${GetBaseUrl()}api/user/operations/active`,
    {
      method: "GET",
      headers: {
        idtoken: await auth.currentUser?.getIdToken(),
        uid: auth.currentUser?.uid,
      },
    }
  ).then(async (res) => await res.json());

  if (activeOp.info) {
    return activeOp;
  }
  return undefined;
}

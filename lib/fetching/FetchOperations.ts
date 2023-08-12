// Fetch operation data from user

import { Auth } from "firebase/auth";
import {
  OperationTransfer,
  TransferTableData,
} from "@/definitions/MigrationService";
import { GetBaseUrl } from "../utility/GetBaseUrl";

/**
 * Returns data to populate the transfer table (this data is a subset of values from operation documents)
 * @param {any} uid Uid of the user to fetch operations for
 * @param {any} auth Auth context of the user
 * @param {any} limit amount of operations to fetch
 * @param {any} offset Index to start fetching operations from
 * @returns {any}
 */
export async function fetchOperationTransfers(
  uid: string,
  limit = 10,
  offset = 0,
  auth: Auth
): Promise<OperationTransfer[] | undefined> {
  if (!auth.currentUser) {
    alert("You are not logged in, cannot fetch data.");
    return;
  }

  const request = await fetch(
    `${GetBaseUrl()}api/user/operations?limit=${limit}&offset=${offset}`,
    {
      method: "GET",
      headers: {
        idtoken: await auth.currentUser.getIdToken(),
        uid: auth.currentUser.uid,
      },
    }
  );

  if (request.ok) {
    return (await request.json()) as OperationTransfer[];
  }
}

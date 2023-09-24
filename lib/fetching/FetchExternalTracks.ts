import { Platforms } from "@/definitions/Enums";
import { ExternalTrack } from "@/definitions/MigrationService";
import { Auth } from "firebase/auth";
import { GetBaseUrl } from "../utility/GetBaseUrl";

/**
 * Requests the api to create an array of external trackw given a platform and array of platform ids, then returns it to the client
 *
 * This method updates data in the database as well
 * @param {any} platform:Platforms
 * @param {any} platformIDS:string[]
 * @param {any} auth:Auth
 * @param {any} operationID:string
 * @returns {any}
 */
export async function fetchExternalTracks(
  platform: Platforms,
  platformIDS: string[],
  operationID: string,
  auth: Auth
): Promise<ExternalTrack[] | undefined> {
  console.log("ran fetchExternalTrack");
  if ((auth && !auth?.currentUser) || !auth) {
    console.log("Not authed, we cannot create the external track");
    return undefined;
  }

  const request = await fetch(`${GetBaseUrl()}api/user/tracks`, {
    method: "POST",
    headers: {
      uid: auth.currentUser!.uid!,
      id_token: await auth.currentUser!.getIdToken()!,
    },
    body: JSON.stringify({
      platform: platform,
      platformIDS: platformIDS,
      operationID: operationID,
    }),
  });

  if (request.ok) {
    return (await request.json()) as ExternalTrack[];
  }

  console.log("Request failed", await request.json());
  return undefined;
}

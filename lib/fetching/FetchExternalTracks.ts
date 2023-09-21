import { Platforms } from "@/definitions/Enums";
import { ExternalTrack } from "@/definitions/MigrationService";
import { Auth } from "firebase/auth";
import { GetBaseUrl } from "../utility/GetBaseUrl";

/**
 * Requests the api to create an external track given a platform and platform id, then returns it to the client
 * @param {any} platform:Platforms
 * @param {any} platformID:string
 * @param {any} auth:Auth
 * @returns {any}
 */
export async function fetchExternalTrack(
  platform: Platforms,
  platformID: string,
  auth: Auth
): Promise<ExternalTrack | undefined> {
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
      platformID: platformID,
    }),
  });

  if (request.ok) {
    return (await request.json()) as ExternalTrack;
  }

  console.log("Request failed", await request.json());
  return undefined;
}

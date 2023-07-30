import { youtube_v3 } from "googleapis";
import { GetBaseUrl } from "../utility/GetBaseUrl";
import { Auth } from "firebase/auth";
/**
 * Fetches channel list from using a users token stored in firebase, after the list of channels is fetched, returns the
 * first channel from the list
 *
 * ### Note: In the future if we wish to connect multiple channels from a single user this will need to be modified
 * @param {any} auth `Auth` instance
 * @returns {any} A `youtube_v3.Schema$Channel` or `undefined`
 */

export async function fetchYoutubeProfile(
  auth: Auth
): Promise<youtube_v3.Schema$Channel | undefined> {
  if (!auth.currentUser) {
    return;
  }

  const request = await auth?.currentUser.getIdToken().then((idtoken) =>
    fetch(`${GetBaseUrl()}api/user/youtube?uid=${auth.currentUser?.uid}`, {
      method: "POST",
      headers: {
        idtoken: idtoken,
      },
    })
  );

  const youtubeProfileData: youtube_v3.Schema$ChannelListResponse = (
    await request.json()
  ).data;

  // Return the first entry from the list
  // TODO: Read up on youtube api and in what case multiple channels will be present in the response
  // TODO: After that I should revisit this code and implement handling for multiple channel
  if (youtubeProfileData.items?.at(0)) {
    return youtubeProfileData.items.at(0) as youtube_v3.Schema$Channel;
  }
}

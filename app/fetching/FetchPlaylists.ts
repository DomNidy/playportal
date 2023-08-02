import { Auth } from "firebase/auth";
import { GetBaseUrl } from "../utility/GetBaseUrl";
import { youtube_v3 } from "googleapis";
import { UserPlaylists } from "../interfaces/SpotifyInterfaces";
import { PlaylistModificationPayload } from "../interfaces/UserInterfaces";

/**
 * Given an auth instance, fetches youtube playlists based on the UID assosciated with the auth instanced passed
 * @param {any} auth
 * @returns {any} A `youtube_v3.Schema$PlaylistListResponse` object
 */

export async function fetchYoutubePlaylists(
  auth: Auth
): Promise<youtube_v3.Schema$PlaylistListResponse | undefined> {
  const idToken = await auth.currentUser?.getIdToken();

  // If no id token is found, we will not fetch
  if (!idToken) {
    alert("No id token found, please re-log.");
    return;
  }

  const request = await fetch(
    `${GetBaseUrl()}api/user/youtube/playlists?uid=${auth?.currentUser?.uid}`,
    {
      method: "POST",
      headers: {
        idtoken: idToken,
      },
    }
  );

  // If request was successful
  if (request.ok) {
    const playlists = (await request.json())
      .data as youtube_v3.Schema$PlaylistListResponse;
    return playlists;
  }
}

export async function fetchSpotifyPlaylists(
  auth: Auth
): Promise<UserPlaylists | undefined> {
  const idToken = await auth.currentUser?.getIdToken();

  if (!auth.currentUser) {
    alert("No id token found, please re-log.");
    return;
  }

  const request = await fetch(
    `${GetBaseUrl()}api/user/spotify/playlists?uid=${auth?.currentUser?.uid}`,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        idtoken: await auth.currentUser.getIdToken(),
      },
      method: "POST",
    }
  );

  // If the request was okay
  if (request.ok) {
    const _playlists = await request.json();

    return _playlists as UserPlaylists;
  } else {
    alert(`Error fetching spotify playlists ${(await request.json())?.error}`);
  }
}

export async function sendSpotifyPlaylistModification(
  modificationPayload: PlaylistModificationPayload,

  auth: Auth
) {
  // IF user is not authed, dont send request
  if (!auth.currentUser) {
    return false;
  }

  // Send the request to modify title
  const response = await fetch(
    `${GetBaseUrl()}api/user/spotify/playlists/modify?uid=${
      auth.currentUser.uid
    }`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        idtoken: await auth.currentUser.getIdToken(),
      },
      body: JSON.stringify(modificationPayload),
    }
  );

  return response;
}

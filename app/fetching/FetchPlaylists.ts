import { Auth } from "firebase/auth";
import { GetBaseUrl } from "../utility/GetBaseUrl";
import { youtube_v3 } from "googleapis";
import { UserSpotifyPlaylists } from "../definitions/SpotifyInterfaces";
import { PlaylistModificationPayload } from "../definitions/UserInterfaces";
import { Platforms } from "../definitions/Enums";

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
): Promise<UserSpotifyPlaylists | undefined> {
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

    return _playlists as UserSpotifyPlaylists;
  } else {
    alert(`Error fetching spotify playlists ${(await request.json())?.error}`);
  }
}

async function sendSpotifyPlaylistModification(
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

async function sendYoutubePlaylistModification(
  modificationPayload: PlaylistModificationPayload,
  auth: Auth
) {
  // IF user is not authed, dont send request
  if (!auth.currentUser) {
    return false;
  }

  // Send the request to modify title
  const response = await fetch(
    `${GetBaseUrl()}api/user/youtube/playlists/modify?uid=${
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

/**
 * A wrapper function that sends a playlist modifications to the respective api endpoint depending on the platform
 */
export async function sendPlaylistModification(
  platform: Platforms,
  modificationPayload: PlaylistModificationPayload,
  auth: Auth
): Promise<Response | false> {
  switch (platform) {
    case Platforms.SPOTIFY:
      return sendSpotifyPlaylistModification(modificationPayload, auth);
    case Platforms.YOUTUBE:
      return sendYoutubePlaylistModification(modificationPayload, auth);
    default:
      throw Error(
        "This platform has no sendPlaylistModification implementation!"
      );
  }
}

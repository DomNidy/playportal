import { Auth } from "firebase/auth";
import { GetBaseUrl } from "../utility/GetBaseUrl";
import { youtube_v3 } from "googleapis";
import {
  SpotifyAccessToken,
  UserSpotifyPlaylists,
} from "@/definitions/SpotifyInterfaces";
import { PlaylistModificationPayload } from "@/definitions/UserInterfaces";
import { Platforms } from "@/definitions/Enums";
import { ExternalTrack } from "@/definitions/MigrationService";

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
  auth: Auth,
  offset?: number,
  limit?: number
): Promise<UserSpotifyPlaylists | undefined> {
  const idToken = await auth.currentUser?.getIdToken();
  if (!auth.currentUser) {
    alert("No id token found, please re-log.");
    return;
  }

  const request = await fetch(
    `${GetBaseUrl()}api/user/spotify/playlists?uid=${auth?.currentUser?.uid}${
      offset !== undefined && typeof offset == "number"
        ? `&offset=${offset}`
        : ""
    }${
      limit !== undefined && typeof limit == "number" ? `&limit=${limit}` : ""
    }`,
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

/**
 * This function gets the song ids from a playlist on a specified platform
 * song ids meaning `isrc`, `ean`, `upc` codes.
 * @param platform The platform which the playlist exists on
 * @param playlistID The id of the playlist on the specified platform
 * @param auth Auth instance
 * @returns
 */
export async function getPlaylistExternalTracks(
  platform: Platforms,
  playlistID: string,
  auth: Auth
) {
  switch (platform) {
    case Platforms.SPOTIFY:
      return await fetchSpotifyPlaylistExternalTracks(
        platform,
        playlistID,
        auth
      );
    case Platforms.YOUTUBE:
      return await fetchYoutubePlaylistExternalTracks(
        platform,
        playlistID,
        auth
      );
    default:
      throw Error("This platform has no getPlaylistExternalTracks");
  }
}

async function fetchSpotifyPlaylistExternalTracks(
  platform: Platforms,
  playlistID: string,
  auth: Auth
) {
  // IF user is not authed, dont send request
  if (!auth.currentUser) {
    return false;
  }

  const response = await fetch(
    `${GetBaseUrl()}api/user/spotify/playlists/tracks?uid=${
      auth.currentUser.uid
    }&playlistID=${playlistID}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        idtoken: await auth.currentUser.getIdToken(),
      },
    }
  );

  return response;
}

async function fetchYoutubePlaylistExternalTracks(
  platform: Platforms,
  playlistID: string,
  auth: Auth
) {
  if (!auth.currentUser) {
    return false;
  }

  // Send request
  const response = await fetch(
    `${GetBaseUrl()}api/user/youtube/playlists/tracks?uid=${
      auth.currentUser.uid
    }&playlistID=${playlistID}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        idtoken: await auth.currentUser.getIdToken(),
      },
    }
  );

  return response;
}

export async function transferPlaylist(
  origin_platform: string,
  playlistTitle: string,
  playlistID: string,
  desinationPlatform: string,
  destinationPlaylistID: string,
  destinationPlaylistTitle: string,
  auth: Auth
): Promise<false | Response> {
  switch (origin_platform) {
    case Platforms.SPOTIFY:
      return await sendSpotifyTransferPlaylistRequest(
        playlistTitle,
        playlistID,
        desinationPlatform,
        destinationPlaylistID,
        destinationPlaylistTitle,
        auth
      );
    default:
      throw Error(
        `This platform (${origin_platform}) has no transferPlaylist implementation`
      );
  }
}

/**
 * Send a request to our api to transfer a spotify playlist
 * @param {any} playlistTitle name of the playlist we want to transfer
 * @param {any} playlistID Id of the playlist we want to transfer
 * @param {any} desinationPlatform Platform we want to transfer it to
 * @param {any} destinationPlaylistID ID Of the playlist we want to transfer into
 * @param {any} destinationPlaylistTitle Title of the playlist we want to transfer into
 * @param {any} auth Auth
 * @returns {any}
 */

export async function sendSpotifyTransferPlaylistRequest(
  playlistTitle: string,
  playlistID: string,
  desinationPlatform: string,
  destinationPlaylistID: string,
  destinationPlaylistTitle: string,
  auth: Auth
) {
  if (!auth.currentUser) {
    return false;
  }

  const result = await fetch(
    `${GetBaseUrl()}api/user/spotify/playlists/transfer/to-${desinationPlatform}`,
    {
      method: "POST",
      headers: {
        idtoken: await auth.currentUser.getIdToken(),
      },
      body: JSON.stringify({
        playlistTitle: playlistTitle,
        playlistID: playlistID,
        uid: auth.currentUser.uid,
        destinationPlatform: desinationPlatform,
        destinationPlaylistID: destinationPlaylistID,
        destinationPlaylistTitle: destinationPlaylistTitle,
      }),
    }
  );
  return result;
}

/**
 * Creates external track objects from a spotify playlist
 * @param {any} playlistID :string
 * @param {any} accessToken :SpotifyAccessToken
 * @returns {any} `ExternalTrack[]`
 */

export async function getExternalTracksFromSpotifyPlaylist(
  playlistID: string,
  accessToken: SpotifyAccessToken
): Promise<ExternalTrack[]> {
  const result = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistID}/tracks?fields=items%28track%28id%2Cname%2Cexternal_ids%2C+artists%29%29`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken.access_token}`,
      },
    }
  );

  const response = await result.json();

  console.log("Initial: ", JSON.stringify(response));

  // try to convert tracks into `SpotifyPlaylistExternalIDS` object
  //const tracks = JSON.parse(response);

  const playlistExternalTracks: ExternalTrack[] = response.items.map(
    (data: any) => {
      const trackData: ExternalTrack = {
        // We are only reading the artist info from the first item in the array
        // There could be multiple artists, however this seems fine
        artist: {
          id: data.track.artists[0].id,
          name: data.track.artists[0].name,
        },
        title: data.track.name,
        platform_of_origin: "spotify",
        platform_id: data.track.id,
        external_ids: { ...data.track.external_ids },
      };
      return trackData;
    }
  );

  return playlistExternalTracks;
}

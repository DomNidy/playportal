import {
  SpotifyAccessToken,
  SpotifyModificationBody,
} from "@/definitions/SpotifyInterfaces";
import {
  PlaylistModificationPayload,
  ValidModifications,
} from "@/definitions/UserInterfaces";
import { YoutubeAccessToken } from "@/definitions/YoutubeInterfaces";
import { google } from "googleapis";

/**
 * Description
 * @param {any} playlistModificationPayload An object to test if it is a valid `PlaylistModificationPayload`
 * @returns {any} `true` if the provided object is valid `false` if it is not valid
 */
export function validateIsPlaylistModificationPayload(
  playlistModificationPayload: any
): true | false {
  try {
    // Check if we were passed an object
    const isObject = playlistModificationPayload instanceof Object;

    // Check if we were provided a playlist id
    const hasPlaylistID = playlistModificationPayload.playlist_id;

    // Check if we were provided modifications
    // At least 1 modification must be present
    const hasAtLeastOneModification =
      Object.keys(playlistModificationPayload.modifications).length >= 1;

    // List of the modifications present in payload
    const providedModifications = Object.keys(
      playlistModificationPayload.modifications
    );

    // If any of the provided modifications are invalid, return false
    for (let i = 0; i < providedModifications.length; i++) {
      if (!ValidModifications.includes(providedModifications[i])) {
        console.log(
          `Modification key '${providedModifications[i]}' is not valid`
        );
        return false;
      }
    }

    return isObject && hasPlaylistID && hasAtLeastOneModification;
  } catch (err) {
    console.log("Error validating PlaylistModificationPayload", err);
    return false;
  }
}

// Used to make objects indexable with strings
interface IDictionairy {
  [index: string]: any;
}

// This maps modification keys we use in our api to the modification keys spotify uses in their api
// Basically, whats happening here is we are converting the keys on our api
// (ex. "title" changes the playlist title) to their platform-specific equivalent (ex "title" -> "name")
// For reference https://developer.spotify.com/documentation/web-api/reference/change-playlist-details
// Update: Why the hell did I make this ? Could I not have just made the object inline, doing the mapping manually like so:
/**
 * Example:
 *
 * {
 *    name: payload.modifications.title,
 *    description: payload.modifications.description
 * }
 *
 * I may be slightly foolish
 */
const SpotifyPlaylistModificationMap: IDictionairy = {
  title: "name",
  description: "description",
  public: "public",
};

export async function applySpotifyModifications(
  payload: PlaylistModificationPayload,
  accessToken: SpotifyAccessToken
) {
  const mappedOptions = Object.keys(payload.modifications).reduce(
    (result: IDictionairy, mod) => {
      // Map the mod key to the platform-relative equivalent
      const mappedKey = SpotifyPlaylistModificationMap[mod];
      if (mappedKey) {
        result[mappedKey] = payload.modifications[mod];
      }
      return result;
    },
    {}
  );

  // Send the modification request
  const modifyResponse = await modifySpotifyPlaylist(
    mappedOptions,
    payload.playlist_id,
    accessToken
  );

  return modifyResponse;
}

/**
 * Changes the title of a spotify playlist
 * @param {any} newTitle The title specified playlist will be changed to
 * @param {any} playlistID The id of the playlist
 * @returns {any} `Promise<true>` on success, returns a json object on failure detailing the error from spotify
 */
async function modifySpotifyPlaylist(
  modificationOptions: SpotifyModificationBody,
  playlistID: string,
  accessToken: SpotifyAccessToken
): Promise<any> {
  try {
    console.log(`Attempting to rename spotify playlist ${playlistID} `);

    // Send request to spotify api
    const result = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistID}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(modificationOptions),
      }
    );

    // If we successfully applied modifications to the playlist
    if (result.ok) {
      console.log(`Successfully modified Spotify playlist ${playlistID}!`);
      return true;
    }

    // Read the request body as it failed
    const failedRequest = await result.json();

    console.log(
      JSON.stringify(failedRequest),
      "Failed request to modify playlist"
    );

    return failedRequest;
  } catch (err) {
    console.log(err);
  }
}

export async function applyYoutubeModifications(
  payload: PlaylistModificationPayload,
  accessToken: YoutubeAccessToken
) {
  try {
    const youtube = google.youtube("v3");

    // TODO: Ensure we send the already-existing snippet properties (aside from the ones we want to change)
    // TODO: The youtube api requires that we send all properties of snippet
    // TODO: If we do not receieve a description from the user, and the user has a description already, their current one will be overwritten
    // TODO: https://developers.google.com/youtube/v3/docs/playlists/update
    const modifyPlaylistRequest = await youtube.playlists.update({
      part: ["snippet", "status"],
      access_token: accessToken.access_token,

      requestBody: {
        id: payload.playlist_id,
        snippet: {
          title: payload.modifications.title,
          description: payload.modifications.description,
        },
      },
    });

    if (modifyPlaylistRequest.status == 200) {
      console.log(
        `Successfully modified Youtube playlist ${payload.playlist_id}`
      );
      return true;
    }

    // Read request body

    console.log(
      `Modify playlist request failed, status ${modifyPlaylistRequest.status}`,
      modifyPlaylistRequest
    );
    return false;
  } catch (err) {
    console.log(err);
  }
}

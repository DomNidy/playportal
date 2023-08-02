import { SpotifyAccessToken } from "@/app/interfaces/SpotifyInterfaces";
import {
  PlaylistModificationPayload,
  ValidModifications,
} from "@/app/interfaces/UserInterfaces";

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

// This maps modification keys to the functions that perform the modifications
// * The order of the parameters is important for these functions
// * The modification key should be first, playlist_id second, accessToken last
const SpotifyPlaylistModificationMap: IDictionairy = {
  title: (
    newTitle: string,
    playlistID: string,
    accessToken: SpotifyAccessToken
  ) => modifySpotifyPlaylistTitle(newTitle, playlistID, accessToken),
  description: () => console.log("Change desc function"),
};

export async function applySpotifyModifications(
  payload: PlaylistModificationPayload,
  accessToken: SpotifyAccessToken
) {
  Object.keys(payload.modifications).forEach((mod) => {
    SpotifyPlaylistModificationMap[mod](
      payload.modifications[mod],
      payload.playlist_id,
      accessToken
    );
  });
}

/**
 * Changes the title of a spotify playlist
 * @param {any} newTitle The title specified playlist will be changed to
 * @param {any} playlistID The id of the playlist
 * @returns {any} `Promise<void>` on success, throws an error on failure
 */
async function modifySpotifyPlaylistTitle(
  newTitle: string,
  playlistID: string,
  accessToken: SpotifyAccessToken
) {
  try {
    // Change spotify playlist title here
    console.log(
      `Attempting to rename spotify playlist ${playlistID} to ${newTitle}`
    );

    // Send request to spotify api
    const result = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistID}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newTitle,
        }),
      }
    );

    if (result.ok) {
      console.log(
        `Successfully renamed Spotify playlist ${playlistID} to ${newTitle}!`
      );
    }
    console.log(await result.text(), " response of playlist modification");
  } catch (err) {
    console.log(err);
  }
}

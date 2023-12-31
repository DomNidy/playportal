import {
  ExternalTrack,
  LogTypes,
  SpotifyTrackObject,
  TransferLog,
} from "@/definitions/MigrationService";
import { SpotifyAccessToken } from "@/definitions/SpotifyInterfaces";
import { YoutubeAccessToken } from "@/definitions/YoutubeInterfaces";
import { google, youtube_v3 } from "googleapis";
import {
  iso8601DateToMilliseconds,
  iso8601DurationToMilliseconds,
} from "../utility/FormatDate";
import { chunkArray } from "../utils";
import { firestore } from "../firestore";
import { Platforms } from "@/definitions/Enums";
import { getFirebaseAdminApp } from "../auth/Utility";

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
  const limit = 50;
  let offset = 0;

  let responses = [];

  const initialRequest = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistID}/tracks?fields=${encodeURIComponent(
      "items(track(name,id,artists.name,artists.id,duration_ms,external_ids, album(name,release_date,release_date_precision)))"
    )}&limit=${limit}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken.access_token}`,
      },
    }
  );

  responses.push(await initialRequest.json());

  // While the most recent response has an items array length equal to that of the limit, send out requests
  while (responses.at(-1).items.length === limit) {
    // Increment the offset by the limit
    offset += limit;
    console.log(
      "Sending request to url",
      `https://api.spotify.com/v1/playlists/${playlistID}/tracks?fields=${encodeURIComponent(
        "items(track(name,id,artists.name,artists.id,duration_ms, external_ids, album(name,release_date,release_date_precision)))"
      )}&limit=${limit}&offset=${offset}`
    );

    responses.push(
      await fetch(
        `https://api.spotify.com/v1/playlists/${playlistID}/tracks?fields=${encodeURIComponent(
          "items(track(name,id,artists.name,artists.id,duration_ms, external_ids, album(name,release_date,release_date_precision)))"
        )}&limit=${limit}&offset=${offset}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken.access_token}`,
          },
        }
      ).then(async (res) => await res.json())
    );
  }

  console.log(JSON.stringify(responses));

  // try to convert tracks into `SpotifyPlaylistExternalIDS` object
  const playlistExternalTracks: ExternalTrack[] = responses.flatMap(
    (response) =>
      response.items.map((data: any) => {
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
          duration_ms: data.track.duration_ms,
          release_date_ms: iso8601DateToMilliseconds(
            data.track.album.release_date
          ),
        };
        return trackData;
      })
  );

  console.log("All external tracks", JSON.stringify(playlistExternalTracks));

  return playlistExternalTracks;
}
/**
 * Creates external track objects from a youtube playlist
 * @param {any} playlistID :string
 * @param {any} accessToken `YoutubeAccessToken`
 * @returns {any} `ExternalTrack[]`
 */

export async function getExternalTracksFromYoutubePlaylist(
  playlistID: string,
  accessToken: YoutubeAccessToken
): Promise<ExternalTrack[] | undefined> {
  try {
    // Create youtube api client
    const youtube = google.youtube("v3");

    // This is an array of all our playlist requests, as youtube has a maxresults of 50 per request
    // Each request is stored in this array.
    const allRequestPages: youtube_v3.Schema$PlaylistItemListResponse[] = [];

    // Request the playlist items

    const initialPlaylistRequest = await youtube.playlistItems.list({
      part: ["contentDetails"],
      access_token: accessToken.access_token,
      playlistId: playlistID,
      maxResults: 50,
    });

    let nextPageToken = initialPlaylistRequest.data.nextPageToken;

    // Add the initial request to request pages array
    allRequestPages.push(initialPlaylistRequest.data);

    // Check if we have more data to fetch (if a nextPageToken exists)
    while (nextPageToken) {
      console.log(
        "We have a next page token, sending out another request",
        nextPageToken
      );
      const playlistRequest = await youtube.playlistItems.list({
        part: ["contentDetails"],
        access_token: accessToken.access_token,
        playlistId: playlistID,
        pageToken: nextPageToken,
        maxResults: 50,
      });

      allRequestPages.push(playlistRequest.data);

      nextPageToken = playlistRequest.data.nextPageToken;
    }

    // For every item in the playlist, request the Videos.list endpoint so we can get the duration of the track
    // In the future, maybe try to restrict this feature to certain users (premium or whatever idk)
    // The Videos.list endpoint is 1 quota cost (per video)
    let playlistExternalTracks: ExternalTrack[] | undefined = [];

    for (let i = 0; i < allRequestPages.length; i++) {
      while (allRequestPages[i].items?.length) {
        // Splice 30 video ids from items
        const idsToRequest = allRequestPages[i].items
          ?.splice(0, 30)
          .map((item) => {
            console.log(item.contentDetails);
            return item.contentDetails?.videoId || "";
          });

        console.log("\nSpliced video ids", idsToRequest);

        // Request video.list endpoint
        const videoRequest = await youtube.videos.list({
          part: ["contentDetails", "id", "snippet", "status"],
          access_token: accessToken.access_token,
          id: idsToRequest,
        });

        // Create external tracks for each item
        videoRequest.data.items?.forEach((item, idx) => {
          console.log(JSON.stringify(item), "Item:", idx);

          playlistExternalTracks?.push({
            // We are only reading the artist info from the first item in the array
            // There could be multiple artists, however this seems fine
            artist: {
              id: item.snippet?.channelId!,
              name: item.snippet?.channelTitle!,
            },
            title: item.snippet?.title!,
            platform_of_origin: "youtube",
            platform_id: item.id!,
            // As of right now, we have no way of getting external ids from youtube tracks, so we just pass an empty object
            external_ids: {},
            description: item.snippet?.description!,
            release_date_ms: iso8601DateToMilliseconds(
              item.snippet?.publishedAt!
            ),
            duration_ms: iso8601DurationToMilliseconds(
              item.contentDetails?.duration || "PT0M1S"
            ),
          });
        });
      }
    }

    console.log(`All request pages ${JSON.stringify(allRequestPages)} array.`);

    playlistExternalTracks?.forEach((track, idx) =>
      console.log(`Track ${idx}: ${JSON.stringify(track)}\n\n`)
    );

    return playlistExternalTracks;
  } catch (err) {
    console.log(
      `An error occured while creating external tracks from youtube playlist: ${err}`
    );
  }
}

/**
 * Creates an array of external tracks given a list of spotify ids
 * @param {any} platformIDS:string[]
 * @param {any} accessToken:SpotifyAccessToken
 * @returns {any}
 */
export async function getExternalTracksFromSpotifyTrackIDS(
  platformIDS: string[],
  accessToken: SpotifyAccessToken
): Promise<ExternalTrack[] | undefined> {
  // Split up track ids into subarrays of 50 items (spotify api only supports fetching data for up to 50 tracks at once)
  const chunkedSpotifyIDS = chunkArray(platformIDS, 50);

  // Store responses from spotify
  const spotifyResponses: SpotifyTrackObject[][] = [];

  // Request each chunk of spotify ids and add the responses to responses array
  for (let i = 0; i < chunkedSpotifyIDS.length; i++) {
    const trackIDSToFetch = chunkedSpotifyIDS[i].join(",");

    console.log(
      "Fetching spotify track data for the following track ids",
      trackIDSToFetch
    );

    const request = await fetch(
      `https://api.spotify.com/v1/tracks?ids=${trackIDSToFetch}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken.access_token}`,
        },
      }
    );

    if (request.ok) {
      const requestJSON: SpotifyTrackObject[] = (await request.json()).tracks;

      console.log("Request json", JSON.stringify(requestJSON));
      spotifyResponses.push(requestJSON);
    } else {
      console.log("Spotify request was bad");
      console.log("Request json", JSON.stringify(await request.json()));
    }

    // Loop through all responses and create external tracks
    const externalTracks: ExternalTrack[] = spotifyResponses.flatMap(
      (response) =>
        response.map((track) => {
          console.log("Creating track from", JSON.stringify(track));
          return {
            artist: {
              id: track.artists.map((artist) => artist.id).join(),
              name: track.artists.map((artist) => artist.name).join(", "),
            },
            external_ids: { ...track.external_ids },
            platform_id: `spotify:track:${track.id}`,
            platform_of_origin: "spotify",
            title: track.name,
            ...(track?.album.images &&
              track.album.images.length > 0 &&
              track.album.images[0] && {
                image: {
                  url: track.album.images[0].url,
                  width: track.album.images[0].width || 150,
                  height: track.album.images[0].height || 150,
                },
              }),
          } as ExternalTrack;
        })
    );

    return externalTracks || undefined;
  }
}

/**
 * Creates an array of external track objects given an array of youtube video ids
 * @param {any} platformID:string
 * @param {any} accessToken:YoutubeAccessToken
 * @returns {any}
 */
export async function getExternalTracksFromYoutubeTracks(
  platformIDS: string[],
  accessToken: YoutubeAccessToken,
  operationID: string
): Promise<ExternalTrack[] | undefined> {
  // Need to get: video title, thumbnail url

  // Create youtube api client
  const youtube = google.youtube("v3");

  // Array to store created ExternalTrack objects in
  const externalTracks: ExternalTrack[] = [];

  // Send request to youtube api for video metadata
  const videoData = await youtube.videos.list({
    id: platformIDS,
    part: ["snippet"],
    access_token: accessToken.access_token,
  });

  // If video data response was empty or invalid, return
  if (!videoData?.data?.items) {
    return undefined;
  }

  videoData.data.items.forEach((video) => {
    externalTracks.push({
      artist: {
        name: video.snippet?.channelTitle || "Unknown Channel",
        id: video.snippet?.channelId || "Unknown Channel ID",
      },
      external_ids: {},
      platform_id: video.id || "Unknown Video ID",
      platform_of_origin: Platforms.YOUTUBE,
      title: video.snippet?.title || "Unknown Video Title",
      ...((video.snippet?.thumbnails?.default?.url && {
        image: {
          height: video.snippet.thumbnails.default.height || 150,
          width: video.snippet.thumbnails.default.width || 150,
          url: video.snippet.thumbnails.default.url,
        },
      }) ||
        (video.snippet?.thumbnails?.medium?.url && {
          image: {
            height: video.snippet.thumbnails.medium.height || 150,
            width: video.snippet.thumbnails.medium.width || 150,
            url: video.snippet.thumbnails.medium.url,
          },
        }) ||
        (video.snippet?.thumbnails?.high?.url && {
          image: {
            height: video.snippet.thumbnails.high.height || 150,
            width: video.snippet.thumbnails.high.width || 150,
            url: video.snippet.thumbnails.high.url,
          },
        })),
    });
  });

  // Update the data of the operation logs in both firestore and realtime
  await updateFirestoreTrackLogsWithMetadata(operationID, externalTracks);
  await updateRealtimeDBTrackLogsWithMetadata(operationID, externalTracks);

  return externalTracks;
}

/**
 * Updates all track logs of an operation in firestore with the properties of its ExternalTrack
 *
 * This is used to update track logs after metadata has already been fetched (so that we don't need to fetch it again)
 * @param {any} operationID:string
 * @param {any} externalTrackData:ExternalTrack[] contains the metadata that will be added to the TrackLog object with the same platformID
 * @returns {any}
 */
export async function updateFirestoreTrackLogsWithMetadata(
  operationID: string,
  externalTrackData: ExternalTrack[]
) {
  // Get all transfer logs from the operation document
  const transferLogs = (
    await firestore.doc(`operations/${operationID}`).get()
  ).data()?.logs as TransferLog[];

  // If we were unable to get transfer logs, throw an error
  if (!transferLogs) {
    throw new Error(
      `Unable to read transfer logs in operation document: ${operationID}`
    );
  }

  // Filtering message logs
  const messageLogs = transferLogs.filter(
    (log) => log.kind === LogTypes.MESSAGE
  );

  // Create a hashtable to map platform ids to the track log
  // We do this so we can easily lookup the log which cooresponds to the platform id in our externalTrackData array
  const trackIDToTrackLogMap = new Map<string, TransferLog>();

  // We wont update the message logs at all, so we'll include them in this array from the start
  const updatedTransferLogs: TransferLog[] = [...messageLogs];

  // Add each transferLog to the trackID:transferLog mapping
  for (const transferLog of transferLogs) {
    // If the transferLog.item property type is that of an object, this is a track log
    if (
      typeof transferLog.item === "object" &&
      transferLog.item.platformID &&
      (transferLog.kind == LogTypes.MATCHING ||
        transferLog.kind == LogTypes.NOT_MATCHING)
    ) {
      const platformID = transferLog.item.platformID;
      trackIDToTrackLogMap.set(platformID, transferLog);
    }
  }

  // Update the properties of the transferLog with matching platform ids,with the properties of externalTrack
  for (const externalTrack of externalTrackData) {
    // If the track mapping contains the platform id of the external track
    if (trackIDToTrackLogMap.get(externalTrack.platform_id)) {
      // Create a new object with the TransferLog data properties and the external track properties merged together
      const newLog: TransferLog & ExternalTrack & { fetched: boolean } = {
        ...trackIDToTrackLogMap.get(externalTrack.platform_id)!,
        ...externalTrack,
        // Include the fetched property so we don't re fetch data for these track
        fetched: true,
      };
      updatedTransferLogs.push(newLog);
    }
  }

  console.log(`Updating track log metadata for operation id ${operationID}`);
  console.log(
    trackIDToTrackLogMap,
    "trackIDToTrackLogMap for firestore update"
  );
  console.log(
    JSON.stringify(updatedTransferLogs),
    "updatedTransferLogs for firestore update"
  );
  console.log(
    JSON.stringify(externalTrackData),
    "externalTrackData for firestore update"
  );
  // Update the logs in firestore
  firestore.doc(`operations/${operationID}`).update({
    logs: updatedTransferLogs,
  });
}

/**
 * Updates metadata of track logs in realtime db for specified operation with provided external track data
 * @param {any} operationID:string
 * @param {any} externalTrackData:ExternalTrack[]
 * @returns {any}
 */
async function updateRealtimeDBTrackLogsWithMetadata(
  operationID: string,
  externalTrackData: ExternalTrack[]
) {
  const adminApp = getFirebaseAdminApp();

  const realtimeDB = adminApp.database(
    "https://multi-migrate-default-rtdb.firebaseio.com/"
  );

  // Get realtime db logs
  const transferLogs = Object.values(
    (await realtimeDB.ref(`operations/${operationID}`).get()).val()?.logs
  ) as TransferLog[];

  if (!transferLogs) {
    console.log("No transfer logs found for operation ID", operationID);
    return;
  }

  console.log(transferLogs, "TRANSFERLOGS");

  // Filtering message logs
  const messageLogs = transferLogs.filter(
    (log) => log.kind === LogTypes.MESSAGE
  );

  // Create a hashtable to map platform ids to the track log
  // We do this so we can easily lookup the log which cooresponds to the platform id in our externalTrackData array
  const trackIDToTrackLogMap = new Map<string, TransferLog>();

  // We wont update the message logs at all, so we'll include them in this array from the start
  const updatedTransferLogs: TransferLog[] = [...messageLogs];

  // Add each transferLog to the trackID:transferLog mapping
  for (const transferLog of transferLogs) {
    // If the transferLog.item property type is that of an object, this is a track log
    if (
      typeof transferLog.item === "object" &&
      transferLog.item.platformID &&
      (transferLog.kind == LogTypes.MATCHING ||
        transferLog.kind == LogTypes.NOT_MATCHING)
    ) {
      const platformID = transferLog.item.platformID;
      trackIDToTrackLogMap.set(platformID, transferLog);
    }
  }

  // Update the properties of the transferLog with matching platform ids,with the properties of externalTrack
  for (const externalTrack of externalTrackData) {
    // If the track mapping contains the platform id of the external track
    if (trackIDToTrackLogMap.get(externalTrack.platform_id)) {
      // Create a new object with the TransferLog data properties and the external track properties merged together
      const newLog: TransferLog & ExternalTrack & { fetched: boolean } = {
        ...trackIDToTrackLogMap.get(externalTrack.platform_id)!,
        ...externalTrack,
        // Include the fetched property so we don't re fetch data for these track
        fetched: true,
      };
      updatedTransferLogs.push(newLog);
    }
  }

  console.log(`Updating track log metadata for operation id ${operationID}`);
  console.log("Data to update", JSON.stringify(updatedTransferLogs));

  realtimeDB.ref(`operations/${operationID}`).update({
    logs: updatedTransferLogs,
  });

  // Get all transfer logs from the operation document
}

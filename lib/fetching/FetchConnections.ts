import { youtube_v3 } from "googleapis";
import { GetBaseUrl } from "../utility/GetBaseUrl";
import { Auth } from "firebase/auth";
import { SpotifyUserProfile } from "@/definitions/SpotifyInterfaces";
import { Platforms, StorageKeys } from "@/definitions/Enums";
import { PROFILE_CACHE_EXPIRY_DURATION_MS } from "@/config";
import { LocalYoutubeChannel } from "@/definitions/YoutubeInterfaces";

/**
 * Fetches channel list from using a users token stored in firebase, after the list of channels is fetched, returns the first channel from the list
 *
 * If a cached profile is present in local storage, will not fetch a new one
 * ### Note: In the future if we wish to connect multiple channels from a single user this will need to be modified
 * @param {any} auth `Auth` instance
 * @returns {any} A `LocalYoutubeChannel` or `undefined`
 */

export async function fetchYoutubeProfile(
  auth: Auth
): Promise<LocalYoutubeChannel | undefined> {
  if (!auth?.currentUser) {
    return;
  }

  // Try to get cached profile
  const cachedProfile: LocalYoutubeChannel = JSON.parse(
    localStorage.getItem(StorageKeys.YOUTUBE_USER_PROFILE) || "{}"
  );

  // If the cached profile exists, and if it is not expired, return the cached profile
  if (cachedProfile.cache_expiry && cachedProfile.cache_expiry > Date.now()) {
    console.log("CACHE HIT on youtube profile fetch");
    return cachedProfile as LocalYoutubeChannel;
  }

  const request = await auth?.currentUser.getIdToken().then((idtoken) =>
    fetch(`${GetBaseUrl()}api/user/youtube?uid=${auth?.currentUser?.uid}`, {
      method: "POST",
      headers: {
        idtoken: idtoken,
      },
    })
  );

  // If fetching the youtube profile failed
  if (!request.ok) {
    console.log("Youtube profile fetch request failed");
    return undefined;
  }

  const youtubeProfileData: youtube_v3.Schema$ChannelListResponse = (
    await request.json()
  ).data;

  // Return the first entry from the list
  // TODO: Read up on youtube api and in what case multiple channels will be present in the response
  // TODO: After that I should revisit this code and implement handling for multiple channel
  if (youtubeProfileData.items?.at(0)) {
    // Cast channelObject to LocalYoutubeChannel
    const channelObject = youtubeProfileData.items.at(0) as LocalYoutubeChannel;
    // Set cache_expiry property
    channelObject.cache_expiry = Date.now() + PROFILE_CACHE_EXPIRY_DURATION_MS;
    // Cache the LocalYoutubeChannel object
    localStorage.setItem(
      StorageKeys.YOUTUBE_USER_PROFILE,
      JSON.stringify(channelObject)
    );

    return channelObject;
  }
}

/**
 * Fetches a users spotify profile
 *
 * If a cached profile is present in local storage, will not fetch a new one
 *
 * @param {any} auth an `Auth` instance
 * @returns {any} a `SpotifyUserProfile` or `undefined`
 */
export async function fetchSpotifyProfile(
  auth: Auth
): Promise<SpotifyUserProfile | undefined> {
  if (!auth?.currentUser) {
    return;
  }

  // Try to get cached profile
  const cachedProfile: SpotifyUserProfile = JSON.parse(
    localStorage.getItem(StorageKeys.SPOTIFY_USER_PROFILE) || "{}"
  );

  // If the cached profile exists, and if it is not expired, return the cached profile
  if (cachedProfile.cache_expiry && cachedProfile.cache_expiry > Date.now()) {
    console.log("CACHE HIT on spotify profile fetch");
    return cachedProfile as SpotifyUserProfile;
  }

  // Send request for spotify profile
  const request = await auth?.currentUser.getIdToken().then((idtoken) =>
    fetch(`${GetBaseUrl()}api/user/spotify?uid=${auth?.currentUser?.uid}`, {
      method: "POST",
      headers: {
        idtoken: idtoken,
      },
    })
  );

  if (!request.ok) {
    console.log("Spotify profile request failed", request);
    return undefined;
  }

  const spotifyProfileData: SpotifyUserProfile = await request.json();
  // Set profile to expire in cache in 10 minutes
  spotifyProfileData.cache_expiry =
    Date.now() + PROFILE_CACHE_EXPIRY_DURATION_MS;
  // Cache the newly fetched spotify profile in localStorage
  localStorage.setItem(
    StorageKeys.SPOTIFY_USER_PROFILE,
    JSON.stringify(spotifyProfileData)
  );

  return spotifyProfileData;
}

/**
 * Returns an object containing the profile of the user on each Platform, if the user does not have a platform connected, the key for the platform will have an undefined value
 * @param {any} auth:Auth
 * @returns {any}
 */

export async function fetchAllConnections(
  auth: Auth
): Promise<Record<Platforms, any>> {
  const youtubeProfile = fetchYoutubeProfile(auth);
  const spotifyProfile = fetchSpotifyProfile(auth);

  const [spotifyData, youtubeData] = await Promise.all([
    spotifyProfile,
    youtubeProfile,
  ]);

  const allProfiles = {
    spotify: spotifyData || undefined,
    youtube: youtubeData || undefined,
  };

  return allProfiles;
}

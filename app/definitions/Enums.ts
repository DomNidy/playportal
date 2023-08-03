/**
 * Contains the names of URL params we use throughout our code
 * - `SPOTIFY_TEMP_KEY_PARAM` = "ts"
 * - `YOUTUBE_TEMP_KEY_PARAM` = "tk"
 */
export enum URLParamNames {
  /**
   * This URL param contains the `state` used throughout the OAuth flow for spotify,
   * We also use this param for naming the `SpotifyAccessToken` document name
   */
  SPOTIFY_TEMP_KEY_PARAM = "ts",
  /**
   * This URL param contains the temp key used to name the `YoutubeAccessToken` document
   */
  YOUTUBE_TEMP_KEY_PARAM = "tk",
}

/**
 * Contains the names of collections in firestore
 * - `SPOTIFY_ACCESS_TOKENS` = "SpotifyAccessTokens"
 * - `YOUTUBE_ACCESS_TOKENS` = "YoutubeAccessTokens"
 * - `USERS` = "users"
 */
export enum FirestoreCollectionNames {
  /**
   * We store our `EncryptedSpotifyAccessTokens` here
   */
  SPOTIFY_ACCESS_TOKENS = "SpotifyAccessTokens",
  /**
   * We store our `EncryptedYoutubeAccessTokens` here
   */
  YOUTUBE_ACCESS_TOKENS = "YoutubeAccessTokens",
  /**
   * We store our user documents here
   */
  USERS = "users",
}

export enum StorageKeys {
  // Authorization code returned from server
  SPOTIFY_CODE = "code",
  // The code challenge, the transformed (hashed) version of the code verifier
  SPOTIFY_CODE_CHALLENGE = "challenge",
  // The code verifier, the random string of chars and numbers that will be hashed to generate the code challenge
  SPOTIFY_CODE_VERIFIER = "verifier",
  // The access token returned from spotify server which we can use to make requests on a users behalf
  SPOTIFY_ACCESS_TOKEN = "accessToken",
  // The user profile object returned from spotify
  SPOTIFY_USER_PROFILE = "spotifyUserProfile",
  // The user profile object returned from spotify
  YOUTUBE_USER_PROFILE = "youtubeProfile",
}

/**
 * This stores the names of supported platforms in strings, used in playlist modification components and whatnot
 */
export enum Platforms {
  SPOTIFY = "spotify",
  YOUTUBE = "youtube",
}

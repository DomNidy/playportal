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

import { youtube_v3 } from "googleapis";

export interface YoutubeAccessToken {
  access_token: string;
  refresh_token: string;
  scope: string;
  id_token: string;
  expiry_date: number;
}

export interface EncryptedYoutubeAccessToken {
  encrypted: string;
  iv: string;
}

/**
 * This is the `youtube_v3.Schema$Channel` interface extended with a `cache_expiry` property
 */
export interface LocalYoutubeChannel extends youtube_v3.Schema$Channel {
  cache_expiry: number;
}

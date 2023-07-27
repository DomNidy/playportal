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

export interface SpotifyUserProfile {
  country: string;
  display_name: string;
  email: string;
  explicit_content: {
    filter_enabled: boolean;
    filter_locked: boolean;
  };
  external_urls: { spotify: string };
  followers: { href: string; total: number };
  href: string;
  id: string;
  images: Image[];
  product: string;
  type: string;
  uri: string;
  // This is a custom field not retreieved from the spotify api, this is just the timestamp of when the locally stored profile should expire
  cache_expiry: number | undefined;
}

interface Image {
  url: string;
  height: number;
  width: number;
}

// A spotify user who owns something (typically a playlist)
interface Owner {
  external_urls: { spotify: string };
  followers: { href: string | null; total: number };
  href: string;
  id: string;
  type: string;
  uri: string;
  display_name: string;
}

// Structure of a response containing playlists on a users account (not an individual playlist, this is contains the individual playlists)
export interface UserSpotifyPlaylists {
  href: string;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
  items: SpotifySimplifiedPlaylistObject[];
}

// A simplified playlist representation retured from spotify api
export interface SpotifySimplifiedPlaylistObject {
  collaborative: boolean;
  description: string | null;
  external_urls: { spotify: string };
  // this href is a link to the api endpoint which will provide full details of this playlist
  href: string;
  id: string;
  images: Image[];
  name: string;
  owner: Owner;
  public: boolean;
  snapshot_id: string;
  // A collection containing a link ( href ) to the Web API endpoint where full details of the playlist's tracks can be retrieved,
  // along with the total number of tracks in the playlist. Note, a track object may be null. This can happen if a track is no longer available.
  tracks: {
    href: string;
    total: number;
  };
  url: string;
}

export interface SpotifyAccessToken {
  expires_in: number;
  access_token: string;
  token_type: string;
  scope: string;
  refresh_token: string;
}

export interface EncryptedSpotifyAccessToken {
  encrypted: string;
  iv: string;
}

export interface SpotifyModificationBody {
  name?: string;
  public?: boolean;
  collaborative?: boolean;
  description?: string;
}


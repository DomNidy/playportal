// Names of the keys used in local storage
export enum StorageKeys {
  // Authorization code returned from server
  CODE = "code",
  // The code challenge, the transformed (hashed) version of the code verifier
  CODE_CHALLENGE = "challenge",
  // The code verifier, the random string of chars and numbers that will be hashed to generate the code challenge
  CODE_VERIFIER = "verifier",
  // The access token returned from spotify server which we can use to make requests on a users behalf
  ACCESS_TOKEN = "accessToken",
  // The user profile object returned from spotify
  USER_PROFILE = "userProfile",
}

export interface UserProfile {
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
export interface UserPlaylists {
  href: string;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
  items: SimplifiedPlaylistObject[];
}

// A simplified playlist representation retured from spotify api
export interface SimplifiedPlaylistObject {
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

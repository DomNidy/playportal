import { Platforms } from "./Enums";

// Used for drop down select items
export type PlaylistSelectItem = {
  name: string;
  playlistID: string;
  image_url: string;
  platform: Platforms;
  playlist_url: string | undefined;
  track_count: number;
};

// Stores the playlists we've fetched
export type PlaylistsPlatformMap = {
  youtube: PlaylistSelectItem[];
  spotify: PlaylistSelectItem[];
};

// Wow, i look like a typescript pro now huh ?
export type IndexablePlaylistsPlatformMap = {
  [platform: string]: PlaylistSelectItem[];
} & Partial<PlaylistsPlatformMap>;

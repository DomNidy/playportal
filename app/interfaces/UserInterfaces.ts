/**
 * This interface specifies the shape of our user permissions (the requests users are allowed (or not allowed) to make)
 */
type UserPerms = {
  [property: string]: boolean | undefined;
  canConnectSpotify?: boolean;
  canRefreshSpotifyPlaylists?: boolean;
};

interface UserPermissionError {
  errorMessage: string;
  permissionLacked?: string;
}

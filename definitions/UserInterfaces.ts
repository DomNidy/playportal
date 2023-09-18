import { Platforms } from "./Enums";

/**
 * This interface specifies the shape of our user permissions (the requests users are allowed (or not allowed) to make)
 */
export type UserPerms = {
  [property: string]: boolean | undefined;
  canConnectSpotify?: boolean;
  canRefreshSpotifyPlaylists?: boolean;
  canModifySpotifyPlaylists?: boolean;
};

export interface UserPermissionError {
  errorMessage: string;
  permissionLacked?: string;
}

// Used to make objects indexable with strings
interface IDictionairy {
  [index: string]: any;
}

export interface PlaylistModificationPayload {
  playlist_id: string;
  // This modifications object specifices what the user wants to modify about the playlist
  // Properties are optional, if they are present in the payload, we will modify the playlist..
  // updating the properties of the playlist to the provided properties.
  // Note: atleast 1 modification must be present to be considered a valid payload
  modifications: PlaylistModificationOptions;
}

interface PlaylistModificationOptions extends IDictionairy {
  title?: string;
  description?: string;
  public?: string;
  collaborative?: string;
}

// The keys that are valid modifications
export const ValidModifications = [
  "title",
  "description",
  "public",
  "collaborative",
];

export type NotificationType = {
  id: string;
  type: "success" | "error" | "neutral";
  title: string;
  message: string;
  seen: true | false;
  /**
   * The timestamp when the action that caused this notification to be created occured
   */
  createdAtMS: number;
  /**
   * The uuid of the receiver of this notification
   */
  recipientUUID: string;
  /**
   * Should this notification create a popup on the client ui when it is received by the user?
   */
  shouldPopup?: true | false;
};

/**
 * The state that the transfer form is in
 */
export enum TransferFormStates {
  SELECTING_ORIGIN_PLATFORM = 1,
  SELECTING_ORIGIN_PLAYLIST = 2,
  SELECTING_DESTINATION_PLATFORM = 3,
  SELECTING_DESTINATION_PLAYLIST = 4,
  REVIEWING_TRANSFER = 5,
  VIEWING_TRANSFER_STATUS = 6,
}

/**
 * A type containing all necessary properties to create the title state at all stages of the transfer form
 */
export type TransferFormStateProperties = {
  origin?: {
    platform: Platforms;
    playlistTitle?: string;
    playlistID?: string;
  };
  destination?: {
    platform: Platforms;
    playlistTitle?: string;
    playlistID?: string;
  };
};

/**
 *  The header text (title) and description of the transfer form window
 **/
export type TransferFormTitleState = {
  title: string;
  description: string;
};

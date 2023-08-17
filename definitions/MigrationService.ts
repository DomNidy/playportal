// These definitions define types that we will pass to our song migration service

import { Timestamp } from "firebase/firestore";
import { Platforms } from "./Enums";

/**
 *  This status property describes the current state of the transfer
 *
 * ### Status codes explanation:
 *
 * `'processing'` - We are processing the transfer (validating access tokens, id, all  that stuff)
 *
 * `'user_paused_transfer'` - The user manually paused the transfer, we will pause the entire transfer process until it is resumed. (including looking up songs)
 *
 * `'user_aborted_transfer'` - The user manually aborted the transfer, this transfer will never resume (we can mark this for deletion)
 *
 * `'user_exceeded_quota'` - The user has exceeded their quota (the maximum amount of tracks we allow them to transfer), this transfer will be paused until their quota is sufficient (and they resume it)
 *
 * `'lookup_in_progress'` - The transfer is currently in progress, (we are looking up the songs on destination platform)
 *
 * `'insertion_in_progress'` - The transfer is currently in progress, (we are inserting songs into the destination playlist)
 *
 * `'we_exceeded_quota'` - We (playportal) have exceeded our quota for a platform api assosciated with this transfer, and cannot process this transfer until our quota refreshed. (Our transfer will remain paused until the user resumes it)
 *
 * '`completed`' - Operation has finished processing
 */
export enum OperationStates {
  PROCESSING = "processing",
  USER_PAUSED = "user_paused_transfer",
  USER_ABORTED = "user_aborted_transfer",
  USER_EXCEEDED_QUOTA = "user_exceeded_quota",
  INSERTING_IN_PROGRESS = "insertion_in_progress",
  LOOKUP_IN_PROGRESS = "lookup_in_progress",
  WE_EXCEEDED_QUOTA = "we_exceeded_quota",
  COMPLETED = "completed",
}

/**
 * Represents a single song from ANY platform
 */
export type ExternalTrack = {
  /**
   * The platform which we received this track from
   */
  platform_of_origin: "spotify" | "youtube";
  /**
   * The id of this track on its platform of origin
   */
  platform_id: string;
  /**
   * Title of the track
   */
  title: string;
  /**
   * Description of the track on the platform of origin (if applicable)
   * ### For youtube some songs we will be able to parse the content owner from the description, example
   *
   * Parsable youtube description:
   *
   * `'Provided to YouTube by Live Nation Inc.\n\nMother · Porter Robinson\n\nNurture\n\n℗ Sample Sized LLC Under Exclusive License to Mom+Pop\n\nReleased on: 2021-04-23\n\nMusic  Publisher: Porter Robinson\nComposer, Lyricist: Porter Robinson\n\nAuto-generated by YouTube.'`
   */
  description?: string;
  /**
   * The date at which the provided track was published on the platform of origin
   */
  publishedAt?: string;
  /**
   * This contains information about the artist on the platform of origin
   */
  artist: {
    name?: string;
    id?: string;
  };
  /**
   * These are the external ids that will be used to find the track on platforms other than the platform of origin
   */
  external_ids: {
    isrc?: string;
    ean?: string;
    upc?: string;
  };
};

/**
 * This defines the structure of a `MigrationsPlaylistTransferRequestBody` object
 *
 * This object will be sent (in the body) and received by the migrations serivce
 */
export type MigrationsPlaylistTransferRequestBody = {
  /**
   * Describes the origin (where the tracks we are transferring come from)
   */
  origin: {
    // The platform the songs come from
    platform: Platforms;
    // The id of the playlist on the origin platform that the tracks come from
    playlist_id: string;
    // Title of the origin playlist
    playlist_title: string;
  };
  /**
   * Describes the destination we are transfering a playlist to
   */
  destination: {
    /**
     * The platform we are transfering the playlist to
     */
    platform: Platforms;
    /**
     * The id of the playlist we wish to transfer tracks into (on the destination platform)
     */
    playlist_id: string;
    // Title of the destination playlist
    playlist_title: string;
  };
  /**
   * An array of `ExternalTrack` objects, these will be transfered into the `destination`
   */
  tracks: ExternalTrack[];
};

/**
 * These objects will be represented in the transfer operations table, this data will be shown to the end user
 */
export type TransferTableData = {
  status: OperationStates;
  operationID: string;
  info: OperationTransferInfo;
};

type OperationTransferInfo = {
  operationID: string;
  startedAt: { _seconds: number; _nanoseconds: number };
  originPlatform: string;
  originPlaylistName: string;
  originPlaylistID: string;
  originPlaylistLink: string;
  originPlaylistCoverImageURL: string;
  destinationPlatform: string;
  destinationPlaylistName: string;
  destinationPlaylistID: string;
  destinationPlaylistLink: string;
  destinationPlaylistCoverImageURL: string;
  amountOfSongsToTransfer: string;
};

export type OperationTransfer = {
  status: OperationTransferStatus;
  info: OperationTransferInfo;
  logs?: OperationLog[];
};

/**
 * Contains information about an operation without the logs
 */
export type OperationTransferSimple = {
  status: OperationTransferStatus;
  info: OperationTransferInfo;
};

/**
 * This is the shape of the object that will be written to the database and send to the user in order to view the
 * status of a playlist transfer
 */
export type OperationTransferStatus = {
  status: OperationTransferStatus;
  operationID: string;
  completedTracks?: CompletedTransferTrackStatus[];
  pendingTracks?: PendingTransferTrackStatus[];
  failedTracks?: FailedTransferTrackStatus[];
};

/**
 * The shape of an object which has been successfully transferred
 */
type CompletedTransferTrackStatus = {
  // Name of the track (on origin platform)
  title: string;
  // ID of the track on its platform of origin
  originTrackID: string;
  // ID of the track on the destination platform
  destinationTrackID: string;
  // Timestamp at which this track was successfully inserted into the destination playlist
  completedAt: number;
};

/**
 * The shape of an object which has not yet been transferred
 */
type PendingTransferTrackStatus = {
  // Name of the track (on origin platform)
  title: string;
  // ID of the track on its platform of origin
  originTrackID: string;
};

/**
 * The shape of an object which has failed the transfer process
 */
type FailedTransferTrackStatus = {
  // Name of the track (on origin platform)
  title: string;
  // ID of the track on its platform of origin
  originTrackID: string;
  // ID of the track on the destination platform (this may be undefined if our reason for failing was BECAUSE we were unable to find the track on the destination platform)
  destinationTrackID?: string;
  // Error message containing reason for transfer failure (may be undefined)
  error?: string;
};

type OperationLog = { timestamp: string; logMessage: string };

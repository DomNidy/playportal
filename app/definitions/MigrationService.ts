// These definitions define types that we will pass to our song migration service

import { Platforms } from "./Enums";

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
  };
  /**
   * An array of `ExternalTrack` objects, these will be transfered into the `destination`
   */
  tracks: ExternalTrack[];
};

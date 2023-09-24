"use client";
import { Auth } from "firebase/auth";
import { getDatabase, ref } from "firebase/database";
import { getFirebaseApp } from "@/lib/utility/GetFirebaseApp";
import { useEffect, useState } from "react";
import { useObject } from "react-firebase-hooks/database";
import { useDocument, useDocumentOnce } from "react-firebase-hooks/firestore";
import { TransferLogTrackObjectSchema } from "@/definitions/Schemas";
import Image from "next/image";
import {
  ExternalTrack,
  LogTypes,
  TransferLog,
  SimilarityItem,
} from "@/definitions/MigrationService";
import { Platforms } from "@/definitions/Enums";
import { fetchExternalTracks } from "@/lib/fetching/FetchExternalTracks";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { doc, getFirestore } from "firebase/firestore";

const app = getFirebaseApp();

// Get realtime db
const db = getDatabase(app);

export default function ActiveTransferStatusDisplay({
  auth,
  operationID,
  /**
   * operationIsLive: When set to true, we will attempt to read logs from the realtime database,
   * when set to false, we will attempt to read logs from firestore, if the property is omitted we will assume operation is live is true
   */
  operationIsLive = true,
}: {
  auth?: Auth;
  operationID?: string;
  operationIsLive?: boolean;
}) {
  const operationDoc = ref(db, `operations/${operationID}`);

  // Stores message logs from realtime firebase operation (note: this does not store the track log objects)
  const [messageLog, setMessageLog] = useState<Set<string>>();

  // Stores ids from track log objects since we cannot create a set from this object without writing extra boilerplate
  const [alreadyRenderedTrackLogs, setAlreadyRenderedTrackLogs] = useState<
    Set<string>
  >(new Set());

  // Stores the track log objects from realtime firebase operation
  const [trackLog, setTrackLog] = useState<
    Record<
      string,
      TransferLog & ExternalTrack & { fetched?: boolean } & SimilarityItem
    >
  >({});

  // The document data retrieved from realtime log (if operationIsLive is true)
  const [realtimeSnapshots, realtimeLoading, realtimeError] =
    useObject(operationDoc);

  // The document data retrieved from firestore log (if operationIsLive is false)
  const [firestoreValue, firestoreLoading, firestoreError, firestoreReload] =
    useDocumentOnce(doc(getFirestore(), `operations`, `${operationID}`));

  useEffect(() => {
    // If we are trying to read a log from firestore (not a live operation log)
    if (
      operationIsLive !== true &&
      !!firestoreValue?.data() &&
      !firestoreLoading
    ) {
      console.log("read a log from firestore ");
      Object.values(firestoreValue?.data()?.logs).forEach((log) => {
        console.log(JSON.stringify(log));

        // Create temporary sets to store new track IDs and message logs
        const newTrackIDS = new Set<string>();
        const newMessages = new Set<string>();

        if (TransferLogTrackObjectSchema.safeParse(log)) {
          const logObject: TransferLog = log as TransferLog;
          if (typeof logObject.item === "object") {
            // If the item property is an object, our log is a track log
            newTrackIDS.add(logObject.item.platformID);
          } else if (
            typeof logObject.item === "string" &&
            !logObject.flags?.hideFromUser
          ) {
            // If the item property is an string, our log is a message log
            newMessages.add(logObject.item);
          }

          // Merge the alreadyRendered track logs state with the new set
          setAlreadyRenderedTrackLogs((past) => {
            if (newTrackIDS && past) {
              return new Set([...past, ...newTrackIDS]);
            }
            if (!newTrackIDS && past) {
              return new Set([...past]);
            }
            return new Set([...newTrackIDS]);
          });

          // Merge the message logs state with the new set
          setMessageLog((past) => {
            if (newMessages && past) {
              return new Set([...past, ...newMessages]);
            }
            if (!newMessages && past) {
              return new Set([...past]);
            }
            return new Set([...newMessages]);
          });
        }
      });
    }

    // If we are trying to read a log from realtime db
    if (
      operationIsLive &&
      realtimeSnapshots &&
      realtimeSnapshots?.val() &&
      realtimeSnapshots?.val().logs
    ) {
      console.log("read a log from realtime db");
      const logs = Object.values(realtimeSnapshots?.val().logs);

      // Create temporary sets to store new track IDs and message logs
      const newTrackIDS = new Set<string>();
      const newMessages = new Set<string>();

      // Ensure all logs received are of valid schema
      // Add all logs to their respective temporary sets
      logs.forEach((log) => {
        if (TransferLogTrackObjectSchema.safeParse(log)) {
          const logObject: TransferLog = log as TransferLog;
          if (typeof logObject.item === "object") {
            // If the item property is an object, our log is a track log
            newTrackIDS.add(logObject.item.platformID);
          } else if (typeof logObject.item === "string") {
            // If the item property is an string, our log is a message log
            newMessages.add(logObject.item);
          }
        }
      });

      // Merge the alreadyRendered track logs state with the new set
      setAlreadyRenderedTrackLogs((past) => {
        if (newTrackIDS && past) {
          return new Set([...past, ...newTrackIDS]);
        }
        if (!newTrackIDS && past) {
          return new Set([...past]);
        }
        return new Set([...newTrackIDS]);
      });

      // Merge the message logs state with the new set
      setMessageLog((past) => {
        if (newMessages && past) {
          return new Set([...past, ...newMessages]);
        }
        if (!newMessages && past) {
          return new Set([...past]);
        }
        return new Set([...newMessages]);
      });
    }
  }, [realtimeSnapshots]);

  useEffect(() => {
    // Add the track logs from firestore db to track log state
    if (
      operationIsLive === false &&
      firestoreValue &&
      firestoreValue?.data() &&
      firestoreValue?.data()?.logs
    ) {
      // Create an array of log objects from the firestore data
      const logs = Object.values(firestoreValue.data()!.logs);

      // Create a temporary object to store new track logs with platformID as the key
      const newTrackLogs: Record<
        string,
        TransferLog & ExternalTrack & SimilarityItem
      > = {};

      // Find the track log with the matching trackID
      logs.forEach((log) => {
        // Parse object to see if it matches correct schema
        if (TransferLogTrackObjectSchema.safeParse(log)) {
          const logObject: TransferLog = log as TransferLog &
            ExternalTrack &
            SimilarityItem;

          if (typeof logObject.item === "object" && auth) {
            console.log(JSON.stringify(logObject), "firestore");
            // Use platformID as the key in the newTrackLogs object
            newTrackLogs[logObject.item.platformID] = logObject as TransferLog &
              ExternalTrack &
              SimilarityItem;
          }
        }
      });
      // Merge new logs with old logs
      setTrackLog((prevTrackLog) => {
        return {
          ...prevTrackLog,
          ...newTrackLogs,
        };
      });
    }

    // Add the track logs from realtime db to track log state
    if (
      operationIsLive &&
      realtimeSnapshots &&
      realtimeSnapshots?.val() &&
      realtimeSnapshots?.val().logs
    ) {
      const logs = Object.values(realtimeSnapshots?.val().logs);

      // Create a temporary object to store new track logs with platformID as the key
      const newTrackLogs: Record<
        string,
        TransferLog & ExternalTrack & SimilarityItem
      > = {};

      // Find the track log with the matching trackID
      logs.forEach((log) => {
        // Parse object to see if it matches correct schema
        if (TransferLogTrackObjectSchema.safeParse(log)) {
          const logObject: TransferLog = log as TransferLog &
            ExternalTrack &
            SimilarityItem;
          console.log(JSON.stringify(logObject), "realtime");
          if (typeof logObject.item === "object" && auth) {
            // Use platformID as the key in the newTrackLogs object
            newTrackLogs[logObject.item.platformID] = logObject as TransferLog &
              ExternalTrack &
              SimilarityItem;
          }
        }
      });

      // Merge the newTrackLogs object with the current trackLog state
      setTrackLog((prevTrackLog) => {
        return {
          ...prevTrackLog,
          ...newTrackLogs,
        };
      });

      console.log(trackLog, "already");
    }
  }, [alreadyRenderedTrackLogs, realtimeSnapshots]);

  useEffect(() => {
    // This function will fetch and set the external track properties on each track log object
    // After this method runs, the track log object will be updated with a new property "fetched", indicating that the track was already fetched
    async function setExternalTrackObjectsOnTrackLogs() {
      // Create a temporary object to store new track logs with platformID as the key
      const updatedTrackLogs: Record<
        string,
        TransferLog & ExternalTrack & SimilarityItem
      > = {};

      // Array to store track ids that we need to fetch metadata for (such as cover art, etc.)
      const trackIDSToFetch: string[] = [];

      for (const trackID in trackLog) {
        //Reference to current track
        const track = trackLog[trackID];

        // Dont fetch tracks that have already been fetched
        if (track.fetched) {
          console.log("Already fetched, not running");
          continue;
        }

        // Add track ID to trackIDS to fetch array (we will fetch data for this trackID)
        trackIDSToFetch.push(trackID);

        updatedTrackLogs[trackID] = { ...trackLog[trackID], fetched: true };
      }

      if (!trackIDSToFetch || !operationID) {
        console.log("No track ids to fetch or operation ID undefined");
        return;
      }

      if (!auth) {
        console.log("Not authenticated, cant fetch");
        return;
      }

      // Fetch the external track data of all track ids
      const externalTrackResult = fetchExternalTracks(
        // Read the platfrom property from the first trackLog (all trackLogs will have the same platform)
        (trackLog[trackIDSToFetch[0]].item as any).platform as Platforms,
        trackIDSToFetch,
        operationID,
        auth
      );

      // Update tracklog with already fetched prop
      setTrackLog((prevTrackLog) => {
        return {
          ...prevTrackLog,
          ...updatedTrackLogs,
        };
      });
    }

    // If there are any tracks that have not been fetched yet
    if (
      Object.values(trackLog).filter((log) => log.fetched !== true).length > 0
    ) {
      console.log("Sufficient length", trackLog);
      setExternalTrackObjectsOnTrackLogs();
    }
  }, [alreadyRenderedTrackLogs]);

  return (
    <div className="border-border border-[1.2px] rounded-lg w-fit p-2">
      <h3 className="font-semibold text-lg tracking-tighter">
        Transfer Status:
      </h3>

      {realtimeError && <strong>Error: {realtimeError.message}</strong>}
      {realtimeLoading && <span>List: Loading...</span>}
      <div className="w-full">
        {messageLog &&
          Array.from(messageLog).map((message, idx) => (
            <p key={idx}>{message}</p>
          ))}
      </div>

      {/** Mapping out tracks that are matches */}
      <Accordion type="multiple">
        <AccordionItem value="matching_tracks">
          <AccordionTrigger>
            View matching tracks{" "}
            {
              Object.values(trackLog).filter(
                (track) => track.kind === LogTypes.MATCHING
              ).length
            }
          </AccordionTrigger>
          <AccordionContent>
            {/** Mapping out tracks that are matches */}
            {Object.values(trackLog).map(
              (
                track: TransferLog & ExternalTrack & { fetched?: boolean },
                idx: any
              ) => {
                // If track.item is not an object, return
                if (typeof track.item !== "object") {
                  return;
                }

                // If this is not a matched track, return
                if (track.kind !== "matching" || !track.fetched) {
                  return;
                }

                return (
                  <div
                    className="flex flex-row gap-2 p-2 bg-card rounded-lg shadow-sm bg-green-400"
                    key={track.item.platformID}
                  >
                    {track.image && (
                      <Image
                        alt="Track image"
                        src={track.image.url}
                        className="aspect-square rounded-lg resize-none"
                        width={32}
                        height={32}
                      />
                    )}

                    <p>
                      {track?.artist?.name || track.item.platform},{" "}
                      {track.title || track.platform_id}, {track.kind},{" "}
                    </p>
                  </div>
                );
              }
            )}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="not_matching_tracks">
          <AccordionTrigger>
            View not matching tracks{" "}
            {
              Object.values(trackLog).filter(
                (track) => track.kind === LogTypes.NOT_MATCHING
              ).length
            }
          </AccordionTrigger>
          <AccordionContent>
            {/** Mapping out tracks that are not matches */}
            {Object.values(trackLog).map(
              (
                track: TransferLog & ExternalTrack & { fetched?: boolean },
                idx: any
              ) => {
                // If track.item is not an object, return
                if (typeof track.item !== "object") {
                  return;
                }

                // If this is not a matched track, return
                if (track.kind !== "not_matching" || !track.fetched) {
                  return;
                }

                return (
                  <div
                    className="flex flex-row gap-2 p-2 bg-card rounded-lg shadow-sm bg-red-400"
                    key={track.item.platformID}
                  >
                    {track.image && (
                      <Image
                        alt="Track image"
                        src={track.image.url}
                        className="aspect-square rounded-lg resize-none"
                        width={32}
                        height={32}
                      />
                    )}

                    <p>
                      {track?.artist?.name || track.item.platform},{" "}
                      {track.title || track.platform_id}, {track.kind},{" "}
                    </p>
                  </div>
                );
              }
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

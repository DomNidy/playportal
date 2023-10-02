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
  OperationTransferStatus,
  OperationStates,
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

// TODO: Devise a way to fetch data
export default function ActiveTransferStatusDisplay({
  auth,
  operationID,
}: {
  auth?: Auth;
  operationID?: string;
}) {
  const operationDoc = ref(db, `operations/${operationID}`);

  // When set to true, we will attempt to read logs from the realtime database,
  // When set to false, we will attempt to read logs from firestore
  // This property will be automatically updated to true if the status property in the inital read of the firestore document is not completed
  const [operationIsLive, setOperationIsLive] = useState<boolean>(false);

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

  // The document data retrieved from firestore log (if operationIsLive is false)
  const [firestoreValue, firestoreLoading, firestoreError] = useDocument(
    doc(getFirestore(), `operations`, `${operationID}`)
  );

  // The document data retrieved from realtime log (if operationIsLive is true)
  const [realtimeSnapshots, realtimeLoading, realtimeError] =
    useObject(operationDoc);

  // Defining this function to reduce code duplication
  // Merges tracklogs and message logs into state
  function mergeAlreadyRenderedTrackIDSAndMessageLogs(
    newTrackIDS: Set<string>,
    newMessages: Set<string>
  ) {
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

  // This effect updates the operationIsLive state
  useEffect(() => {
    console.log("Operation is live update effect ran");
    // If the firestore document data is defined and status.status property exists
    if (firestoreValue?.data() && !!firestoreValue.get("status.status")) {
      const status = firestoreValue.get("status.status");

      // Check if the status property is completed
      if (status != OperationStates.COMPLETED) {
        // If the status property is not completed, we will read logs from realtime db
        setOperationIsLive(true);
      } else {
        console.log("Status is", status, "we will read logs from firestore");
        setOperationIsLive(false);
      }
    }
  }, [firestoreValue]);

  // Effect for updating our state with log data received from firestore
  useEffect(() => {
    // If we are trying to read a log from firestore (not a live operation log)
    if (
      operationIsLive !== true &&
      !!firestoreValue?.data() &&
      !!firestoreValue?.data()?.logs &&
      !firestoreLoading
    ) {
      console.log("Firestore effect ran!");
      Object.values(firestoreValue?.data()?.logs).forEach((log) => {
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

          mergeAlreadyRenderedTrackIDSAndMessageLogs(newTrackIDS, newMessages);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestoreValue, operationIsLive]);

  // Effect for updating our state with log data received from realtime db
  useEffect(() => {
    // If we are trying to read a log from realtime db
    if (
      operationIsLive === true &&
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
          } else if (
            typeof logObject.item === "string" &&
            !logObject.flags?.hideFromUser
          ) {
            // If the item property is an string, our log is a message log
            newMessages.add(logObject.item);
          }
        }
      });

      mergeAlreadyRenderedTrackIDSAndMessageLogs(newTrackIDS, newMessages);
    }
  }, [realtimeSnapshots, operationIsLive]);

  useEffect(() => {
    console.log("Already rendered tracklogs changed!");
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
            // Use platformID as the key in the newTrackLogs object
            newTrackLogs[logObject.item.platformID] = logObject as TransferLog &
              ExternalTrack &
              SimilarityItem;

            console.log(
              new Date(Number((log as any)?.timestamp) || 0).toISOString(),
              "timestamp"
            );
          }
        } else {
          console.log(log, "failed parse");
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
  }, [alreadyRenderedTrackLogs]);

  return (
    <div className="border-border border-[1.2px] rounded-lg w-full p-2">
      <h3 className="font-semibold text-lg tracking-tighter">
        Transfer Status:
      </h3>

      {realtimeError && <strong>Error: {realtimeError.message}</strong>}
      {realtimeLoading && <span>List: Loading...</span>}
      <div className="flex flex-col max-w-full break-words">
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
            {Object.values(trackLog).map((track: TransferLog, idx: any) => {
              // If track.item is not an object, return
              if (typeof track.item !== "object") {
                return;
              }

              // If this is not a matched track, return
              if (track.kind !== "matching") {
                return;
              }

              return (
                <div
                  className="flex flex-row gap-2 p-2 bg-card rounded-lg shadow-sm bg-green-400"
                  key={track.item.platformID}
                >
                  {(!!track.item.image || !!track.item.trackImageURL) &&
                  track.item.trackImageURL !== "undefined" ? (
                    <Image
                      alt="Track image"
                      src={
                        (track?.item.image
                          ? track.item.image.url
                          : track.item.trackImageURL)!
                      }
                      className="aspect-square rounded-lg resize-none"
                      width={32}
                      height={32}
                    />
                  ) : (
                    <></>
                  )}

                  <p>
                    {track?.item.artist?.name || track.item.platform},{" "}
                    {track.item.title || track.item.platformID}, {track.kind},{" "}
                  </p>
                </div>
              );
            })}
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
            {Object.values(trackLog).map((track: TransferLog, idx: any) => {
              // If track.item is not an object, return
              if (typeof track.item !== "object") {
                return;
              }

              // If this is not a matched track, return
              if (track.kind !== "not_matching") {
                return;
              }

              return (
                <div
                  className="flex flex-row gap-2 p-2 bg-card rounded-lg shadow-sm bg-red-400"
                  key={track.item.platformID}
                >
                  {(!!track.item.image || !!track.item.trackImageURL) &&
                  track.item.trackImageURL !== "undefined" ? (
                    <Image
                      alt="Track image"
                      src={
                        (track?.item.image
                          ? track.item.image.url
                          : track.item.trackImageURL)!
                      }
                      className="aspect-square rounded-lg resize-none"
                      width={32}
                      height={32}
                    />
                  ) : (
                    <></>
                  )}

                  <p>
                    {track?.item.artist?.name || track.item.platform},{" "}
                    {track.item.title || track.item.platform_id}, {track.kind},{" "}
                  </p>
                </div>
              );
            })}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

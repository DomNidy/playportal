"use client";
import { Auth } from "firebase/auth";
import { getDatabase, onValue, ref } from "firebase/database";
import { getFirebaseApp } from "@/lib/utility/GetFirebaseApp";
import { useEffect, useState } from "react";
import { useList, useObject } from "react-firebase-hooks/database";
import { z } from "zod";
import { RealtimeLogTrackObjectSchema } from "@/definitions/Schemas";
import Image from "next/image";
import {
  LogTypes,
  RealtimeLog,
  SimilarityItem,
} from "@/definitions/MigrationService";
import { Platforms } from "@/definitions/Enums";
import { inherits } from "util";
import { Button } from "../ui/button";
import { fetchExternalTrack } from "@/lib/fetching/FetchExternalTracks";
import { log } from "console";

const app = getFirebaseApp();

// Get realtime db
const db = getDatabase(app);

// Stores metadata retreieved from the tracks platform of origin
type TrackLogMetadata = {
  trackTitle?: string;
  trackURL?: string;
};

export default function ActiveTransferStatusDisplay({
  auth,
  activeOperationID,
}: {
  auth?: Auth;
  activeOperationID?: string;
}) {
  const operationDoc = ref(db, `operations/${activeOperationID}`);

  // Stores message logs from realtime firebase operation (note: this does not store the track log objects)
  const [messageLog, setMessageLog] = useState<Set<string>>();

  // Stores ids from track log objects since we cannot create a set from this object without writing extra boilerplate
  const [alreadyRenderedTrackLogs, setAlreadyRenderedTrackLogs] = useState<
    Set<string>
  >(new Set());

  // Stores the track log objects from realtime firebase operation
  const [trackLog, setTrackLog] = useState<
    Record<string, RealtimeLog & TrackLogMetadata>
  >({});

  const [snapshots, loading, error] = useObject(operationDoc);
  console.log(snapshots);

  useEffect(() => {
    if (snapshots && snapshots?.val() && snapshots?.val().logs) {
      const logs = Object.values(snapshots?.val().logs);

      // Create temporary sets to store new track IDs and message logs
      const newTrackIDS = new Set<string>();
      const newMessages = new Set<string>();

      // Ensure all logs received are of valid schema
      // Add all logs to their respective temporary sets
      logs.forEach((log) => {
        if (RealtimeLogTrackObjectSchema.safeParse(log)) {
          const logObject: RealtimeLog = log as RealtimeLog;
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
  });

  // Add the track logs to track log state
  useEffect(() => {
    if (snapshots && snapshots?.val() && snapshots?.val().logs) {
      const logs = Object.values(snapshots?.val().logs);

      // Create a temporary object to store new track logs with platformID as the key
      const newTrackLogs: Record<string, RealtimeLog & TrackLogMetadata> = {};

      alreadyRenderedTrackLogs.forEach((trackID) => {
        // Find the track log with the matching trackID
        logs.forEach((log) => {
          if (RealtimeLogTrackObjectSchema.safeParse(log)) {
            const logObject: RealtimeLog = log as RealtimeLog;
            if (
              typeof logObject.item === "object" &&
              logObject.item.platformID === trackID
            ) {
              // Use platformID as the key in the newTrackLogs object
              newTrackLogs[trackID] = logObject as RealtimeLog &
                TrackLogMetadata;
            }
          }
        });
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
  }, [alreadyRenderedTrackLogs, snapshots]);

  return (
    <div className="border-border border-[1.2px] rounded-lg w-fit p-2">
      <h3 className="font-semibold text-lg tracking-tighter">
        Transfer Status:
      </h3>
      <Button
        onClick={async () =>
          Object.values(trackLog).forEach((track) => {
            if (typeof track.item === "object") {
              fetchExternalTrack(
                track.item.platform as Platforms,
                track.item.platformID,
                auth!
              );
            }
          })
        }
      >
        Fetch external tracks
      </Button>
      {error && <strong>Error: {error.message}</strong>}
      {loading && <span>List: Loading...</span>}
      {messageLog &&
        Array.from(messageLog).map((message, idx) => (
          <p key={idx}>{message}</p>
        ))}

      {Object.values(trackLog).map((track: RealtimeLog, idx: any) => {
        // If track.item is not an object, return
        if (typeof track.item !== "object") {
          return;
        }

        if (track.kind === "not_matching") {
          return (
            <p
              className="bg-card rounded-lg shadow-sm bg-red-400"
              key={track.item.platformID}
            >
              {track.item.platform}, {track.item.platformID}, {track.kind}
            </p>
          );
        }
        return (
          <div
            className="flex flex-row gap-2 p-2 bg-card rounded-lg shadow-sm bg-green-400"
            key={track.item.platformID}
          >
            {track.item.trackImageURL !== "undefined" &&
              track.item.trackImageURL && (
                <Image
                  alt="Track image"
                  src={track.item.trackImageURL}
                  className="aspect-square rounded-lg"
                  width={32}
                  height={32}
                />
              )}

            <p>
              {track.item.platform}, {track.item.platformID}, {track.kind}
            </p>
          </div>
        );
      })}
    </div>
  );
}

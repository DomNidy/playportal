"use client";
import { Auth } from "firebase/auth";
import { getDatabase, onValue, ref } from "firebase/database";
import { getFirebaseApp } from "@/lib/utility/GetFirebaseApp";
import { useEffect, useState } from "react";
import { useList, useObject } from "react-firebase-hooks/database";
import { z } from "zod";
import { RealtimeLogTrackObjectSchema } from "@/definitions/Schemas";
import Image from "next/image";

const app = getFirebaseApp();

// Get realtime db
const db = getDatabase(app);

export default function ActiveTransferStatusDisplay({
  auth,
  activeOperationID,
}: {
  auth?: Auth;
  activeOperationID?: string;
}) {
  const [data, setData] = useState<any[]>([]);

  const operationDoc = ref(db, `operations/${activeOperationID}`);

  // Stores message logs from realtime firebase operation (note: this does not store the track log objects)
  const [messageLog, setMessageLog] = useState<Set<string>>();

  // Stores ids from track log objects since we cannot create a set from this object without writing extra boilerplate
  const [alreadyRenderedTrackLogs, setAlreadyRenderedTrackLogs] =
    useState<Set<string>>();

  // Stores the track log objects from realtime firebase operation
  const [trackLog, setTrackLog] =
    useState<z.infer<typeof RealtimeLogTrackObjectSchema>[]>();

  const [snapshots, loading, error] = useObject(operationDoc);

  console.log(data);
  useEffect(() => {
    if (snapshots && snapshots?.val() && snapshots?.val().logs) {
      Object.values(snapshots?.val().logs).forEach((log: any) => {
        const parseRes = RealtimeLogTrackObjectSchema.safeParse(log);
        console.log(parseRes);

        // If object has a logMessage property, update the message log state
        if (log.logMessage) {
          console.log(log.logMessage);
          setMessageLog((past) => {
            if (past) {
              return new Set([...past, log.logMessage]);
            }
            return new Set([log.logMessage]);
          });
        } else {
          console.log(log, "does not have log message");
        }

        // If the log was determined to be a track object log, add it to track log state
        if (
          parseRes.success &&
          !alreadyRenderedTrackLogs?.has(
            (log as z.infer<typeof RealtimeLogTrackObjectSchema>).item
              .platformID
          )
        ) {
          setAlreadyRenderedTrackLogs((past) => {
            if (past) {
              return new Set([...past, log.item.platformID]);
            }
            return new Set([log.item.platformID]);
          });
          setTrackLog((past) => {
            if (past) {
              return [
                ...past,
                log as z.infer<typeof RealtimeLogTrackObjectSchema>,
              ];
            }
            return [log as z.infer<typeof RealtimeLogTrackObjectSchema>];
          });
        }
      });
    }
  }, [snapshots]);

  return (
    <div className="border-border border-[1.2px] rounded-lg w-fit p-2">
      <h3 className="font-semibold text-lg tracking-tighter">
        Transfer Status:
      </h3>
      {error && <strong>Error: {error.message}</strong>}
      {loading && <span>List: Loading...</span>}
      {messageLog &&
        Array.from(messageLog).map((message, idx) => (
          <p key={idx}>{message}</p>
        ))}
      {trackLog?.map((track, idx) => {
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

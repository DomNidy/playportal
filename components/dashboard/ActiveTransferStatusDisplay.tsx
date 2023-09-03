"use client";
import { Auth } from "firebase/auth";
import { getDatabase, onValue, ref } from "firebase/database";
import { getFirebaseApp } from "@/lib/utility/GetFirebaseApp";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    const unsubscribe = onValue(operationDoc, (snap) => {
      console.log(snap.toJSON(), snap);
      if (snap.val() && snap.val().logs) {
        console.log("Defined");
        setData(Object.values(snap.val().logs));
      } else {
        console.log("UN Defined");
        setData([]);
      }
    });

    return unsubscribe;
  });

  console.log(data);
  return (
    <div className="border-border border-[1.2px] rounded-lg w-fit p-2">
      <h3 className="font-semibold text-lg tracking-tighter">
        Transfer Status:
      </h3>
      {!!data &&
        data.map((log: any) => (
          <p key={Math.random().toString()}>{log.logMessage}</p>
        ))}
    </div>
  );
}

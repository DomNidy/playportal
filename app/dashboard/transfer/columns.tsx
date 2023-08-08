"use client";
import {
  OperationTransfer,
  TransferTableData,
} from "@/app/definitions/MigrationService";
import { ColumnDef } from "@tanstack/react-table";
import { Timestamp } from "firebase/firestore";
import { formatRelativeDateFromEpoch } from "@/app/utility/FormatDate";
import { BiCopy } from "@react-icons/all-files/bi/BiCopy";
import { capitalizeFirstLetter } from "@/app/utility/FormatText";

export const columns: ColumnDef<OperationTransfer>[] = [
  {
    header: () => (
      <div className="text-left w-fit tracking-tight ">Operation ID</div>
    ),
    accessorKey: "operationID",
    accessorFn: (row) => `${row.status.operationID}`,
    cell: ({ row }) => {
      const operationID = row.getValue("operationID") as string;
      return (
        <div className="flex  gap-4 font-mono   ">
          <p className="max-w-[60px] sm:max-w-[80px] md:max-w-[110px] lg:max-w-[140px] truncate">
            {operationID}
          </p>
          <BiCopy
            className="text-2xl hover:text-primary transition-all cursor-pointer"
            onClick={() => {
              navigator.clipboard.writeText(operationID);
            }}
          />
        </div>
      );
    },
  },

  {
    header: "Started at",
    accessorFn: (row) => {
      const formattedDate = formatRelativeDateFromEpoch(
        row.info.startedAt.seconds
      );
      return `${formattedDate}`;
    },
  },
  {
    header: "Destination Platform",
    accessorFn: (row) =>
      `${capitalizeFirstLetter(
        row.info.originPlatform
      )} -> ${capitalizeFirstLetter(row.info.destinationPlatform)}`,
  },
  {
    header: "Playlist Destination",
    accessorFn: (row) =>
      `${row.info.originPlaylistName} -> ${row.info.destinationPlaylistName}`,
  },
  {
    header: "# of Tracks",
    accessorFn: (row) => `${row.status.pendingTracks?.length}`,
  },
  {
    header: "Status",
    accessorFn: (row) => row.status.status,
  },
];

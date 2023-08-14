"use client";
import {
  OperationTransfer,
  OperationTransferSimple,
} from "@/definitions/MigrationService";
import { ColumnDef } from "@tanstack/react-table";
import { formatRelativeDateFromEpoch } from "@/lib/utility/FormatDate";
import { BiCopy } from "@react-icons/all-files/bi/BiCopy";
import { capitalizeFirstLetter } from "@/lib/utility/FormatText";

export const columns: ColumnDef<OperationTransferSimple>[] = [
  {
    header: () => (
      <div className="text-left w-fit tracking-tight ">Operation ID</div>
    ),
    accessorKey: "operationID",
    accessorFn: (row) => `${row.info.operationID}`,
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
    accessorFn: (row) => `${row.info.amountOfSongsToTransfer}`,
  },
  {
    header: "Status",
    accessorFn: (row) => row.status,
  },
];

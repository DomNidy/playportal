// Shows details of a transfer before it is started
// Such as: the amount of songs that will be transferred, links to the playlist, cost to transfer etc

import { PlaylistSelectItem } from "@/definitions/PlaylistDefinitions";
import Link from "next/link";
import { Button, ButtonProps } from "../ui/button";

export default function TransferPreview({
  fromPlaylist,
  toPlaylist,
  sendButton,
  transferFormIssues,
}: {
  fromPlaylist: PlaylistSelectItem | undefined;
  toPlaylist: PlaylistSelectItem | undefined;
  sendButton: any;
  transferFormIssues: string[] | undefined;
}) {
  return (
    <div
      className="border-border border-[1.3px] flex flex-col m-auto p-2 rounded-lg
                max-w-[34rem]"
    >
      <div className="flex flex-row">
        <div className="flex flex-col basis-1/2">
          <h2 className="font-semibold tracking-tight text-xl">From</h2>
          <ul>
            <li>
              <span className="text-muted-foreground tracking-tighter text-base">
                Name:{" "}
              </span>
              <Link href={fromPlaylist?.playlist_url || ""}>
                {fromPlaylist?.name}
              </Link>
            </li>{" "}
            <li>
              <span className="text-muted-foreground tracking-tighter text-base">
                Track Count:
              </span>{" "}
              {fromPlaylist?.track_count}
            </li>
          </ul>
        </div>
        <div className="flex flex-col basis-1/2 ">
          {" "}
          <h2 className="font-semibold tracking-tight text-xl">To</h2>
          <ul>
            <li>
              <span className="text-muted-foreground tracking-tighter text-base">
                Name:{" "}
              </span>
              <Link href={fromPlaylist?.playlist_url || ""}>
                {toPlaylist?.name}
              </Link>
            </li>{" "}
            <li>
              <span className="text-muted-foreground tracking-tighter text-base">
                Track Count:
              </span>{" "}
              {toPlaylist?.track_count}{" "}
              {fromPlaylist?.track_count && toPlaylist?.track_count && (
                <span className="text-sm text-green-400">
                  (+{fromPlaylist?.track_count}){" "}
                </span>
              )}
            </li>
          </ul>
        </div>
      </div>
      <div className="flex justify-center pt-2 pb-2">{sendButton}</div>
      <div className="flex justify-center pt-2 pb-2">
        {transferFormIssues?.map((issue, idx) => {
          if (issue) {
            return (
              <p
                key={idx}
                className="text-destructive text-sm font-sm font-semibold"
              >
                {issue}
              </p>
            );
          }
        })}
      </div>
    </div>
  );
}

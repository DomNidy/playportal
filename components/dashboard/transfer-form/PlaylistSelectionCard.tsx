import { Button } from "@/components/ui/button";
import { Platforms } from "@/definitions/Enums";
import { TransferFormStateProperties } from "@/definitions/UserInterfaces";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";

type PlaylistSelectionCardProps = {
  /**
   * cardType determines whether selecting this playlist card will update the destination playlist or the origin playlist
   */
  cardType: "destination" | "origin";
  playlistImageURL?: string;
  playlistPlatform: Platforms;
  platformIcon: any;
  playlistTrackCount: number;
  playlistTitle: string;
  playlistURL?: string;
  playlistID: string;
};

export default function PlaylistSelectionCard({
  setFormSettings,
  props,
}: {
  setFormSettings: Dispatch<SetStateAction<TransferFormStateProperties>>;
  props: PlaylistSelectionCardProps;
}) {
  return (
    <div className="w-full h-12 rounded-xl p-2 bg-background flex shadow-md gap-2">
      {props.playlistImageURL ? (
        <Image
          alt="Playlist cover image"
          src={props.playlistImageURL}
          className="aspect-square min-w-[32px] min-h-[32px] rounded-md cursor-pointer"
          width={32}
          onClick={() => window.open(props.playlistURL)}
          height={32}
        />
      ) : (
        <div
          className="aspect-square bg-gradient-to-b min-w-[32px] min-h-[32px] from-purple-400 to-blue-300 rounded-md cursor-pointer hover:saturate-150"
          onClick={() => window.open(props.playlistURL)}
        />
      )}

      <div className="max-w-[25%] w-44 flex flex-col  gap-0 h-11 overflow-clip">
        <h2 className="text-[#3D3A3A] text-sm whitespace-nowrap">
          {props.playlistTitle}
        </h2>
        <p className="text-[#595353] font-semibold text-xs ">
          Spotify{" "}
          <span>
            <Image
              src={props.platformIcon}
              width={16}
              height={16}
              className=" hidden  sm:inline-block"
              alt={`${props.playlistPlatform} logo`}
            />
          </span>
        </p>
      </div>
      <div className="flex basis-full flex-row-reverse items-center min-w-[120px]  gap-4 relative">
        <Button
          className="px-6 rounded-3xl h-8"
          onClick={() => {
            if (props.cardType === "origin") {
              setFormSettings((past) => {
                return {
                  ...past,
                  origin: {
                    playlistID: props.playlistID,
                    playlistTitle: props.playlistTitle,
                    platform: props.playlistPlatform,
                  },
                };
              });
            } else {
              setFormSettings((past) => {
                return {
                  ...past,
                  destination: {
                    playlistID: props.playlistID,
                    playlistTitle: props.playlistTitle,
                    platform: props.playlistPlatform,
                  },
                };
              });
            }
          }}
        >
          Select
        </Button>
        <p className="text-[#595353] font-semibold text-xs">
          {props.playlistTrackCount} Songs
        </p>
      </div>
    </div>
  );
}

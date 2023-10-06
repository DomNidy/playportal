import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Platforms } from "@/definitions/Enums";
import {
  TransferFormStateProperties,
  TransferFormStates,
} from "@/definitions/UserInterfaces";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";



type PlaylistSelectionCardProps = {
  /**
   * cardType determines whether selecting this playlist card will update the destination playlist or the origin playlist
   */
  cardType: "destination" | "origin" | "review" | "loading";
  /**
   * If the card should be bigger in size (visually)
   */
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
  setFormState,
  props,
}: {
  setFormSettings: Dispatch<SetStateAction<TransferFormStateProperties>>;
  setFormState: Dispatch<SetStateAction<TransferFormStates>>;
  props: PlaylistSelectionCardProps;
}) {
  if (props.cardType === "loading") {
    return (
      <Skeleton
        className={`h-12 p-2 w-full rounded-xl bg-background flex shadow-md gap-2 `}
      >
        {" "}
        <Skeleton className="aspect-square bg-gradient-to-b min-w-[32px] min-h-[32px] rounded-md cursor-pointer hover:saturate-150" />
        <Skeleton
          className={`w-44 flex flex-col  gap-0 max-h-11 overflow-clip max-w-[25%] `}
        >
          <Skeleton className="text-[#3D3A3A] text-sm whitespace-nowrap" />
          <Skeleton className="text-[#3D3A3A] text-sm whitespace-nowrap">
            <span>
              <Skeleton className="w-[16px] h-[16px]" />
            </span>
          </Skeleton>
        </Skeleton>
      </Skeleton>
    );
  }
  return (
    <div
      className={`${
        props.cardType === "review"
          ? "h-16 p-4 w-fit max-w-full md:max-w-[45%]"
          : "h-12 p-2 w-full "
      } rounded-xl bg-background flex shadow-md gap-2 `}
    >
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

      <div
        className={` w-44 flex flex-col  gap-0 h-11 overflow-clip ${
          props.cardType === "review" ? "flex-grow " : "max-w-[25%]"
        }`}
      >
        <h2 className="text-[#3D3A3A] dark:text-primary text-sm whitespace-nowrap">
          {props.playlistTitle}
        </h2>
        <p className="text-[#595353] dark:text-muted-foreground font-semibold text-xs capitalize ">
          {props.playlistPlatform}{" "}
          <span>
            <Image
              src={props.platformIcon}
              width={16}
              height={16}
              className="inline-block"
              alt={`${props.playlistPlatform} logo`}
            />
          </span>
        </p>
      </div>
      <div
        className={`flex  basis-full flex-row-reverse items-center  overflow-clip ${
          props.cardType === "review" ? "" : "min-w-[120px] "
        }  gap-4`}
      >
        {props.cardType !== "review" && (
          <Button
            className="px-6 rounded-3xl h-8"
            onClick={() => {
              if (props.cardType === "origin") {
                setFormState(TransferFormStates.SELECTING_DESTINATION_PLATFORM);
                setFormSettings((past) => {
                  return {
                    ...past,
                    origin: {
                      playlistID: props.playlistID,
                      playlistTitle: props.playlistTitle,
                      playlistPlatform: props.playlistPlatform,
                      playlistTrackCount: props.playlistTrackCount,
                      playlistURL: props.playlistURL!,
                      playlistImageURL: props.playlistImageURL,
                    },
                  };
                });
              } else {
                setFormSettings((past) => {
                  setFormState(TransferFormStates.REVIEWING_TRANSFER);
                  return {
                    ...past,
                    destination: {
                      playlistID: props.playlistID,
                      playlistTitle: props.playlistTitle,
                      playlistPlatform: props.playlistPlatform,
                      playlistTrackCount: props.playlistTrackCount,
                      playlistURL: props.playlistURL!,
                      playlistImageURL: props.playlistImageURL,
                    },
                  };
                });
              }
            }}
          >
            Select
          </Button>
        )}
        <p className="text-[#595353] dark:text-muted-foreground font-semibold text-xs">
          {props.playlistTrackCount} Songs
        </p>
      </div>
    </div>
  );
}

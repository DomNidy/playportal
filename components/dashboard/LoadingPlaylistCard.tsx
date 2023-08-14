import { AspectRatio } from "../ui/aspect-ratio";

export default function LoadingPlaylistCard() {
  return (
    <div className=" transition-all animate-pulse " style={{
        animationDuration: "2.8s"
    }}>
      <AspectRatio ratio={1 / 1}>
        <div className=" bg-zinc-300  dark:bg-zinc-700 w-full h-full z-0 relative" />

        <div className="absolute top-0 px-4 py-3 w-full justify-evenly h-full "></div>
      </AspectRatio>
    </div>
  );
}

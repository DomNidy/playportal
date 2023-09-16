import Image from "next/image";

export default function PlatformSelectionCard({
  platformIconSVG,
  platformName,
}: {
  platformIconSVG: any;
  platformName: string;
}) {
  return (
    <div className="max-h-[150px] max-w-[150px] h-full w-full  flex items-center justify-center aspect-square bg-background rounded-lg grayscale hover:grayscale-0 hover:scale-110 cursor-pointer  transition-all duration-150">
      <Image
        src={platformIconSVG as string}
        width={94}
        alt={`${platformName}`}
      />
    </div>
  );
}

import Image, { ImageProps } from "next/image";

// This component handles the layout of the card and UX
export default function BaseCard({
  connectedAccountName,
  serviceName,
  children,
  serviceLogoImageProps,
  isConnected,
}: {
  connectedAccountName?: string;
  serviceName: string;
  children?: JSX.Element[] | JSX.Element;
  serviceLogoImageProps: ImageProps;
  isConnected: boolean;
}) {
  return (
    <div>
      <h1>{serviceName} Account:</h1>
      <p className="font-light italic truncate text-ellipsis max-w-[82%] ">
        {isConnected ? `${connectedAccountName}` : "Account not connected"}
      </p>

      <div
        className={`w-64 h-32 lg:w-72 lg:h-36 bg-neutral-950 transition-all hover:cursor-pointer rounded-lg p-1 flex justify-center ${
          isConnected ? "" : "grayscale "
        }`}
      >
        {children}
        <Image
          src={serviceLogoImageProps.src}
          width={serviceLogoImageProps.width}
          height={serviceLogoImageProps.height}
          alt={serviceLogoImageProps.alt}
        ></Image>
      </div>
    </div>
  );
}

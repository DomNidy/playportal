import Image, { ImageProps } from "next/image";

// This component handles the layout of the card and UX
export default function BaseCard({
  profilePicURL,
  profileURL,
  connectedAccountName,
  serviceName,
  children,
  serviceLogoImageProps,
  isConnected,
}: {
  profilePicURL?: string;
  profileURL?: string;
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
        onClick={() => {
          if (profileURL) {
            window.open(profileURL);
          }
        }}
        className={`w-64 h-32 lg:w-72 lg:h-36 bg-neutral-950 transition-all hover:cursor-pointer rounded-lg p-1 flex justify-center ${
          isConnected ? "" : "grayscale "
        }`}
      >
        {children}
        <div className="flex gap-5 justify-between overflow-hidden">
          <Image
            src={serviceLogoImageProps.src}
            width={72}
            height={72}
            alt={serviceLogoImageProps.alt}
          ></Image>

          {profilePicURL && (
            <div className="h-full flex items-center">
              <Image
                width={72}
                height={72}
                src={profilePicURL}
                alt="Profile image"
                className="cover rounded-full h-[72px]"
              ></Image>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

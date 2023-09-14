import Orb from "@/components/landing-page/Orb";
import { Button } from "@/components/ui/button";
import { GetBaseUrl } from "@/lib/utility/GetBaseUrl";
import { Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

import rocketshipImage from "@/public/rocket-ship.svg";
import happyMusicImage from "@/public/happy-music.svg";
import playlistPersonImage from "@/public/playlist-person.svg";

const inter = Inter({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export default function Home() {
  return (
    <>
      <main
        className={`w-full min-h-[90%] h-[640px] overflow-hidden bg-background  text-white  main-bg   ${inter.className}
        pt-28 px-4
        sm:px-36
        md:pt-28 md:px-36
        lg:pt-28 lg:px-40
        xl:pt-32 xl:px-56`}
      >
        <nav className="absolute top-0 left-0 max-w-[100vw] w-full pt-2 h-14 text-sm md:text-lg font-semibold text-[#FFFFFF] flex-row-reverse flex sm:justify-normal justify-center">
          <ul
            className="
            mx-20
            mt-4
            sm:mx-28 
            basis-[330px] sm:basis-[300px] flex flex-row justify-between"
          >
            <h3 className="cursor-pointer">Features</h3>
            <h3 className="cursor-pointer">Help</h3>
            <Link
              href={`${GetBaseUrl()}login`}
              className="shadow-md font-bold -tracking-[0.55px] 
           px-[19px] py-[2px] w-fit h-fit bg-[#C10080] hover:bg-[#ae3686] rounded-[30px]"
            >
              Login
            </Link>
          </ul>
        </nav>
        <header
          className="flex flex-col gap-7 h-full 
          items-center
         "
        >
          <h1
            className="font-bold 
            text-center 
            text-[45px] -tracking-[0.5px] max-w-[300px]  leading-[48px]
            sm:text-[49px] sm:leading-[53px] sm:max-w-[620px] sm:tracking-[1px] 
            md:text-[52px] md:leading-[63px] md:max-w-[650px]
            lg:text-[58px] lg:leading-[63px] lg:max-w-[750px]"
          >
            Control your music streaming experience
          </h1>
          <p
            className="
          text-center
          text-[20px] leading-[33px] -tracking-[0.6px] max-w-[500px]"
          >
            Transfer your playlists from one platform to the next in seconds!
          </p>

          <Link
            href={`${GetBaseUrl()}login`}
            className="bg-gradient-to-b relative top-16 rounded-[30px] hover:scale-110 transition-transform duration-200 bg-[#C10080] hover:bg-[#ae3686]  shadow-md font-bold mt-6 -tracking-[0.95px] 
          text-[23px] px-[50px] py-[5px] w-fit"
          >
            Start now
          </Link>
        </header>
      </main>
      <div className="bg-background min-h-[1200px] pt-20 px-4 flex flex-col items-center ">
        <h1 className="text-6xl -tracking-[3.2px] font-bold text-[#3e259b] max-w-[700px] text-center pb-4">
          Its simple.
        </h1>

        <Image
          className="w-[300px] mt-4 mb-2
         "
          src={happyMusicImage}
          alt=""
        ></Image>
        <p className="max-w-[300px] text-center text-[#515153] italic text-sm">
          He used playportal to transfer all of his music, look how happy he is!{" "}
          <span className="text-xs">
            (Note: to avoid a potential lawsuit, we are compelled to tell you
            this is satire.)
          </span>
        </p>

        <div className="flex flex-col gap-2 items-center mt-14">
          <h1 className="text-5xl border-b-2 pb-2.5 w-fit -tracking-[0.25px] font-bold text-[#3e259b]  text-center">
            Sign up
          </h1>
          <p className="max-w-[450px] text-center text-lg text-[#4e4b5c] tracking-[0px]">
            You can do that{" "}
            <Link
              href={`${GetBaseUrl()}login`}
              className="text-[#3e259b] cursor-pointer font-semibold"
            >
              here
            </Link>{" "}
            by the way. After signing up we{"'"}ll take you to your dashboard.
          </p>
        </div>
        <Image
          className="w-[300px] mt-4 mb-16
         "
          src={playlistPersonImage}
          alt=""
        ></Image>

        <div className="flex flex-col gap-2 items-center mt-12">
          <h1 className="text-5xl border-b-2 pb-2.5 w-fit -tracking-[0.25px] font-bold text-[#3e259b]  text-center">
            Connect your accounts
          </h1>
          <p className="max-w-[600px] text-center text-lg text-[#4e4b5c] tracking-[0px]">
            In the {'"Connections"'} tab of your dashboard, link the streaming
            accounts you would like to transfer music between.
          </p>
        </div>

        <div className="flex flex-col gap-12 items-center mt-12 ">
          <h1 className="text-5xl border-b-2 pb-2.5 w-fit -tracking-[0.25px] font-bold text-[#3e259b]  text-center">
            Transfer your music
          </h1>

          <div className="flex flex-col sm:flex-row max-w-[720px] items-center sm:items-start text-center sm:text-left">
            <p className="max-w-[350px] px-1  text-lg text-[#4e4b5c] tracking-[0px] ">
              Connected your streaming accounts? Great! Now all you have to do
              is go to the {'"Transfer Music"'} tab.
            </p>
            <div className="w-[250px] h-[250px] bg-neutral-300 flex text-center items-center">
              GIF HERE SHOWING HOW TO ACCESS THE TRANSFERS TAB
            </div>
          </div>

          <div className="flex sm:items-start items-center text-center sm:text-right flex-col sm:flex-row-reverse max-w-[720px]">
            <p className="max-w-[350px] px-2  text-lg text-[#4e4b5c] tracking-[0px]">
              Once there, you{"'"}ll have to select two things. The playlist you
              want to transfer items from, and the playlist you want to transfer
              items into.
            </p>
            <div className="w-[250px] h-[250px] bg-neutral-300 flex text-center items-center">
              GIF HERE SHOWING HOW TO SELECT ORIGIN PLAYLIST AND DESTINATION
              PLAYLIST
            </div>
          </div>

          <div className="flex flex-col sm:flex-row max-w-[720px] items-center sm:items-start text-center sm:text-left">
            <p className="max-w-[350px] px-4  text-lg text-[#4e4b5c] tracking-[0px]">
              After that, all you have to do is click the transfer button, and
              you are done!! Your playlist should be transferred in moments
              (typically under 1 minute). You can view the status of your
              playlist transfer in the transfers tab, or on the{" "}
              {'"Transfer History"'} tab.
            </p>
            <div className="w-[250px] h-[250px] bg-neutral-300 flex text-center items-center">
              GIF HERE SHOWING HOW TO USE THE TRANSFER BUTTON AND LOOK AT
              TRANSFER HISTORY
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

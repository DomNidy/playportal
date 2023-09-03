import Navbar from "@/components/landing-page/Navbar";
import Image from "next/image";
import { Metadata } from "next";

import spotifyIcon from "@/public/spotify-icon.svg";
import youtubeIcon from "@/public/youtube-icon.svg";
import soundcloudIcon from "@/public/soundcloud-icon.svg";
import bgDrawing from "@/public/bg.png";

export const metadata: Metadata = {
  keywords: [
    "Playlist transfer",
    "share playlists",
    "music migration",
    "cross-platform sharing",
    "PlayPortal",
    "Transfer playlists",
    "Bulk playlists transfer",
    "Spotify playlist to youtube",
    "Transfer youtube playlist to spotify",
    "Youtube playlist editor",
    "Spotify playlist editor",
  ],
  description:
    "Easily transfer playlists between music platforms and share them with friends using PlayPortal. Simplify playlist management and discovery today.",
};

export default function Home() {
  return (
    <>
      <Navbar />
      {/* This is our main div (it has top padding in it, this accounts for the navbar) */}
      <main className="w-full min-h-screen  bg-background pt-10 pb-4 ">
        <Image
          src={bgDrawing}
          alt=""
          className="fixed  object-cover resize-none h-screen w-screen -left-12"
        />
        <header className="w-full min-h-[20rem] flex items-center justify-center  cursor-default flex-col underline">
          <h1 className="text-5xl text-primary tracking-tighter font-bold ">
            Playportal
          </h1>
          <h2 className="text-4xl text-primary tracking-tighter font-bold">
            Transfer
          </h2>

          <h2 className="text-4xl text-primary tracking-tighter font-bold">
            Sync
          </h2>

          <h2 className="text-4xl text-primary tracking-tighter font-bold">
            Share
          </h2>
        </header>
        <div className="flex justify-center ">
          <div className="pt-8 grid gap-8 pointer-events-none grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:max-w-screen-md lg:max-w-screen-lg dark:text-gray-400 text-slate-600 justify-center items-center place-items-center w-full">
            <div className="z-10 flex flex-col gap-1 p-2 items-center border-border border-[1.2px] bg-card rounded-lg w-72 min-h-[21.75rem] h-fit shadow-md  ">
              <h1 className="font-bold text-2xl ">Features</h1>
              <div className="max-w-[82%] p-1">
                <h2 className="list-item">
                  Create your own playlist portfolio
                </h2>

                <p className="italic text-sm text-slate-400 ">
                  easily organize and share music with others
                </p>
              </div>

              <div className="max-w-[82%] p-1">
                <h2 className="max-w-[80%] list-item">
                  Change playlist appearance
                </h2>

                <p className="italic text-sm  text-slate-400 ">
                  titles, cover image, description
                </p>
              </div>

              <div className="max-w-[82%] p-1">
                <h2 className="max-w-[80%] list-item">
                  View combined playlist info
                </h2>

                <p className="italic text-sm  text-slate-400 ">
                  total unique songs in all playlists, across multiple platforms
                </p>
              </div>
            </div>

            <div className="z-10 flex flex-col gap-1 p-2 items-center border-border border-[1.2px] bg-card rounded-lg w-72 min-h-[21.75rem] h-fit shadow-md  ">
              <h1 className="font-bold text-2xl select-none ">Platforms</h1>
              <h2 className="w-[85%] text-center">
                We support the following music services
              </h2>
              <div className="flex flex-col items-center justify-center">
                <div className="flex flex-row p-1">
                  <Image
                    src={spotifyIcon}
                    width={49}
                    alt="Spotify Icon"
                    className="relative -left-[1.8125rem]"
                  />
                  <h2 className="max-w-[80%] relative top-3 left-2 text-lg">
                    Spotify
                  </h2>
                </div>
                <div className="flex flex-row p-1">
                  <Image
                    src={soundcloudIcon}
                    width={56}
                    alt="SoundCloud Icon"
                    className="relative -left-2"
                  />
                  <h2 className="max-w-[80%] text-lg relative top-1 left-6">
                    SoundCoud
                  </h2>
                </div>
                <div className="flex flex-row p-1">
                  <Image
                    src={youtubeIcon}
                    width={94}
                    alt="YouTube Icon"
                    className="relative -left-5"
                  />
                  <h2 className="max-w-[80%] text-lg relative top-4 -left-1.5">
                    YouTube
                  </h2>
                </div>
              </div>

              <p className="italic text-sm text-slate-400 w-[89%] ">
                We are always working on adding additional services, to request
                the status of a service integration; please contact support.
              </p>
            </div>
            <div className="z-10 flex flex-col gap-1 p-2 items-center  border-border border-[1.2px] bg-card rounded-lg w-72  h-fit shadow-md  ">
              <h1 className="font-bold text-2xl">Support</h1>
              <div className="max-w-[89%]">
                <h2>Any questions?</h2>
              </div>

              <div className="p-1">
                <h2 className="">Email Contact</h2>

                <p className="italic text-sm  text-slate-400 ">
                  support@mail.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

import { Suspense } from "react";
import HeroText from "./components/landing-page/HeroText";
import Navbar from "./components/landing-page/Navbar";

export default function Home() {
  return (
    <div>
      <Navbar />
      {/* This is our main div (it has top padding in it, this accounts for the navbar) */}
      <main className="w-full min-h-screen bg-gray-100 pt-14 pb-1 ">
        <div className="w-full min-h-[20rem] flex items-center justify-center hero cursor-default drop-shadow-[0_1.1px_1.1px_rgba(0,0,0,0.4)]">
          <HeroText />
        </div>
        <div className="flex justify-center">
          <div className=" pt-8 grid gap-8  grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:max-w-screen-md lg:max-w-screen-lg text-slate-600 justify-center items-center place-items-center w-full">
            <div className="flex flex-col gap-1 p-2 items-center bg-gray-100 rounded-lg w-72 min-h-[14rem] h-fit shadow-md  ">
              <h1 className="font-bold text-2xl">Features</h1>
              <div className="max-w-[82%] p-1">
                <h2 className="list-item">
                  Create your own playlist portfolio
                </h2>

                <p className="italic text-sm  text-slate-400 ">
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

            <div className="flex flex-col gap-1 p-2 items-center bg-gray-100 rounded-lg w-72 min-h-[14rem] h-fit shadow-md  ">
              <h1 className="font-bold text-2xl">Features</h1>
              <div className="max-w-[82%] p-1">
                <h2 className="list-item">
                  Create your own playlist portfolio
                </h2>

                <p className="italic text-sm  text-slate-400 ">
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

            <div className="flex flex-col gap-1 p-2 items-center bg-gray-100 rounded-lg w-72 min-h-[14rem] h-fit shadow-md  ">
              <h1 className="font-bold text-2xl">Features</h1>
              <div className="max-w-[82%] p-1">
                <h2 className="list-item">
                  Create your own playlist portfolio
                </h2>

                <p className="italic text-sm  text-slate-400 ">
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
          </div>
        </div>
      </main>
    </div>
  );
}

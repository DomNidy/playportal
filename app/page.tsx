import { GetBaseUrl } from "@/lib/utility/GetBaseUrl";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Lazy loading client component
const LoginRedirectHandler = dynamic(
  () => import("@/components/landing-page/LoginRedirectHandler"),
  {}
);

export default function Home() {
  return (
    <>
      <main
        className={`light w-full min-h-[95%]  p-2 h-[730px] overflow-hidden bg-background  text-white  main-bg   ${inter.className}
       `}
      >
        <nav
          className="sticky top-0  max-w-[100vw] w-full pt-2 h-14 text-sm md:text-lg 
                        font-semibold text-[#FFFFFF] flex-row-reverse flex sm:justify-start  justify-center"
        >
          <ul
            className="
            mt-4 sm:-translate-x-1/4
            basis-[330px]  flex flex-row justify-between"
          >
            <h3 className="cursor-pointer">Features</h3>
            <h3 className="cursor-pointer">Help</h3>
            <LoginRedirectHandler />
          </ul>
        </nav>
        <header
          className="flex flex-col self-center justify-center h-full -mt-12 
          items-center
         "
        >
          <h1
            className="
            text-center 
             -tracking-[0.035em]  font-[600]
           text-[3.8rem] leading-[63px] "
          >
            Control Your Music
          </h1>
          <p
            className="
          text-center font-[600]
          text-[1.125rem] leading-[33px]  max-w-[300px] sm:max-w-none mt-2 sm:mt-0 "
          >
            Transfer your playlists in seconds!
          </p>

          <Link
            href={`${GetBaseUrl()}login`}
            className="bg-gradient-to-b relative top-16 rounded-[30px] hover:scale-110 transition-transform duration-200 bg-[#C10080] hover:bg-[#ae3686]  shadow-md font-bold mt-6 -tracking-[1.35px] 
          text-[23px] px-[50px] py-[5px] w-fit"
          >
            Start now
          </Link>
        </header>
      </main>
      <div className="bg-background min-h-[1200px] pt-20 px-4 flex flex-col gap-y-36 items-center ">
        <div className="flex max-w-2xl gap-8">
          <div
            className="sm:flex hidden min-w-[8.5rem] min-h-[8.5rem] main-secondary-bg rounded-full self-center text-6xl 
                      font-bold text-white items-center justify-center text-center"
          >
            ?
          </div>
          <div className="flex flex-col">
            <h2 className="text-4xl font-medium sm:text-left text-center tracking-tight border-b-2 w-fit pb-0.5">
              Transfer what now?
            </h2>
            <p className="text-md pt-1  text-[#131018] leading-[1.875rem] sm:text-left text-center">
              Playportal streamlines music migration. Whether you have a large
              playlist on one platform and want to switch to another, we take
              care of the manual work for you. Say goodbye to the hassle of
              searching and transferring your music.{" "}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
          <div className="flex flex-col max-w-2xl items-start">
            <h2 className="text-4xl font-medium text-center tracking-tight border-b-2 w-fit sm:text-left pb-0.5">
              How does that work?
            </h2>{" "}
            <p className="text-md pt-1 text-[#131018] leading-[1.875rem] text-center sm:text-left sm:max-w-[480px]">
              Getting started is easy with Playportal. Link your streaming
              accounts, choose the music you want to transfer, and submit the
              request. Our backend takes it from there, seamlessly parsing your
              selected tracks and adding them to your destination platform{"'"}s
              playlist!
            </p>
          </div>
          <div className="flex flex-col items-center ">
            <svg
              width="184"
              height="196"
              viewBox="0 0 344 326"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M106 108.192C179.681 95.2969 195.387 80.0244 194.03 74M146.199 201C196.676 126.754 204.886 124.149 202.681 132.127"
                stroke="#6D6D6D"
                strokeWidth="2"
              />
              <path
                d="M92 285C59.017 185.316 57.8285 162.147 61.357 163.024"
                stroke="#6D6D6D"
                strokeWidth="2"
              />
              <rect x="195" width="149" height="149" rx="38" fill="#7A43C9" />
              <rect x="195" width="149" height="149" rx="38" fill="#954AFF" />
              <rect x="195" width="149" height="149" rx="38" fill="#FF114A" />
              <rect y="58" width="105" height="105" rx="27" fill="#7A43C9" />
              <rect y="58" width="105" height="105" rx="27" fill="#954AFF" />
              <rect y="58" width="105" height="105" rx="27" fill="#2D66F8" />
              <rect
                x="90"
                y="201"
                width="125"
                height="125"
                rx="38"
                fill="#7A43C9"
              />
              <rect
                x="90"
                y="201"
                width="125"
                height="125"
                rx="38"
                fill="#954AFF"
              />
              <rect
                x="90"
                y="201"
                width="125"
                height="125"
                rx="38"
                fill="#2FFF69"
              />
            </svg>
            <p className="text-muted-foreground text-sm max-w-[200px] text-center italic">
              {"("}Super technical diagram explaining playlist transfers{")"}
            </p>
          </div>
        </div>
        <div className="flex flex-col">
          <h2 className="text-4xl font-medium text-center tracking-tight border-b-2 w-fit sm:text-left pb-0.5">
            Frequently asked Questions
          </h2>
          <Accordion type="single" collapsible className="max-w-xl ">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left">
                What platforms are supported?
              </AccordionTrigger>
              <AccordionContent>
                Currently we only support Spotify and Youtube, but may add
                support for additional platforms in the future!
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                How long will it take to transfer my playlist?
              </AccordionTrigger>
              <AccordionContent>
                Times may vary depending on the size of your playlist, but most
                playlists will typically complete transferring within a few
                minutes {"("}smaller playlists in seconds.{")"}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                Where can I sign up?
              </AccordionTrigger>
              <AccordionContent className="pt-3">
                <Link
                  href={`${GetBaseUrl()}login`}
                  className="bg-gradient-to-b rounded-[30px] hover:scale-110 transition-transform duration-200 bg-[#C10080] hover:bg-[#ae3686] text-primary-foreground shadow-md font-bold mt-6 -tracking-[1.35px] 
          text-[24px] px-[10px] py-[5px] w-fit"
                >
                  By clicking me!
                </Link>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
      <footer className="min-h-[600px] w-full main-footer-bg flex flex-col-reverse py-16 px-0 sm:px-10">
        <div className="basis-32 font-medium text-muted text-lg  sm:text-2xl flex flex-row justify-evenly">
          <div className="flex flex-col w-[80px]">
            <h3>Playportal</h3>
            <ul className=" text-sm  text-gray-300 sm:text-base ">
              <li>Login</li>
              <li>Home</li>
            </ul>
          </div>
          <div className="flex flex-col text-center w-[80px]">
            <h3>Help</h3>
            <ul className=" text-sm  text-gray-300 sm:text-base ">
              <li>Contact</li>
              <li>FAQ</li>
            </ul>
          </div>
          <div className="flex flex-col text-right w-[80px]">
            <h3>Legal</h3>
            <ul className=" text-sm  text-gray-300 sm:text-base ">
              <li>T.O.S</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-grow items-center flex-col  text-primary-foreground">
          <div className="flex flex-col text-center max-w-sm   gap-3.5">
            <h2 className="font-semibold  text-5xl">Need help?</h2>
            <p>
              Have any questions? Please feel free to contact us and we’ll do
              our best to answer!{" "}
            </p>
            <div className="w-full flex justify-evenly">
              <Link
                href={`${GetBaseUrl()}`}
                className="bg-gradient-to-b relative top-16 rounded-[30px] hover:scale-110 transition-transform duration-200 bg-[#C10080] hover:bg-[#ae3686]  shadow-md font-[600]  -tracking-[1.35px] 
          text-[21px] px-[10px] py-[2px] w-[115px]"
              >
                FAQ
              </Link>
              <Link
                href={`${GetBaseUrl()}`}
                className="bg-gradient-to-b relative top-16 rounded-[30px] hover:scale-110 transition-transform duration-200 bg-[#C10080] hover:bg-[#ae3686]  shadow-md font-[600]  -tracking-[1.35px] 
          text-[21px] px-[10px] py-[2px] w-[115px]  "
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

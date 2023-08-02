"use client";
import { useContext } from "react";
import DashboardRedirectHandler from "../components/dashboard/DashboardRedirectHandler";
import { AuthContext } from "../contexts/AuthContext";
import spotifyIcon from "@/public/spotify-icon.svg";
import soundcloudIcon from "@/public/soundcloud-icon.svg";
import youtubeIcon from "@/public/youtube-icon.svg";
import Image from "next/image";
import { Button } from "../components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
export default function Dashboard() {
  const authContext = useContext(AuthContext);
  return (
    <div className="min-h-screen w-full bg-background p-12">
      <DashboardRedirectHandler />
      <h1 className=" text-6xl tracking-tighter dark:text-zinc-200">
        Get started
      </h1>
      <div className="grid grid-cols-1 w-full gap-12 place-items-center mt-10 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 ">
        <div className="bg-zinc-400 dark:bg-zinc-900 dark:text-zinc-200 lg:w-80 min-h-[16rem] max-w-[20rem] h-fit rounded-lg drop-shadow-md font-semibold text-primary-foreground p-3 gap-2 flex flex-col">
          <h1 className="text-3xl tracking-tighter">Placeholder</h1>
          <p className="tracking-tight ">
            This is a placeholder description. These cards will contain links to
            pages along with descriptions that tells you what the page does, and
            how to use the service.
          </p>
          <div className="w-full h-full flex justify-evenly items-center">
            <Button className="w-24">Button</Button>
          </div>
        </div>
        <div className="bg-zinc-400 dark:bg-zinc-900 dark:text-zinc-200 lg:w-80 min-h-[16rem] max-w-[20rem] h-fit rounded-lg drop-shadow-md font-semibold text-primary-foreground p-3 gap-2 flex flex-col">
          <h1 className="text-3xl tracking-tighter">Placeholder</h1>
          <p className="tracking-tight ">
            This is a placeholder description. These cards will contain links to
            pages along with descriptions that tells you what the page does, and
            how to use the service.
          </p>
          <div className="w-full h-full flex justify-evenly items-center">
            <Button className="w-24">Button</Button>
          </div>
        </div>
        <div className="bg-zinc-400 dark:bg-zinc-900 dark:text-zinc-200 lg:w-80 min-h-[16rem] max-w-[20rem] h-fit rounded-lg drop-shadow-md font-semibold text-primary-foreground p-3 gap-2 flex flex-col">
          <h1 className="text-3xl tracking-tighter">Placeholder</h1>
          <p className="tracking-tight ">
            This is a placeholder description. These cards will contain links to
            pages along with descriptions that tells you what the page does, and
            how to use the service.
          </p>
          <div className="w-full h-full flex justify-evenly items-center">
            <Button className="w-24">Button</Button>
          </div>
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Open popover</Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Dimensions</h4>
                <p className="text-sm text-muted-foreground">
                  Set the dimensions for the layer.
                </p>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="width">Width</Label>
                  <Input
                    id="width"
                    defaultValue="100%"
                    className="col-span-2 h-8"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="maxWidth">Max. width</Label>
                  <Input
                    id="maxWidth"
                    defaultValue="300px"
                    className="col-span-2 h-8"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="height">Height</Label>
                  <Input
                    id="height"
                    defaultValue="25px"
                    className="col-span-2 h-8"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="maxHeight">Max. height</Label>
                  <Input
                    id="maxHeight"
                    defaultValue="none"
                    className="col-span-2 h-8"
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

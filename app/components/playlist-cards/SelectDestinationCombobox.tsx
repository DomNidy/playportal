"use client";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/app/components/ui/command";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import { useState } from "react";

const playlists = [
  { value: "playlist1", label: "Playlist 1" },
  { value: "playlist2", label: "Playlist 2" },
  { value: "playlist3", label: "Playlist 3" },
  { value: "playlist4", label: "Playlist 4" },
  { value: "playlist5", label: "Playlist 5" },
];

export function SelectDestinationCombobox() {
  const [open, setOpen] = useState<true | false>(false);
  const [value, setValue] = useState<string>("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? playlists.find((playlist) => playlist.value === value)?.label
            : "Select destination playlist..."}

          <ChevronsUpDown className="ml-2  h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Command>
          <CommandInput placeholder="Search destination playlist..." />
          <CommandEmpty>No playlist found...</CommandEmpty>
          <CommandGroup>
            {playlists.map((playlist) => (
              <CommandItem
                key={playlist.value}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? "" : currentValue);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === playlist.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {playlist.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

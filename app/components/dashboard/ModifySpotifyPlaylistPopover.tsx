import {
  Dispatch,
  FocusEvent,
  FormEvent,
  SetStateAction,
  SyntheticEvent,
  useContext,
  useRef,
  useState,
} from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { AuthContext } from "@/app/contexts/AuthContext";
import { sendSpotifyPlaylistModification } from "@/app/fetching/FetchPlaylists";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "../ui/textarea";
import * as z from "zod";
import { GrClose } from "@react-icons/all-files/gr/GrClose";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";

const modifyPlaylistSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title must have at least 1 character")
      .max(100, "Title must be < 100 characters.")
      .optional(),
    description: z
      .string()
      .max(300, "Description must be < 300 characters.")
      .optional(),
  })
  .refine((data) => {
    // At least 1 property must exist
    return Object.keys(data).length >= 1;
  }, "At least one property is required");

export default function ModifySpotifyPlaylistPopover({
  updateCardTitleState,
  playlistDescription,
  playlistTitle,
  playlistID,
}: {
  updateCardTitleState: Dispatch<SetStateAction<string>>;
  playlistDescription: string | null;
  playlistTitle: string;
  playlistID: string;
}) {
  const authContext = useContext(AuthContext);

  // The form used to edit playlist inside of the popover window content
  const form = useForm<z.infer<typeof modifyPlaylistSchema>>({
    resolver: zodResolver(modifyPlaylistSchema),
    shouldUnregister: true,
  });

  // If the popover window is open
  const [open, setOpen] = useState<boolean>();

  // Title of the playlist
  const [titleState, setTitleState] = useState<string | undefined>(
    playlistTitle
  );

  // Description of the playlist
  const [descriptionState, setDescriptionState] = useState<
    string | undefined | null
  >(playlistDescription);

  async function onSubmit(values: z.infer<typeof modifyPlaylistSchema>) {
    try {
      console.log(values);

      // Check if user is authed
      if (!authContext?.currentUser) {
        return;
      }

      console.log("Sending request");
      sendSpotifyPlaylistModification(
        {
          playlist_id: playlistID,
          modifications: {
            ...values,
          },
        },

        authContext
      ).then((response) => {
        // If the request was successful, update the name of this playlist
        if (response && response.ok) {
          updateCardTitleState(values.title!);
          setTitleState(values.title);
        } else {
          alert("Request failed");
        }
      });

      // Close the popover window after submit
      // TODO: We can put a loading state here if we await sendSpotifyPlaylistModificaitonFunction
      setOpen(false);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <Popover open={open}>
      <PopoverTrigger className="z-20 " asChild>
        <Button
          variant={"outline"}
          className="rounded-full hover:zinc-600 hover:opacity-100 bg-primary-foreground w-10 h-10 flex items-center justify-center hover:bg-secondary transition-all"
          onClick={() => setOpen(true)}
        >
          ...
        </Button>
      </PopoverTrigger>
      <PopoverContent
        onBlur={(e: FocusEvent) => {
          // If related target is null (we clicked outside the box)
          // Close the popover
          if (!e.relatedTarget) {
            setOpen(false);
          }
        }}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <GrClose
                className="absolute right-2 top-2 text-xl hover:cursor-pointer bg-zinc-200 rounded-full p-0.5"
                onClick={() => setOpen(false)}
              />
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Edit Playlist</h4>
                <p className="text-sm text-muted-foreground">
                  Modifying this playlist will apply the changes on Spotify as
                  well.
                </p>
              </div>
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="title">Title</Label>
                      <FormControl>
                        <Input
                          {...field}
                          id="title"
                          placeholder={titleState}
                          className="col-span-2 h-8"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="Description">Description</Label>
                      <FormControl>
                        <Textarea
                          {...field}
                          id="description"
                          placeholder={descriptionState || "New description"}
                          className="col-span-2 h-8"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <Button type="submit" className="mt-4">
              Apply
            </Button>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  );
}

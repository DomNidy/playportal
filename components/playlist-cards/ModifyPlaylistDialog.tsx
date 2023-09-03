import {
  Dispatch,
  FocusEvent,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { AuthContext } from "@/lib/contexts/AuthContext";
import { sendPlaylistModification } from "@/lib/fetching/FetchPlaylists";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "../ui/textarea";
import * as z from "zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Platforms } from "@/definitions/Enums";
import { getPlatformModificationSchema } from "@/definitions/Schemas";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";

// The properties used to construct our Dialog component
type ModifyPlaylistDialogProps = {
  // A function that updates the state of the assosciated playlist card title upon modification
  updateCardTitleState: Dispatch<SetStateAction<string>>;
  // A function that updates the state of the assosciated playlist card description upon modification
  updateCardDescriptionState?: Dispatch<
    SetStateAction<string | null | undefined>
  >;
  // The platform which the playlist comes from
  playlistPlatform: Platforms;
  // Properties of the playlist
  playlistDescription?: string;
  playlistTitle: string;
  playlistID: string;
};

export default function ModifyPlaylistDialog({
  playlist,
}: {
  playlist: ModifyPlaylistDialogProps;
}) {
  // The schema for the specific platform
  const platformSchema = getPlatformModificationSchema(
    playlist.playlistPlatform
  );
  const authContext = useContext(AuthContext);

  // The form used to edit playlist inside of the popover window content
  const form = useForm<z.infer<typeof platformSchema>>({
    resolver: zodResolver(platformSchema),
    mode: "onChange",
  });

  // If the popover window is open
  const [open, setOpen] = useState<boolean>();

  // Title of the playlist
  const [titleState, setTitleState] = useState<string>(
    playlist.playlistTitle ?? ""
  );

  // Description of the playlist
  const [descriptionState, setDescriptionState] = useState<string>(
    playlist.playlistDescription ?? ""
  );

  async function onSubmit(values: z.infer<typeof platformSchema>) {
    try {
      // Check if user is authed
      if (!authContext?.currentUser) {
        return;
      }

      console.log("Values", values);

      // Send the modification request to its respective platform
      sendPlaylistModification(
        playlist.playlistPlatform,
        {
          playlist_id: playlist.playlistID,
          modifications: {
            ...values,
          },
        },
        authContext
      ).then((response) => {
        // If the request was successful, update the name of this playlist
        if (response && response.ok) {
          // TODO: Update the state of ONLY the properties that changed

          // Update state of playlist card component
          playlist.updateCardTitleState(values.title!);

          // Update state of this component
          setTitleState(values.title);
          setDescriptionState(values.description);
        } else {
          alert(
            `Request failed, please try relogging. If that doesn't work, try reconnecting your ${playlist.playlistPlatform} account. `
          );
        }
      });

      // TODO: Close the popover window after submit
      setOpen(false);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="z-20 " asChild>
        <Button
          variant={"outline"}
          className="rounded-full hover:bg-secondary hover:opacity-100 bg-primary w-10 h-10 flex items-center justify-center transition-all"
        >
          ...
        </Button>
      </DialogTrigger>
      <DialogContent
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
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Edit Playlist</h4>
                <p className="text-sm text-muted-foreground">
                  Modifying this playlist will apply the changes on{" "}
                  {playlist.playlistPlatform} as well.
                </p>
              </div>
              <div className="grid gap-2">
                <FormField
                  name="title"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <Label htmlFor="title">Title</Label>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            id="title"
                            placeholder={"Enter a title"}
                            className="col-span-2 h-8"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  name="description"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <Label htmlFor="Description">Description</Label>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value ?? ""}
                            id="description"
                            placeholder={"Enter a description"}
                            className="col-span-2 h-8"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
            </div>
            <Button type="submit" className="mt-4">
              Apply
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

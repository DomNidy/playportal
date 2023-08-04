"use client";

import { useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../ui/context-menu";

export default function PlaylistCardContextMenu({
  playlist_url,
  platform_name,
}: {
  playlist_url: string;
  platform_name: string;
}) {
  const [playlistURL, setPlaylistURL] = useState<string>(playlist_url);
  const [platformName] = useState<string>(platform_name);

  // TODO: Implement this, we may potentially when to move the to the base playlist card
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div>Right click this</div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem inset>
          <a href={playlistURL} target="_blank">
            Open on {platformName}
          </a>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

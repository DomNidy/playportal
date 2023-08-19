import { Platforms } from "@/definitions/Enums";
import spotifyIcon from "@/public/spotify-icon.svg";
import youtubeIcon from "@/public/youtube-icon.svg";

/**
 * Given a `Platforms` parameter, return the src of the SVG of that platforms icon
 *
 * (Pass this as the `src` prop to `<Image/>` component)
 * @param {any} platform:Platforms
 * @returns {any}
 */
export default function getPlatformSVG(platform: Platforms) {
  switch (platform) {
    case Platforms.SPOTIFY:
      return spotifyIcon;
    case Platforms.YOUTUBE:
      return youtubeIcon;
  }
}

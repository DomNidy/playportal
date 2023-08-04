import { z } from "zod";
import { Platforms } from "./Enums";

// This specifices the requirements the Spotify Api has for modifications
export const SpotifyModificationSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title must be at least 1 character long.")
      .max(100, "Title must be <= 100 characters long.")
      .optional(),
    description: z
      .string()
      .max(300, "Description must be <= 300 characters.")
      .optional(),
  })
  .refine((data) => {
    console.log("Got data", data);
    // At least 1 property must exist and not be undefined
    for (const prop in data) {
      if (!!prop) {
        return true;
      }
    }
    return false;
  }, "At least one property is required.");

//  This specifices the requirements the Youtube Api has for modifications
export const YoutubeModificationSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title must be at least 1 character long.")
      .max(150, "Title must be <= 150 characters long.")
      .optional(),
    description: z
      .string()
      .max(5000, "Description must be <= 5000 characters.")
      .optional(),
  })
  .refine((data) => {
    // At least 1 property must exist and not be undefined
    for (const prop in data) {
      if (!!prop) {
        return true;
      }
    }
    return false;
  }, "At least one property is required.");

/**
 * This function returns the schema assosciated with their playlist modifications api
 * Things such as, max title length, max description length, etc..
 * @param {any} platform A platform defined in `Platforms`
 * @returns {any} A zod schema object
 */
export function getPlatformModificationSchema(
  platform: Platforms
): z.ZodEffects<z.ZodObject<any>> {
  switch (platform) {
    case Platforms.SPOTIFY:
      return SpotifyModificationSchema;
    case Platforms.YOUTUBE:
      return YoutubeModificationSchema;
    default:
      throw new Error(
        "The provided platform does not have a modification schema, create one!"
      );
  }
}

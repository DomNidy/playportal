import { z } from "zod";
import { Platforms } from "./Enums";
import { randomUUID } from "crypto";

// TODO: Can probably extend a zod schema instead of making 2 separate schema.

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
  .refine(
    (data) => data.title !== undefined || data.description !== undefined,
    {
      message: "Either title or description should be defined.",
      path: ["title"],
    }
  );

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
  .refine(
    (data) => data.title !== undefined || data.description !== undefined,
    {
      message: "Either title or description should be defined.",
      path: ["title"],
    }
  );
// This specifies the structure of a notifications object received from the server
export const NotificationObjectSchema = z.object({
  createdAtMS: z.number(),
  id: z.string(),
  recipientUUID: z.string(),
  seen: z.boolean(),
  title: z.string(),
  description: z.string().optional(),
  type: z.string(),
});

export const NotificationResponseObjectSchema = z.record(
  NotificationObjectSchema
);

// This specifies the requirements for the transfer form
export const TransferFormSchema = z
  .object({
    fromPlaylist: z.object({
      playlistName: z.string(),
      trackCount: z.number().min(1, "You cannot transfer an empty playlist."),
      platform: z.nativeEnum(Platforms),
    }),
    toPlaylist: z.object({
      playlistName: z.string(),
      trackCount: z.number().optional(),
      platform: z.nativeEnum(Platforms),
    }),
  })
  .refine((data) => data.fromPlaylist.platform !== data.toPlaylist.platform, {
    message: `Cannot transfer a playlist to the same platform which it originates from`,
  });

/**
 * Schema for the register form
 */
export const RegisterFormSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: "You must enter an email address." })
      .email(),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long." })
      .max(128, {
        message: "Password should not exceed 128 characters in length.",
      })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter",
      })
      .regex(/[0-9]/, {
        message: "Password must contain at least one digit",
      }),
    confirmPassword: z.string().min(8).max(128),
  })
  .superRefine((val, ctx) => {
    if (val.confirmPassword !== val.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "The password and confirm password fields must match.",
        path: ["confrimPassword"],
      });
    }
  });

/**
 * Schema for the login form
 */
export const LoginFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: "You must enter an email address." })
    .email(),
  // Perform client side validation on password to reduce unnecessary login attempts & server load (we know these will fail if zod doesnt parse successfully)
  password: z
    .string()
    .min(8, { message: "Invalid password format." })
    .max(128, { message: "Invalid password format." })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]+$/, {
      message: "Invalid password format.",
    }),
  // If we should remember the users login details
  rememberMe: z.boolean(),
});

/**
 * Schema for the reset password form
 */
export const ResetPasswordFormSchema = z.object({
  resetEmail: z
    .string()
    .min(1, { message: "You must enter an email address." })
    .email(),
});

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

import { randomBytes, createCipheriv, createDecipheriv } from "crypto";
import {
  SpotifyAccessToken,
  EncryptedSpotifyAccessToken,
} from "../interfaces/SpotifyInterfaces";
import { isValidSpotifyToken } from "./SpotifyTokens";
import {
  EncryptedYoutubeAccessToken,
  YoutubeAccessToken,
} from "../interfaces/YoutubeInterfaces";
import { isValidYoutubeToken } from "./YoutubeTokens";

/**
 * Encrypts a `SpotifyAccessToken` so it can be safely stored in the database
 * @param {SpotifyAccessToken} token The `SpotifyAccessToken` to encrypt
 * @returns {EncryptedSpotifyAccessToken | undefined} Will return a `EncryptedSpotifyAccessToken` or `undefined` if the method fails
 * or the encryption key could not be found in the environment variables
 */
export function encryptSpotifyToken(
  token: SpotifyAccessToken
): EncryptedSpotifyAccessToken | undefined {
  const tokenString = JSON.stringify(token);
  const iv = randomBytes(16);

  if (process.env.ENCRYPT_KEY) {
    const cipher = createCipheriv(
      "aes-256-cbc",
      Buffer.from(process.env.ENCRYPT_KEY),
      iv
    );

    let encrypted = cipher.update(tokenString);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return {
      iv: iv.toString("hex"),
      encrypted: encrypted.toString("hex"),
    };
  }
  console.log("Could not encrypt access token, ENCRYPT_KEY is undefined");
  return undefined;
}
/**
 * Decrypts an `EncryptedSpotifyAccessToken` so we can use it to make requests
 * @param {EncryptedSpotifyAccessToken} encryptedToken The `EncryptedSpotifyAccessToken` we want to decrypt
 * @returns {SpotifyAccessToken | undefined | any} A `SpotifyAccessToken` if the method is successful, otherwise `undefined`
 */

export function decryptSpotifyToken(
  encryptedToken: EncryptedSpotifyAccessToken
): SpotifyAccessToken | undefined {
  let iv = Buffer.from(encryptedToken.iv, "hex");
  let encryptedText = Buffer.from(encryptedToken.encrypted, "hex");

  if (process.env.ENCRYPT_KEY) {
    const decipher = createDecipheriv(
      "aes-256-cbc",
      Buffer.from(process.env.ENCRYPT_KEY),
      iv
    );

    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    const decryptedToken = JSON.parse(decrypted.toString("utf-8"));

    if (isValidSpotifyToken(decryptedToken)) {
      return decryptedToken;
    }

    console.error("Decrypted token was invalid", decryptedToken);
    return undefined;
  }
  return undefined;
}

/**
 * Encrypts a `YoutubeAccessToken` so it can be safely stored in the database
 * @param {YoutubeAccessToken} token The `YoutubeAccessToken` to encrypt
 * @returns {EncryptedYoutubeAccessToken | undefined} Will return a `EncryptedSpotifyAccessToken` or `undefined` if the method fails
 * or the encryption key could not be found in the environment variables
 */
export function encryptYoutubeToken(
  token: YoutubeAccessToken
): EncryptedYoutubeAccessToken | undefined {
  const tokenString = JSON.stringify(token);
  const iv = randomBytes(16);

  if (process.env.ENCRYPT_KEY) {
    const cipher = createCipheriv(
      "aes-256-cbc",
      Buffer.from(process.env.ENCRYPT_KEY),
      iv
    );

    let encrypted = cipher.update(tokenString);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return {
      iv: iv.toString("hex"),
      encrypted: encrypted.toString("hex"),
    };
  }
  console.log("Could not encrypt access token, ENCRYPT_KEY is undefined");
  return undefined;
}

/**
 * Decrypts an `EncryptedYoutubeAccessToken` so we can use it to make requests
 * @param {EncryptedYoutubeAccessToken} encryptedToken The `EncryptedYoutubeAccessToken` we want to decrypt
 * @returns {YoutubeAccessToken | undefined | any} A `YoutubeAccessToken` if the method is successful, otherwise `undefined`
 */

export function decryptYoutubeToken(
  encryptedToken: EncryptedYoutubeAccessToken
): YoutubeAccessToken | undefined {
  let iv = Buffer.from(encryptedToken.iv, "hex");
  let encryptedText = Buffer.from(encryptedToken.encrypted, "hex");

  if (process.env.ENCRYPT_KEY) {
    const decipher = createDecipheriv(
      "aes-256-cbc",
      Buffer.from(process.env.ENCRYPT_KEY),
      iv
    );

    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    const decryptedToken = JSON.parse(decrypted.toString("utf-8"));

    if (isValidYoutubeToken(decryptedToken)) {
      return decryptedToken;
    }

    console.error("Decrypted token was invalid", decryptedToken);
    return undefined;
  }
  return undefined;
}

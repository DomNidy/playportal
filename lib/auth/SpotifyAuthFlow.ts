import { StorageKeys } from "@/definitions/Enums";
import { GetBaseUrl } from "../utility/GetBaseUrl";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";

// TODO: Read this from .env instead
export const SPOTIFY_CLIENT_ID = "7729d99a51604e58b7d7daca1fd4cb24";

export async function loginSpotify(
  client_id: string,
  router: AppRouterInstance
) {
  // Generate a state value on client side (this will be returned from the spotify api, and the spotify api returned state should match the one stored in session storage, used to protect against csrf attacks)
  const state = generateCodeVerifier(128);
  localStorage.setItem("state", state);

  const params = new URLSearchParams();
  params.append("response_type", "code");
  params.append("client_id", client_id);
  params.append(
    "scope",
    "user-read-private user-read-email playlist-read-private playlist-modify-private playlist-modify-public"
  );
  params.append(
    "redirect_uri",
    `${GetBaseUrl()}api/user/spotify/token/callback`
  );
  params.append("state", state);


  router.push(`https://accounts.spotify.com/authorize?${params.toString()}`);
}

export function clearLocalStorageSpotifyData() {
  localStorage.removeItem(StorageKeys.SPOTIFY_CODE);
  localStorage.removeItem(StorageKeys.SPOTIFY_CODE_CHALLENGE);
  localStorage.removeItem(StorageKeys.SPOTIFY_CODE_VERIFIER);
  localStorage.removeItem(StorageKeys.SPOTIFY_ACCESS_TOKEN);
  localStorage.removeItem(StorageKeys.SPOTIFY_USER_PROFILE);
  console.log("Cleared local storage spotify data.");
}

function generateCodeVerifier(length: number) {
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

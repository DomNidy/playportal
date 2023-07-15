import { StorageKeys } from "../interfaces/SpotifyInterfaces";

// TODO: Read this from .env instead
export const CLIENT_ID = "7729d99a51604e58b7d7daca1fd4cb24";

export function clearLocalStorageSpotifyData() {
  localStorage.removeItem(StorageKeys.CODE);
  localStorage.removeItem(StorageKeys.CODE_CHALLENGE);
  localStorage.removeItem(StorageKeys.CODE_VERIFIER);
  localStorage.removeItem(StorageKeys.ACCESS_TOKEN);
  localStorage.removeItem(StorageKeys.USER_PROFILE);

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

async function generateCodeChallenge(codeVerifier: string) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  const challenge = btoa(
    String.fromCharCode.apply(null, [...new Uint8Array(digest)])
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  localStorage.setItem("challenge", challenge);

  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function redirectToAuthCodeFlow(clientId: string) {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem("verifier", verifier);

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("response_type", "code");
  params.append("redirect_uri", "http://localhost:3000/callback");
  params.append(
    "scope",
    "user-read-private user-read-email playlist-read-private"
  );
  params.append("code_challenge_method", "S256");
  params.append("code_challenge", challenge);

  document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function validateAccessToken(
  accessToken: string | null
): Promise<boolean> {
  // If there is an access token in storage, check to see if it is expired
  if (accessToken != "undefined" && accessToken) {
    // Fetch user profile to test if access token works
    const fetchResult = await fetchProfile(accessToken);

    // The fetch result is valid if the returned object has a display name prop
    if (fetchResult.display_name) {
      // Update the userProfile in local storage
      localStorage.setItem("userProfile", JSON.stringify(fetchResult));
      // Return true as the access token is valid
      return true;
    }
  }
  return false;
}

export async function getAccessToken(
  clientId: string,
  code: string
): Promise<string> {
  const verifier = localStorage.getItem("verifier");

  // Try to find access token in local storage
  const accessToken = localStorage.getItem(StorageKeys.ACCESS_TOKEN);

  // If we already have an access token and it is valid (not expired), return the access token
  if (accessToken && (await validateAccessToken(accessToken))) {
    return accessToken;
  }

  const params = new URLSearchParams();

  params.append("client_id", clientId);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", "http://localhost:3000/callback");
  params.append("code_verifier", verifier!);

  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  const { access_token } = await result.json();
  localStorage.setItem("accessToken", access_token);
  return access_token;
}

export async function fetchProfile(token: string): Promise<any> {
  // TODO: This is here so we dont have to request spotify api as much, we can just store the user profile in local storage
  // TODO: This is only here for development (HMR causes page to reload a lot and thus request the api alot)
  // TODO: DISABLE THIS CODE TO RE-ENABLE PROPER FETCH BEHAVIOUR!
  if (localStorage.getItem("userProfile")) {
    return JSON.parse(localStorage.getItem("userProfile")!);
  }

  const result = await fetch("https://api.spotify.com/v1/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  return await result.json();
}

export async function loginSpotify(client_id: string) {
  // Generate a state value on client side (this will be returned from the spotify api, and the spotify api returned state should match the one stored in session storage, used to protect against csrf attacks)
  const state = generateCodeVerifier(128);
  localStorage.setItem("state", state);

  const params = new URLSearchParams();
  params.append("response_type", "code");
  params.append("client_id", client_id);
  params.append(
    "scope",
    "user-read-private user-read-email playlist-read-private"
  );
  params.append("redirect_uri", "http://localhost:3000/api/callback");
  params.append("state", state);

  document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

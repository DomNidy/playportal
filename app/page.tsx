"use client";
import axios from "axios";
import cookies from "js-cookie";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import Image from "next/image";
import { useState } from "react";

export default function Home(params: Params) {
  const [code, setCode] = useState<string | undefined>(
    params.searchParams.code
  );
  const [clientId, setClientId] = useState<string | undefined>();
  const [accessToken, setAccessToken] = useState<Object>();
  const [playlists, setPlaylists] = useState<Object | undefined>();

  // If we do not have the auth code, start auth code flow
  if (!code) {
    redirectToAuthCodeFlow();
  } else {
    // We do have auth code, fetch user profile
    console.log("Access token", cookies.get("accessToken"));

    console.log("PARSED", JSON.parse(cookies.get("accessToken")!).access_token)
    fetchProfile(JSON.parse(cookies.get("accessToken")!).access_token);
  }

  async function getAccessToken() {
    const accessToken = await axios.get("/api/spotify/get-access-token");

    if (accessToken.status === 200) {
      cookies.set("accessToken", JSON.stringify(accessToken.data.accessToken));
      cookies.set("client_id", accessToken.data.client_id);

      setAccessToken(accessToken.data.accessToken);
      setClientId(accessToken.data.client_id);

      console.log(
        `Got access token: ${accessToken.data.accessToken}\nGot client id: ${accessToken.data.client_id}`
      );
      return;
    }

    console.log("Failed to get spotify access token");
    return;
  }

  async function redirectToAuthCodeFlow() {
    // Get access token and client id
    await getAccessToken();

    if (!clientId || !accessToken) {
      console.log("No client id or access token, cannot authenticate");
      return;
    }

    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", "http://localhost:3000/");
    params.append("scope", "user-read-private user-read-email");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  async function fetchProfile(token: string): Promise<any> {
    const result = await fetch("https://api.spotify.com/v1/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    return await result.json();
  }

  function populateUI(profile: any) {
    // TODO: Update UI with profile data
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
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-16 gap-2">
      <button
        className="rounded-md bg-neutral-200 p-2 text-neutral-800 font-semibold"
        onClick={getAccessToken}
      >
        Request Access Token
      </button>
      <input
        className="rounded-sm bg-neutral-200 p-1 w-fit h-8 outline-none text-neutral-800 cursor-default"
        placeholder="Spotify access token"
      ></input>
    </main>
  );
}

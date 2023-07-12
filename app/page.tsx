"use client";
import axios from "axios";
import cookies from "js-cookie";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import Image from "next/image";
import { useEffect, useState } from "react";

interface UserProfile {
  country: string;
  display_name: string;
  email: string;
  explicit_content: {
    filter_enabled: boolean;
    filter_locked: boolean;
  };
  external_urls: { spotify: string };
  followers: { href: string; total: number };
  href: string;
  id: string;
  images: Image[];
  product: string;
  type: string;
  uri: string;
}

interface Image {
  url: string;
  height: number;
  width: number;
}

export default function Home(params: Params) {
  // The user profile returned from spotify api
  const [userProfile, setUserProfile] = useState<UserProfile | false>();

  // Playlists returned from spotify api
  const [playlists, setPlaylists] = useState<Object | undefined>();

  useEffect(() => {
    console.log("Running effect");

    // Client id of spotify application
    const clientId = "7729d99a51604e58b7d7daca1fd4cb24";
    // Code returned from spotify redirect (part of oAuthFlow)
    // Check localstorage for a code and params for a code (they are both the same code)
    const code = localStorage.getItem("code")
      ? localStorage.getItem("code")
      : params.searchParams.code;

    console.log("Code (param)", code);

    // If we do not have the auth code, start auth code flow
    if (!code) {
      redirectToAuthCodeFlow();
    } else {
      localStorage.setItem("code", code);

      // We do have auth code, get access token
      getAccessToken(clientId, code)
        // Then fetch user profile
        .then((accessToken) => fetchProfile(accessToken))
        // Then set user profile state
        .then((profile) => {
          setUserProfile(profile);
        })
        .catch((error) => {
          console.error(error);
        });
    }

    async function getAccessToken(
      clientId: string,
      code: string
    ): Promise<string> {
      const verifier = localStorage.getItem("verifier");

      // Check for access token in storage
      const accessToken = localStorage.getItem("accessToken");

      // If there is an access token in storage
      if (accessToken) {
        const fetchResult = await fetchProfile(accessToken);
        // The fetch result was valid (and thus the access token in local storage is not expired, so we dont need to get a new one)
        if (fetchResult.display_name) {
          localStorage.setItem("userProfile", JSON.stringify(fetchResult));
        }
        console.log("FETCH RES", fetchResult);
        return accessToken;
      }

      const params = new URLSearchParams();
      params.append("client_id", clientId);
      params.append("grant_type", "authorization_code");
      params.append("code", code);
      params.append("redirect_uri", "http://localhost:3000/");
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

    async function redirectToAuthCodeFlow() {
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
      console.log(challenge);
      return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    }
  }, [params.searchParams.code]);

  return (
    <div className="flex min-h-screen flex-col items-center p-16 gap-2 bg-gray-800">
      {userProfile && userProfile.images
        ? userProfile.images.map((img, idx) => (
            <Image
              key={idx}
              src={`${img.url}`}
              alt="User profile picture"
              width={img.width}
              height={img.height}
            />
          ))
        : ""}
      {userProfile ? (
        <ul className="text-lg text-gray-300 font-semibold">
          <li>
            Name:{" "}
            <span className="font-normal">{userProfile.display_name}</span>
          </li>
          <li>
            User ID: <span className="font-normal">{userProfile.id}</span>
          </li>
          <li>
            Profile Link:{" "}
            <span className="font-normal">
              {userProfile.external_urls?.spotify}
            </span>
          </li>
          <li>
            Followers:{" "}
            <span className="font-normal">{userProfile.followers.total}</span>
          </li>
          <li>
            Tier: <span className="font-normal">{userProfile.product}</span>
          </li>
        </ul>
      ) : (
        <p>Could not load user proifle...</p>
      )}
    </div>
  );
}

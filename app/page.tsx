"use client";
import axios from "axios";
import cookies from "js-cookie";
import {
  redirectToAuthCodeFlow,
  fetchProfile,
  getAccessToken,
} from "./utility/AuthFlowFunctions";
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
  const [userProfile, setUserProfile] = useState<UserProfile | false>(false);

  // Playlists returned from spotify api
  const [playlists, setPlaylists] = useState<Object | undefined>();

  // This value will be watched in our hook that fetches data from the server
  // It should be set to false after auth completes
  const [needsNewAuth, setNeedsNewAuth] = useState<boolean>(false);

  // This is set to true when the oAuth flow is finished
  const [loaded, setLoaded] = useState<boolean>(false);

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
      redirectToAuthCodeFlow(clientId);
    } else {
      localStorage.setItem("code", code);
      setLoaded(false);

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
        })
        .finally(() => {
          setLoaded(true);
        });
    }
  }, [params.searchParams.code, needsNewAuth]);

  return (
    <div className="flex min-h-screen flex-col items-center p-16 gap-2 bg-gray-800">
      {loaded && userProfile && userProfile.images
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
      {loaded &&
      userProfile &&
      userProfile?.followers?.total &&
      userProfile?.product ? (
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
            <span className="font-normal">{userProfile?.followers.total}</span>
          </li>
          <li>
            Tier: <span className="font-normal">{userProfile.product}</span>
          </li>
          <button
            className="bg-gray-200 rounded-md text-gray-700"
            onClick={() => setNeedsNewAuth(!needsNewAuth)}
          >
            Not You?
          </button>
        </ul>
      ) : (
        <div>
          <p>...</p>
        </div>
      )}

      {loaded && !userProfile ? (
        <div>
          <p>Could not load user proifle...</p>
          <button
            className="bg-gray-200 rounded-md text-gray-700"
            onClick={() => setNeedsNewAuth(!needsNewAuth)}
          >
            Retry
          </button>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

import { UserPlaylists, StorageKeys } from "../interfaces/SpotifyInterfaces";

export async function getCurrentUsersPlaylists(
  limit: number = 20,
  offset: number = 0
): Promise<UserPlaylists> {
  // Try to get accessToken from local storage
  const accessToken = localStorage.getItem(StorageKeys.ACCESS_TOKEN);

  // If access token was not found
  if (!accessToken) {
    console.log(
      "Cannot get current users playlist, access token was not found or was undefined"
    );
  }

  const result = await fetch(
    `https://api.spotify.com/v1/me/playlists?offset=${offset}&limit=${limit}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${JSON.parse(accessToken!).access_token}`,
      },
    }
  );

  return await result.json();
}

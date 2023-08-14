// "use client";
// import { useContext, useState } from "react";
// import { AuthContext } from "../contexts/AuthContext";
// import { fetchSpotifyPlaylists } from "../fetching/FetchPlaylists";
// import {
//   SpotifySimplifiedPlaylistObject,
//   UserSpotifyPlaylists,
// } from "@/definitions/SpotifyInterfaces";

// // TODO: FINISH IMPLEMENTING THIS, FIGURE OUT HOW TO SHOW PLAYLIST LOADING CARDS WHEN WE ARE FETCHING DATA
// export function useSpotifyPlaylistPaginator(limit: number) {
//   // user auth context
//   const authContext = useContext(AuthContext);

//   // Offset of data fetching (sent in the api request)
//   const [offset, setOffset] = useState<number>(0);

//   // The items we fetched from the source
//   const [playlistItems, setPlaylistItems] =
//     useState<SpotifySimplifiedPlaylistObject[]>();

//   // Whether all items have been fetched from the data source
//   const [isComplete, setIsComplete] = useState<boolean>(false);

//   // If we are loading playlists
//   const [isLoading, setIsLoading] = useState<boolean>(false);

//   return {
//     spotifyPlaylists: playlistItems,
//     spotifyOffset: offset,
//     fetchSpotify: async () => {
//       if (authContext && !isComplete) {
//         setIsLoading(true);
//         const fetchedItems = await fetchSpotifyPlaylists(
//           authContext,
//           offset,
//           4
//         );

//         if (!fetchedItems) {
//           // Ideally this should be refactored to only be set complete if the response status was 200 and fetched items was undefined
//           // Nothing was fetched, set complete
//           setIsComplete(true);
//           setPlaylistItems(undefined);
//           setIsLoading(false);
//         }

//         // We fetched less items than the limit, we are done fetching
//         if (fetchedItems && fetchedItems.items.length < limit) {
//           setIsComplete(true);
//           setPlaylistItems((prevItems) =>
//             prevItems
//               ? [...prevItems, ...fetchedItems.items]
//               : fetchedItems.items
//           );
//           setIsLoading(false);
//         }

//         // We fetched the same amount as the limit, we shoud try to fetch more
//         if (fetchedItems && fetchedItems.items.length === limit) {
//           setIsComplete(false);
//           setPlaylistItems((prevItems) =>
//             prevItems
//               ? [...prevItems, ...fetchedItems.items]
//               : fetchedItems.items
//           );
//           setOffset((prevOffset) => prevOffset + limit);
//           setIsLoading(false);
//         }
//       }
//     },
//     isSpotifyComplete: isComplete,
//     isSpotifyLoading: isLoading,
//   };
// }

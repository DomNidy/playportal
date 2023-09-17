import {
  TransferFormStates,
  TransferFormStateProperties,
  TransferFormTitleState,
} from "@/definitions/UserInterfaces";

/**
 *
 * @param state The current `TransferFormStates` of the transfer form window
 * @param params An object containing all necessary parameters to create the title state at all stages of the transfer form
 * @returns An object with the title state of the window based on the parameters received
 */
export function getTransferFormTitleState(
  state: TransferFormStates,
  params: TransferFormStateProperties
): TransferFormTitleState {
  switch (state) {
    case TransferFormStates.SELECTING_ORIGIN_PLATFORM:
      return {
        title: "I want to transfer a playlist from...",
        description:
          "Please select the platform which contains the playlist you wish to transfer.",
      };
    case TransferFormStates.SELECTING_ORIGIN_PLAYLIST:
      return {
        title: `This ${params.originPlatform} playlist should be transferred`,
        description: `Please select the ${params.originPlatform} playlist that you want to transfer.`,
      };
    case TransferFormStates.SELECTING_DESTINATION_PLATFORM:
      return {
        title: `My playlist '${params.originPlaylistName}' should be transferred to this platform`,
        description: `Please select the platform you wish to transfer your playlist "${params.originPlaylistName}" to.`,
      };

    case TransferFormStates.SELECTING_DESTINATION_PLAYLIST:
      return {
        title: `Put the songs from ${params.originPlaylistName} into this ${params.destinationPlatform} playlist`,
        description: `Please select the playlist we should transfer the songs from "${params.originPlaylistName}" into.`,
      };
    case TransferFormStates.REVIEWING_TRANSFER:
      return {
        title: "Review your transfer request",
        description:
          "Please verify that this is your desired playlist transfer.",
      };
    case TransferFormStates.VIEWING_TRANSFER_STATUS:
      return {
        title: "Playlist transfer status",
        description: `This is the progress of your playlist transfer from "${params.originPlaylistName}" to "${params.destinationPlaylistName}"`,
      };
  }
}

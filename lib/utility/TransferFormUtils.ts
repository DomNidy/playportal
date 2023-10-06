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
        title: `This ${params.origin?.playlistPlatform} playlist should be transferred`,
        description: `Please select the ${params.origin?.playlistPlatform} playlist that you want to transfer.`,
      };
    case TransferFormStates.SELECTING_DESTINATION_PLATFORM:
      return {
        title: `My playlist '${params.origin?.playlistTitle}' should be transferred to this platform`,
        description: `Please select the platform you wish to transfer your playlist "${params.origin?.playlistTitle}" to.`,
      };

    case TransferFormStates.SELECTING_DESTINATION_PLAYLIST:
      return {
        title: `Put the songs from ${params.origin?.playlistTitle} into this ${params.destination?.playlistPlatform} playlist`,
        description: `Please select the playlist we should transfer the songs from "${params.origin?.playlistTitle}" into.`,
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
        description: `This is the progress of your playlist transfer from "${params.origin?.playlistTitle}" to "${params.destination?.playlistTitle}"`,
      };
  }
}

/**
 * Given the state of the TransferForm, returns the state the transfer form must have been in previous to the current state
 * @param {any} currentState:TransferFormStates
 * @returns {any} The state the transfer form was in before the current state, if there is no possible previous state, returns undefined
 */
export function getPreviousTransferFormState(currentState: TransferFormStates) {
  switch (currentState) {
    case TransferFormStates.SELECTING_ORIGIN_PLATFORM:
      return undefined;
    case TransferFormStates.SELECTING_ORIGIN_PLAYLIST:
      return TransferFormStates.SELECTING_ORIGIN_PLATFORM;
    case TransferFormStates.SELECTING_DESTINATION_PLATFORM:
      return TransferFormStates.SELECTING_ORIGIN_PLAYLIST;
    case TransferFormStates.SELECTING_DESTINATION_PLAYLIST:
      return TransferFormStates.SELECTING_DESTINATION_PLATFORM;
    case TransferFormStates.REVIEWING_TRANSFER:
      return TransferFormStates.SELECTING_DESTINATION_PLAYLIST;
    // The user should not be shown a back button once the transfer has been completed, so we return undefined
    case TransferFormStates.VIEWING_TRANSFER_STATUS:
      return undefined;
  }
}

/**
 * Given the state of the TransferForm, returns the state the transfer form must go to next from the current state
 * @param {any} currentState: TransferFormStates
 * @returns {any} The state the transfer form should go to next from the current state, if there is no possible next state, returns undefined
 */
export function getNextTransferFormState(currentState: TransferFormStates) {
  switch (currentState) {
    case TransferFormStates.SELECTING_ORIGIN_PLATFORM:
      return TransferFormStates.SELECTING_ORIGIN_PLAYLIST;
    case TransferFormStates.SELECTING_ORIGIN_PLAYLIST:
      return TransferFormStates.SELECTING_DESTINATION_PLATFORM;
    case TransferFormStates.SELECTING_DESTINATION_PLATFORM:
      return TransferFormStates.SELECTING_DESTINATION_PLAYLIST;
    case TransferFormStates.SELECTING_DESTINATION_PLAYLIST:
      return TransferFormStates.REVIEWING_TRANSFER;
    case TransferFormStates.REVIEWING_TRANSFER:
      return TransferFormStates.VIEWING_TRANSFER_STATUS;
    // Once the transfer is completed, there is no next state, so we return undefined
    case TransferFormStates.VIEWING_TRANSFER_STATUS:
      return undefined;
  }
}

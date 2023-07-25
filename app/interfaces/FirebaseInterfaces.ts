import { AuthErrorCodes } from "firebase/auth";

interface ErrorCodeMapping {
  [code: string]: string;
}
export const FirebaseUserFacingErrorMessages: ErrorCodeMapping = {
  [AuthErrorCodes.INVALID_PASSWORD]: "Password is incorrect",
  [AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER]:
    "Too many requests, please try again later.",
  [AuthErrorCodes.USER_DELETED]: "Account does not exist",
  [AuthErrorCodes.EMAIL_EXISTS]: "Email already has an account",
};

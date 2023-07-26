"use client";
import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  isEmailValidFormat,
  isPasswordValidFormat,
  loginWithEmail,
  resetPassword,
  signUpWithEmail,
} from "../auth/GoogleAuthFlow";
import { useRouter } from "next/navigation";
import { FirebaseUserFacingErrorMessages } from "../interfaces/FirebaseInterfaces";

function ResetPasswordLayout({
  setResetPassOpen,
  isOpen,
}: {
  setResetPassOpen: Dispatch<SetStateAction<boolean | undefined>>;
  isOpen: boolean;
}) {
  const [email, setEmail] = useState<string>();
  return (
    <div className="items-center flex flex-col justify-center gap-3">
      <h3 className="text-xl text-neutral-600 font-semibold">Reset Password</h3>
      <input
        placeholder="Email"
        onInput={(e: FormEvent<HTMLInputElement>) => {
          const inputEvent = e.nativeEvent as InputEvent;
          if (inputEvent.data != " ") {
            setEmail(e.currentTarget.value);
          }
        }}
        className="p-0.5 rounded-md bg-white drop-shadow-[0_1.1px_1.1px_rgba(0,0,0,0.4)] text-black outline-none"
        spellCheck={false}
        value={email}
      ></input>
      <button
        className="bg-blue-500 hover:bg-blue-600 p-0.5 text-white font-semibold rounded-lg w-2/3"
        onClick={() => {
          if (isEmailValidFormat(email)) {
            resetPassword(email!);
          }
        }}
      >
        Reset password
      </button>
      <p
        className="text-sm cursor-pointer hover:text-blue-500 text-neutral-400"
        onClick={() => {
          setResetPassOpen(!isOpen);
        }}
      >
        Remembered it?
      </p>
    </div>
  );
}

function LoginLayout({
  setHasAccount,
  hasAccount,
  handleLogin,
  setResetPassOpen,
}: {
  hasAccount: boolean;
  setHasAccount: Dispatch<SetStateAction<boolean>>;
  setResetPassOpen: Dispatch<SetStateAction<boolean | undefined>>;
  handleLogin: (password: string) => void;
}) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  return (
    <div className="items-center flex flex-col justify-center ">
      <h3 className="text-xl text-neutral-600 font-semibold">Login</h3>
      <p
        onClick={() => setHasAccount(!hasAccount)}
        className="italic text-sm cursor-pointer hover:text-blue-500 text-neutral-400 pb-2"
      >
        Create an account instead
      </p>
      <div className="flex flex-col gap-3 justify-center items-center">
        <input
          onInput={(e) => setEmail(e.currentTarget.value)}
          placeholder="Email"
          className="p-0.5 rounded-md bg-white drop-shadow-[0_1.1px_1.1px_rgba(0,0,0,0.4)] text-black outline-none"
          spellCheck={false}
          value={email}
        ></input>
        <input
          onInput={(e) => setPassword(e.currentTarget.value)}
          placeholder="Password"
          className="p-0.5 rounded-md bg-white drop-shadow-[0_1.1px_1.1px_rgba(0,0,0,0.4)] text-black outline-none"
          spellCheck={false}
          value={password}
        ></input>
        <button
          className="bg-blue-500 p-0.5 hover:bg-blue-600 text-white font-semibold rounded-lg w-1/2"
          onClick={() => handleLogin(password)}
        >
          Login
        </button>
        <p
          className="italic text-sm cursor-pointer hover:text-blue-500 text-neutral-400 pb-2"
          onClick={() => setResetPassOpen((formerValue) => !formerValue)}
        >
          Forgot your password ?
        </p>
      </div>
    </div>
  );
}

function RegisterLayout({
  handleAuthenticateErrors,
  setPasswordIssues,
  setHasAccount,
  hasAccount,
}: {
  handleAuthenticateErrors: (loginResult: string | true | undefined) => void;
  setPasswordIssues: Dispatch<SetStateAction<string[]>>;
  setHasAccount: Dispatch<SetStateAction<boolean>>;
  hasAccount: boolean;
}) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  async function handleSignup() {
    // Test if our email is of valid format
    const emailValid = isEmailValidFormat(email);

    // Test if our password is of valid format
    const passwordValid = isPasswordValidFormat(password, confirmPassword);

    // If our passwords match
    const passwordsMatch = password === confirmPassword;

    // If we are trying to sign up, and our email & password formats are valid, send sign up request
    if (emailValid && passwordValid && passwordsMatch) {
      const signUpResult = await signUpWithEmail(email!, password);

      handleAuthenticateErrors(signUpResult);
    }
  }
  return (
    <div className="items-center flex flex-col justify-center ">
      <h3 className="text-xl text-neutral-600 font-semibold">
        Sign up with Email
      </h3>
      <p
        onClick={() => setHasAccount(!hasAccount)}
        className="italic text-sm cursor-pointer hover:text-blue-500 text-neutral-400 pb-2"
      >
        Login instead
      </p>
      <div className="flex flex-col gap-3 justify-center items-center">
        <input
          onInput={(e) => setEmail(e.currentTarget.value)}
          placeholder="Email"
          className="p-0.5 rounded-md bg-white drop-shadow-[0_1.1px_1.1px_rgba(0,0,0,0.4)] text-black outline-none"
          spellCheck={false}
          value={email}
        ></input>
        <input
          onInput={(e) => {
            const validity = isPasswordValidFormat(
              e.currentTarget.value,
              confirmPassword
            );
            setPasswordIssues(validity.issues);
            setPassword(e.currentTarget.value);
          }}
          placeholder="Password"
          className="p-0.5 rounded-md bg-white drop-shadow-[0_1.1px_1.1px_rgba(0,0,0,0.4)] text-black outline-none"
          spellCheck={false}
          value={password}
        ></input>
        <input
          onInput={(e) => {
            const validity = isPasswordValidFormat(
              password,
              e.currentTarget.value
            );
            setPasswordIssues(validity.issues);
            setConfirmPassword(e.currentTarget.value);
          }}
          placeholder="Password"
          className="p-0.5 rounded-md bg-white drop-shadow-[0_1.1px_1.1px_rgba(0,0,0,0.4)] text-black outline-none"
          spellCheck={false}
          value={confirmPassword}
        ></input>
        <button
          className="bg-blue-500 p-0.5 hover:bg-blue-600 text-white font-semibold rounded-lg w-1/2"
          onClick={() => handleSignup()}
        >
          Sign up
        </button>
      </div>
    </div>
  );
}

export default function SignInWithEmail() {
  const router = useRouter();

  // Whether or not the user has an account, this changes the display of the forum
  const [hasAccount, setHasAccount] = useState<boolean>(false);

  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Email we are trying to create an account / sign up with
  const [email, setEmail] = useState<string | undefined>("");

  // If the forgot your password window is open
  const [resetPassOpen, setResetPassOpen] = useState<boolean>();

  // If we experience an error trying to sign up with email, or log in with email we display this message
  const [authenticateErrorMessage, setAuthenticateErrorMessage] =
    useState<string>("");

  // List of the issues with the current password (if there are any)
  const [passwordIssues, setPasswordIssues] = useState<string[]>([]);

  // Makes sure the user does not input any spaces
  function validateNoSpaces(event: FormEvent<HTMLInputElement>) {
    const inputEvent = event.nativeEvent as InputEvent;
    if (inputEvent.data == " ") {
      return false;
    }
    return true;
  }

  // If there is an error authenticating (user login fail/ user sign up fail), set the state appropriately
  function handleAuthenticateErrors(loginResult: string | true | undefined) {
    if (loginResult === true) {
      console.log("Success logging in");
    } else if (loginResult === undefined) {
      console.log("Something went wrong");
    }
    // If we returned a defined value (it will be an AuthErrorCode)
    else {
      console.log(
        `Error creating account/logging in, firebase error code: ${loginResult}`
      );

      // Find user facing error message assosciated with error code
      const userFacingErrorMsg = FirebaseUserFacingErrorMessages[loginResult];

      setAuthenticateErrorMessage(
        userFacingErrorMsg
          ? userFacingErrorMsg
          : "Something went wrong, please try again later."
      );
    }
  }

  // TODO: Implement this method (should login user and use the code in GoogleAuthFlow.ts ; the loginWithEmail() method )
  async function handleLogin(password: string) {
    // Reset the error message
    setAuthenticateErrorMessage("");

    // Test if our email is of valid format
    const emailValid = isEmailValidFormat(email);

    // Test if our password is of valid format
    const passwordValid = isPasswordValidFormat(
      password,
      confirmPasswordRef.current!.value
    );

    // If we are trying to sign up, and our email & password formats are valid, send sign up request
    if (!hasAccount && emailValid && passwordValid) {
      const signUpResult = await signUpWithEmail(
        email!,
        passwordRef.current!.value
      );
      console.log(`signupresult ${signUpResult}`);
      handleAuthenticateErrors(signUpResult);
    }

    // If we are trying to login, and our email & password formats are valid, send login request
    if (hasAccount && emailValid && passwordValid) {
      const loginResult = await loginWithEmail(
        email!,
        passwordRef.current!.value
      );

      handleAuthenticateErrors(loginResult);
    }
  }

  return (
    <div className="drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.4)] flex flex-col justify-center items-center bg-gray-100 rounded-2xl p-3">
      <div className="flex flex-col pb-3 items-center">
        {!hasAccount && !resetPassOpen ? (
          <RegisterLayout
            hasAccount={hasAccount}
            setHasAccount={setHasAccount}
            handleAuthenticateErrors={handleAuthenticateErrors}
            setPasswordIssues={setPasswordIssues}
          />
        ) : (
          <></>
        )}

        {resetPassOpen ? (
          <ResetPasswordLayout
            isOpen={resetPassOpen}
            setResetPassOpen={setResetPassOpen}
            key={0}
          />
        ) : (
          <></>
        )}

        {hasAccount && !resetPassOpen ? (
          <LoginLayout
            hasAccount={hasAccount}
            setHasAccount={setHasAccount}
            handleLogin={handleLogin}
            setResetPassOpen={setResetPassOpen}
          />
        ) : (
          <></>
        )}

        <div className="flex flex-col gap-1 w-[85%]">
          {passwordIssues.map((issue: string, idx: number) => (
            <p key={idx} className="list-item text-red-500 text-sm">
              {issue}
            </p>
          ))}
        </div>

        {authenticateErrorMessage ? (
          <p className="text-red-700 text-sm font-semibold pt-2">
            {authenticateErrorMessage}
          </p>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import { signUpWithEmail } from "../auth/GoogleAuthFlow";
import { useRouter } from "next/navigation";

export default function SignInWithEmail() {
  const router = useRouter();

  // Whether or not the user has an account, this changes the display of the forum
  const [hasAccount, setHasAccount] = useState<boolean>(false);

  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState<string | undefined>("");

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

  // Tests if the email is a valid format with regex
  function isEmailValidFormat() {
    if (!email) {
      return undefined;
    }
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return true;
    }
    return false;
  }

  // Tests if the email is a valid format with multiple conditions
  function isPasswordValidFormat(): false | true | undefined {
    const issues = [];

    const passToTest = passwordRef.current!.value;
    // If hasAccount is true (we are trying to log in, instead of sign up)
    // Set confirmPass equal to our password input as we do not need to confirm if the passwords match when we are trying to log in
    // TODO: (this is hacky, revise this sometime)
    const confirmPassToTest = hasAccount
      ? passToTest
      : confirmPasswordRef.current!.value;

    if (!passToTest) {
      setPasswordIssues([]);
      return undefined;
    }

    // Password is less than 8 characters
    if (passToTest.length < 8) {
      issues.push(
        `Password must be at least 8 characters, current length ${passToTest.length}`
      );
    }

    // Password is longer than 128 characters
    if (passToTest.length > 128) {
      issues.push(
        `Password must be at most 128 characters, current length ${passToTest.length}`
      );
    }

    // Password does not have any capital letters
    if (!/[A-Z]/.test(passToTest)) {
      issues.push(`Password must contain at least 1 capital letter`);
    }

    // Password does not have any lowercase letters
    if (!/[a-z]/.test(passToTest)) {
      issues.push(`Password must contain at least 1 lowercase letter`);
    }

    // Password does not have any numbers
    if (!/[0-9]/.test(passToTest)) {
      issues.push(`Password must contain at least 1 number`);
    }

    // If the password and confirm password fields do not match
    if (passToTest !== confirmPassToTest) {
      issues.push(`Passwords must match`);
    }

    setPasswordIssues(issues);

    // If we have any issues return false
    if (issues.length > 0) {
      return false;
    }
    return true;
  }

  // TODO: Implement this method (should login user and use the code in GoogleAuthFlow.ts ; the loginWithEmail() method )
  async function handleLogin() {
    // Test if our email is of valid format
    const emailValid = isEmailValidFormat();

    // Test if our password is of valid format
    const passwordValid = isPasswordValidFormat();

    // If email and our password our valid, send login request
    if (emailValid && passwordValid) {
      const loginResult = await signUpWithEmail(
        email!,
        passwordRef.current!.value
      );

      // If result was successful, redirect user to dashboard
      if (loginResult === true) {
        console.log("Success");
        router.push('/dashboard')
      }
      // If an error occured
      else if (loginResult === undefined) {
        console.log("Something went wrong");
      }
      // If we returned a defined value such as a string (an AuthErrorCode)
      else {
        console.log(loginResult);
      }
    }
  }

  return (
    <div className="drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.4)] flex flex-col justify-center items-center bg-gray-100 rounded-2xl p-3">
      <div className="flex flex-col pb-3 items-center">
        <h3 className="text-xl text-neutral-600 font-semibold">
          {hasAccount ? "Login" : "Sign up with Email"}
        </h3>
        <p
          onClick={() => setHasAccount(!hasAccount)}
          className="italic text-sm cursor-pointer hover:text-blue-500 text-neutral-400"
        >
          {hasAccount ? "Sign up instead" : "Already have an account?"}
        </p>
      </div>

      <div className="flex flex-col gap-3 justify-center items-center">
        <input
          placeholder="Email"
          onInput={(e) => {
            if (validateNoSpaces(e)) {
              setEmail(e.currentTarget.value);
            }
          }}
          className="p-0.5 rounded-md bg-white drop-shadow-[0_1.1px_1.1px_rgba(0,0,0,0.4)] text-black outline-none"
          spellCheck={false}
          value={email}
        ></input>{" "}
        <input
          onInput={(e) => {
            // Test if our password is of valid format
            isPasswordValidFormat();
          }}
          ref={passwordRef}
          placeholder="Password"
          className="p-0.5 rounded-md bg-white drop-shadow-[0_1.1px_1.1px_rgba(0,0,0,0.4)] text-black outline-none"
          spellCheck={false}
        ></input>
        {hasAccount ? (
          <></>
        ) : (
          <input
            ref={confirmPasswordRef}
            onInput={(e) => {
              // Test if our password is of valid format
              isPasswordValidFormat();
            }}
            placeholder="Confirm Password"
            className="p-0.5 rounded-md bg-white drop-shadow-[0_1.1px_1.1px_rgba(0,0,0,0.4)] text-black outline-none"
            spellCheck={false}
          ></input>
        )}
        <button
          className="bg-blue-500 p-0.5 text-white font-semibold rounded-lg w-1/2"
          onClick={handleLogin}
        >
          {hasAccount ? "Login" : "Sign up"}
        </button>
        {hasAccount ? (
          <></>
        ) : (
          <div className="flex flex-col gap-1 w-[85%]">
            {passwordIssues.map((issue: string, idx: number) => (
              <p key={idx} className="list-item text-red-500 text-sm">
                {issue}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { useEffect } from "react";

export default function Page(params: Params) {
  useEffect(() => {
    // Code returned from spotify api
    const code = params.searchParams.code;
    const state = params.searchParams.state;

    // If our params contain code and state
    if (code && state && state == localStorage.getItem("state")) {
      console.log("Code valid, state valid");
      console.log("Callback code", code, "State", state);
      localStorage.setItem("code", code);
    }

    // document.location = "http://localhost:3000";
  });
}

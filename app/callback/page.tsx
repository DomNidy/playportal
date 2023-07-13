"use client";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { useEffect } from "react";

export default function Page(params: Params) {
  useEffect(() => {
    // Code returned from spotify api
    const code = params.searchParams.code;

    localStorage.setItem("code", code);
    console.log("Callback code", code);
    document.location = "http://localhost:3000";
  });
}

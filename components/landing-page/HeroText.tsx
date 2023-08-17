"use client";
import { useEffect, useState } from "react";

const heroTextArray = [
  "Manage your playlists with ease.",
  "Take control of your music.",
  "Playportal",
];

export default function HeroText() {
  const [textIndex, setTextIndex] = useState<number>(0);
  const [text, setText] = useState<string>(heroTextArray[0]);
  const [opacity, setOpacity] = useState<string>("opacity-30");
  // The time in miliseconds it takes the hero text to cycle
  const cycleHeroTextDurationMS = 7500;

  useEffect(() => {
    // Update the text
    setText(heroTextArray[textIndex]);

    // The index of the hero text array we will switch to next
    let nextIndex: number;
    // If the text index exceeds the length of the array reset it
    if (textIndex >= heroTextArray.length - 1) {
      nextIndex = 0;
    } else {
      nextIndex = textIndex + 1;
    }

    // Make visible
    setOpacity("opacity-100");

    // Ramp opacity decrease near end of text duration
    setTimeout(() => {
      setOpacity("opacity-0");
    }, cycleHeroTextDurationMS * 0.89);

    // Change text after hero text duration is finished
    setTimeout(() => {
      // Update the text index
      setTextIndex(nextIndex);
    }, cycleHeroTextDurationMS);
  }, [text, textIndex]);

  return (
    <h1
      className={`drop-shadow-[0_3.2px_1.2px_rgba(0,0,0,0.4)] pointer-events-none select-none text-white dark:text-gray-300 font-bold text-center text-4xl ${opacity} transition-opacity duration-700 ease-linear`}
    >
      {text}
    </h1>
  );
}

"use client";

import { Moon, SunDim } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { cn } from "@/lib/utils";

type props = {
  className?: string;
};

export const AnimatedThemeToggler = ({ className }: props) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("appearance");
      if (stored === "dark" || stored === "light") {
        const dark = stored === "dark";
        setIsDarkMode(dark);
        // Ensure DOM reflects stored preference in case layout script didn't run yet
        document.documentElement.classList.toggle("dark", dark);
      } else {
        // derive from current DOM class (set by early inline script)
        const dark = document.documentElement.classList.contains("dark");
        setIsDarkMode(dark);
      }
    } catch {
      // ignore storage access errors
    }
  }, []);
  const changeTheme = async () => {
    if (!buttonRef.current) return;

  await document.startViewTransition(() => {
      flushSync(() => {
        const dark = document.documentElement.classList.toggle("dark");
        setIsDarkMode(dark);
      });
    }).ready;

    const { top, left, width, height } =
      buttonRef.current.getBoundingClientRect();
    const y = top + height / 2;
    const x = left + width / 2;

    const right = window.innerWidth - left;
    const bottom = window.innerHeight - top;
    const maxRad = Math.hypot(Math.max(left, right), Math.max(top, bottom));

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRad}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 700,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      },
    );

    // Persist preference
    try {
      const dark = document.documentElement.classList.contains("dark");
      localStorage.setItem("appearance", dark ? "dark" : "light");
    } catch {
      // ignore storage access errors
    }
  };
  return (
    <button ref={buttonRef} onClick={changeTheme} className={cn(className)}>
      {isDarkMode ? <SunDim /> : <Moon />}
    </button>
  );
};

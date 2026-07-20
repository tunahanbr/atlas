"use client";

import { useLayoutEffect, useRef } from "react";
import { useTheme } from "next-themes";

type ProfileThemeValue = "system" | "light" | "dark";

/**
 * Applies the profile owner's theme as a non-persistent default. An explicit
 * visitor preference from the global theme toggle always wins and remains
 * shared across Atlas pages.
 */
export function ProfileTheme({ defaultTheme }: { defaultTheme: ProfileThemeValue }) {
  const { setTheme } = useTheme();
  const applied = useRef(false);

  useLayoutEffect(() => {
    if (applied.current || window.localStorage.getItem("theme") !== null) return;
    applied.current = true;

    setTheme(defaultTheme);
    // next-themes persists setTheme calls. Removing this value makes the
    // profile setting a default rather than an artificial visitor preference.
    window.localStorage.removeItem("theme");

    return () => {
      // Do not leak a profile's default into the dashboard or landing page on
      // client-side navigation. A visitor choice made via the toggle is kept.
      if (window.localStorage.getItem("theme") === null) {
        setTheme("system");
        window.localStorage.removeItem("theme");
      }
    };
  }, [defaultTheme, setTheme]);

  return null;
}

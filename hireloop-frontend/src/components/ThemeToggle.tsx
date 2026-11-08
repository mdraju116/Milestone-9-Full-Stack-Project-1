
"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

type ThemeToggleProps = {
  onAction?: () => void;
};

// Theme control that waits for client hydration before reading the active theme.
export default function ThemeToggle({ onAction }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) return null;

  return (
    <button
      onClick={() => {
        setTheme(theme === "dark" ? "light" : "dark");
        onAction?.();
      }}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </button>
  );
}

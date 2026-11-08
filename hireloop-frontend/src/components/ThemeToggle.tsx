
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
      type="button"
      className="rounded-full p-2 text-white transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/50"
      onClick={() => {
        setTheme(theme === "dark" ? "light" : "dark");
        onAction?.();
      }}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="text-amber-300" />
      ) : (
        <Moon className="text-white" />
      )}
    </button>
  );
}

import * as React from "react";

type Theme = "light" | "dark";

const DARK_QUERY = "(prefers-color-scheme: dark)";

/**
 * Theme starts from the system colour scheme. The manual light/dark switch
 * only applies for the current session — refreshing re-syncs with the system.
 */
function getSystemTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

export function useTheme() {
  const [theme, setTheme] = React.useState<Theme>(getSystemTheme);

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
  }, [theme]);

  const toggleTheme = React.useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  return { theme, isDark: theme === "dark", toggleTheme };
}

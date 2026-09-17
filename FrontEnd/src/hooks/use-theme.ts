import * as React from "react"

type Theme = "light" | "dark"

const STORAGE_KEY = "theme"

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "light"
  }

  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === "light" || stored === "dark") {
    return stored
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

export function useTheme() {
  const [theme, setTheme] = React.useState<Theme>(getInitialTheme)

  React.useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", theme === "dark")
    root.style.colorScheme = theme
    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = React.useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"))
  }, [])

  return { theme, isDark: theme === "dark", toggleTheme }
}

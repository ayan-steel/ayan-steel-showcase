import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "light" | "dark" | "bold";
const ORDER: Theme[] = ["light", "dark", "bold"];
const KEY = "ayan-theme";

const ThemeCtx = createContext<{ theme: Theme; setTheme: (t: Theme) => void; cycle: () => void }>({
  theme: "light",
  setTheme: () => {},
  cycle: () => {},
});

function apply(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("dark", "bold");
  if (theme === "dark") root.classList.add("dark");
  if (theme === "bold") root.classList.add("dark", "bold");
  root.dataset["theme"] = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem(KEY) as Theme | null;
    if (stored && ORDER.includes(stored)) {
      setThemeState(stored);
      apply(stored);
    } else {
      apply("light");
    }
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    apply(t);
    try { localStorage.setItem(KEY, t); } catch { /* ignore */ }
  }, []);

  const cycle = useCallback(() => {
    setThemeState((prev) => {
      const next = ORDER[(ORDER.indexOf(prev) + 1) % ORDER.length]!;
      apply(next);
      try { localStorage.setItem(KEY, next); } catch { /* ignore */ }
      return next;
    });
  }, []);

  return <ThemeCtx.Provider value={{ theme, setTheme, cycle }}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);

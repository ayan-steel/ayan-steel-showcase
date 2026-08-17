import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

export type Theme = "light" | "dark" | "bold";
const ORDER: Theme[] = ["light", "dark", "bold"];
const KEY = "ayan-theme";

const ThemeCtx = createContext<{ theme: Theme; setTheme: (t: Theme) => void; cycle: () => void }>({
  theme: "light",
  setTheme: () => {},
  cycle: () => {},
});

function readDom(): Theme {
  if (typeof document === "undefined") return "light";
  const cl = document.documentElement.classList;
  if (cl.contains("bold")) return "bold";
  if (cl.contains("dark")) return "dark";
  return "light";
}

function apply(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", theme !== "light");
  root.classList.toggle("bold", theme === "bold");
  root.dataset["theme"] = theme;
  try { localStorage.setItem(KEY, theme); } catch { /* ignore */ }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const touched = useRef(false);

  useEffect(() => {
    if (touched.current) return;
    const stored = localStorage.getItem(KEY) as Theme | null;
    const initial = stored && ORDER.includes(stored) ? stored : readDom();
    setThemeState(initial);
    apply(initial);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    touched.current = true;
    setThemeState(t);
    apply(t);
  }, []);

  const cycle = useCallback(() => {
    touched.current = true;
    setThemeState((prev) => {
      const next = ORDER[(ORDER.indexOf(prev) + 1) % ORDER.length]!;
      apply(next);
      return next;
    });
  }, []);

  return <ThemeCtx.Provider value={{ theme, setTheme, cycle }}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);

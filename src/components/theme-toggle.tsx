import { Sun, Moon, Sparkles } from "lucide-react";
import { useTheme } from "@/lib/theme";

const LABEL = {
  light: "Light mode",
  dark: "Dark mode",
  bold: "Bold dark mode",
} as const;

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, cycle } = useTheme();
  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Sparkles;

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Theme: ${LABEL[theme]}. Click to switch`}
      title={LABEL[theme]}
      className={`relative grid h-10 w-10 place-items-center rounded-full text-foreground transition-all hover:bg-foreground/5 hover:scale-105 ${className}`}
    >
      <Icon
        key={theme}
        className={`h-5 w-5 animate-fade-in ${theme === "bold" ? "text-accent" : ""}`}
      />
    </button>
  );
}

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import { darkColors, lightColors, resolveScheme, type AppColors } from "../theme";
import { useAppState } from "./AppState";

type ThemeContextValue = {
  colors: AppColors;
  isDark: boolean;
  scheme: "dark" | "light";
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { settings } = useAppState();
  const system = useColorScheme();
  const scheme = resolveScheme(settings.theme, system !== "light");
  const isDark = scheme === "dark";
  const colors = isDark ? darkColors : lightColors;
  const value = useMemo(() => ({ colors, isDark, scheme }), [colors, isDark, scheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

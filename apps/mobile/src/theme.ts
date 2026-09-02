export type AppColors = {
  bg: string;
  panel: string;
  line: string;
  text: string;
  muted: string;
  accent: string;
  accentSoft: string;
  danger: string;
  success: string;
  offlineBg: string;
  offlineText: string;
};

export const darkColors: AppColors = {
  bg: "#0d0f14",
  panel: "#161922",
  line: "#2a3040",
  text: "#eef1f7",
  muted: "#9aa3b5",
  accent: "#8b5cf6",
  accentSoft: "#a78bfa",
  danger: "#f87171",
  success: "#34d399",
  offlineBg: "#3f2a14",
  offlineText: "#fbbf24",
};

export const lightColors: AppColors = {
  bg: "#f4f5f8",
  panel: "#ffffff",
  line: "#e2e5ee",
  text: "#161922",
  muted: "#5b6475",
  accent: "#7c3aed",
  accentSoft: "#6d28d9",
  danger: "#b91c1c",
  success: "#059669",
  offlineBg: "#fff7ed",
  offlineText: "#c2410c",
};

/** @deprecated use useTheme().colors */
export const colors = darkColors;

export function resolveScheme(
  theme: "dark" | "light" | "auto",
  systemDark: boolean
): "dark" | "light" {
  if (theme === "auto") return systemDark ? "dark" : "light";
  return theme;
}

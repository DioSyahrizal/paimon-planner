import { useUserStore } from "@/store/user-store";
import { useColorScheme } from "react-native";

export type AppColorScheme = "light" | "dark" | "system";
export type ResolvedAppTheme = "light" | "dark";

export interface AppTheme {
  mode: ResolvedAppTheme;
  background: string;
  surface: string;
  surfaceMuted: string;
  raised: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  accent: string;
  accentSoft: string;
  accentText: string;
  danger: string;
  success: string;
  successSoft: string;
  info: string;
  infoSoft: string;
  input: string;
  shadow: string;
}

const darkTheme: AppTheme = {
  mode: "dark",
  background: "#0f0f0f",
  surface: "#1a1a1a",
  surfaceMuted: "#141414",
  raised: "#111111",
  border: "#2a2a2a",
  borderStrong: "#333333",
  text: "#ffffff",
  textMuted: "#aaaaaa",
  textSubtle: "#888888",
  accent: "#c9a227",
  accentSoft: "#2d2410",
  accentText: "#000000",
  danger: "#ff6b6b",
  success: "#9de06b",
  successSoft: "#182216",
  info: "#8ec8ff",
  infoSoft: "#202a34",
  input: "#111111",
  shadow: "#000000",
};

const lightTheme: AppTheme = {
  mode: "light",
  background: "#f7f3ea",
  surface: "#fffaf0",
  surfaceMuted: "#f1eadc",
  raised: "#ffffff",
  border: "#ded4bf",
  borderStrong: "#cfc1a6",
  text: "#211b12",
  textMuted: "#5f5548",
  textSubtle: "#7d715f",
  accent: "#9a7417",
  accentSoft: "#efe2bd",
  accentText: "#1b1405",
  danger: "#bd3c3c",
  success: "#3f7e36",
  successSoft: "#dfedd6",
  info: "#2e6f9e",
  infoSoft: "#dbeaf3",
  input: "#fffdf7",
  shadow: "#6d5b35",
};

export function resolveAppTheme(
  scheme: AppColorScheme,
  systemScheme: "light" | "dark" | null | undefined,
): ResolvedAppTheme {
  if (scheme === "system") {
    return systemScheme === "light" ? "light" : "dark";
  }

  return scheme;
}

export function getAppTheme(mode: ResolvedAppTheme): AppTheme {
  return mode === "light" ? lightTheme : darkTheme;
}

export function useAppTheme(): AppTheme {
  const preferredScheme = useUserStore((state) => state.colorScheme);
  const systemScheme = useColorScheme();
  return getAppTheme(resolveAppTheme(preferredScheme, systemScheme));
}

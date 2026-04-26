import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import type { AppColorScheme } from "@/theme/app-theme";

type ServerRegion = "Asia" | "America" | "Europe" | "TW/HK/MO";

interface UserState {
  uid: string;
  region: ServerRegion;
  colorScheme: AppColorScheme;
  setUid: (uid: string) => void;
  setRegion: (region: ServerRegion) => void;
  setColorScheme: (scheme: AppColorScheme) => void;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
}

function isRegion(value: string | null): value is ServerRegion {
  return (
    value === "Asia" ||
    value === "America" ||
    value === "Europe" ||
    value === "TW/HK/MO"
  );
}

function isColorScheme(value: string | null): value is AppColorScheme {
  return value === "light" || value === "dark" || value === "system";
}

export const useUserStore = create<UserState>((set) => ({
  uid: "",
  region: "Asia",
  colorScheme: "system",
  setUid: async (uid) => {
    await AsyncStorage.setItem("uid", uid);
    set({ uid });
  },
  setRegion: async (region) => {
    await AsyncStorage.setItem("region", region);
    set({ region });
  },
  setColorScheme: async (colorScheme) => {
    await AsyncStorage.setItem("color-scheme", colorScheme);
    set({ colorScheme });
  },
  isHydrated: false,
  hydrate: async () => {
    const [uid, region, colorScheme] = await Promise.all([
      AsyncStorage.getItem("uid"),
      AsyncStorage.getItem("region"),
      AsyncStorage.getItem("color-scheme"),
    ]);

    set({
      uid: uid ?? "",
      region: isRegion(region) ? region : "Asia",
      colorScheme: isColorScheme(colorScheme) ? colorScheme : "system",
      isHydrated: true,
    });
  },
}));

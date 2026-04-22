import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

type ServerRegion = "Asia" | "America" | "Europe" | "TW/HK/MO";
type ColorScheme = "light" | "dark" | "system";

interface UserState {
  uid: string;
  region: ServerRegion;
  colorScheme: ColorScheme;
  setUid: (uid: string) => void;
  setRegion: (region: ServerRegion) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  uid: "",
  region: "Asia",
  colorScheme: "system",
  setUid: async (uid) => {
    await AsyncStorage.setItem("uid", uid);
    set({ uid });
  },
  setRegion: (region) => set({ region }),
  setColorScheme: (colorScheme) => set({ colorScheme }),
  isHydrated: false,
  hydrate: async () => {
    const uid = await AsyncStorage.getItem("uid");
    set({ uid: uid ?? "", isHydrated: true });
  },
}));

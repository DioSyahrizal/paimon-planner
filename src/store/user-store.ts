import { create } from 'zustand'

type ServerRegion = 'Asia' | 'America' | 'Europe' | 'TW/HK/MO'
type ColorScheme = 'light' | 'dark' | 'system'

interface UserState {
  uid: string
  region: ServerRegion
  colorScheme: ColorScheme
  setUid: (uid: string) => void
  setRegion: (region: ServerRegion) => void
  setColorScheme: (scheme: ColorScheme) => void
}

export const useUserStore = create<UserState>((set) => ({
  uid: '',
  region: 'Asia',
  colorScheme: 'system',
  setUid: (uid) => set({ uid }),
  setRegion: (region) => set({ region }),
  setColorScheme: (colorScheme) => set({ colorScheme }),
}))

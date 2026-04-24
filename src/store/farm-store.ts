import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const FARM_CHECKLIST_STORAGE_KEY = "farm-checklist";

interface FarmChecklistState {
  dateKey: string;
  completedIds: string[];
}

interface FarmStore {
  checklist: FarmChecklistState;
  isHydrated: boolean;
  hydrate: (dateKey: string) => Promise<void>;
  toggleCompleted: (taskId: string) => Promise<void>;
  resetForDate: (dateKey: string) => Promise<void>;
}

const emptyChecklist = (dateKey: string): FarmChecklistState => ({
  dateKey,
  completedIds: [],
});

async function persistChecklist(checklist: FarmChecklistState) {
  await AsyncStorage.setItem(
    FARM_CHECKLIST_STORAGE_KEY,
    JSON.stringify(checklist),
  );
}

export const useFarmStore = create<FarmStore>((set, get) => ({
  checklist: emptyChecklist(""),
  isHydrated: false,
  hydrate: async (dateKey) => {
    const raw = await AsyncStorage.getItem(FARM_CHECKLIST_STORAGE_KEY);

    if (!raw) {
      const checklist = emptyChecklist(dateKey);
      await persistChecklist(checklist);
      set({ checklist, isHydrated: true });
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<FarmChecklistState>;

      if (parsed.dateKey === dateKey && Array.isArray(parsed.completedIds)) {
        set({
          checklist: {
            dateKey,
            completedIds: parsed.completedIds,
          },
          isHydrated: true,
        });
        return;
      }
    } catch {
      // Fall through to reset invalid storage.
    }

    const checklist = emptyChecklist(dateKey);
    await persistChecklist(checklist);
    set({ checklist, isHydrated: true });
  },
  toggleCompleted: async (taskId) => {
    const { checklist } = get();
    const completedIds = checklist.completedIds.includes(taskId)
      ? checklist.completedIds.filter((id) => id !== taskId)
      : [...checklist.completedIds, taskId];

    const nextChecklist = { ...checklist, completedIds };
    await persistChecklist(nextChecklist);
    set({ checklist: nextChecklist });
  },
  resetForDate: async (dateKey) => {
    const checklist = emptyChecklist(dateKey);
    await persistChecklist(checklist);
    set({ checklist, isHydrated: true });
  },
}));

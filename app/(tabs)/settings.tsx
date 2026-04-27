import { cn } from "@/lib/cn";
import { useUserStore } from "@/store/user-store";
import type { AppColorScheme } from "@/theme/app-theme";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ServerRegion = "Asia" | "America" | "Europe" | "TW/HK/MO";

const REGIONS: ServerRegion[] = ["Asia", "America", "Europe", "TW/HK/MO"];
const COLOR_SCHEMES: { label: string; value: AppColorScheme }[] = [
  { label: "System", value: "system" },
  { label: "Dark", value: "dark" },
  { label: "Light", value: "light" },
];

export default function SettingsScreen() {
  const { uid, region, colorScheme, setUid, setRegion, setColorScheme } =
    useUserStore();
  const [uidInput, setUidInput] = useState("");
  const { top, bottom } = useSafeAreaInsets();

  useEffect(() => {
    if (uid) {
      setUidInput(uid);
    }
  }, [uid]);

  function handleSaveUid() {
    const trimmed = uidInput.trim();
    if (trimmed.length !== 9 || !/^\d{9}$/.test(trimmed)) {
      Alert.alert("Invalid UID", "UID must be exactly 9 digits.");
      return;
    }
    setUid(trimmed);
    Alert.alert("Saved", "UID updated successfully.");
  }

  return (
    <ScrollView
      className="flex-1 bg-paimon-bg dark:bg-paimon-dark-bg"
      contentContainerClassName="px-5"
      contentContainerStyle={{
        paddingTop: top + 12,
        paddingBottom: bottom + 16,
      }}
    >
      <Text className="mb-6 text-3xl font-bold text-paimon-text dark:text-paimon-dark-text">
        Settings
      </Text>

      <View className="mb-4 gap-2.5 rounded-xl border border-paimon-border bg-paimon-surface p-4 dark:border-paimon-dark-border dark:bg-paimon-dark-surface">
        <Text className="text-xs font-semibold uppercase tracking-wide text-paimon-accent dark:text-paimon-dark-accent">
          Enka.Network
        </Text>
        <Text className="text-sm text-paimon-soft dark:text-paimon-dark-soft">
          Player UID
        </Text>
        <View className="flex-row items-center gap-2.5">
          <TextInput
            className="flex-1 rounded-lg border border-paimon-strong bg-paimon-raised px-3.5 py-2.5 text-base tracking-widest text-paimon-text dark:border-paimon-dark-strong dark:bg-paimon-dark-raised dark:text-paimon-dark-text"
            value={uidInput}
            onChangeText={setUidInput}
            placeholder="9-digit UID"
            placeholderTextColor="#7d715f"
            keyboardType="numeric"
            maxLength={9}
            returnKeyType="done"
            onSubmitEditing={handleSaveUid}
          />
          <TouchableOpacity
            className="rounded-lg bg-paimon-accent px-4 py-2.5 dark:bg-paimon-dark-accent"
            onPress={handleSaveUid}
          >
            <Text className="text-sm font-bold text-white dark:text-black">
              Save
            </Text>
          </TouchableOpacity>
        </View>
        <Text className="text-xs leading-5 text-paimon-subtle dark:text-paimon-dark-subtle">
          Find your UID in-game on the Paimon menu (bottom-right corner). Make
          sure your Character Showcase is set to public.
        </Text>
      </View>

      <View className="mb-4 gap-2.5 rounded-xl border border-paimon-border bg-paimon-surface p-4 dark:border-paimon-dark-border dark:bg-paimon-dark-surface">
        <Text className="text-xs font-semibold uppercase tracking-wide text-paimon-accent dark:text-paimon-dark-accent">
          Server Region
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {REGIONS.map((r) => (
            <TouchableOpacity
              key={r}
              className={cn(
                "rounded-full border border-paimon-strong px-3.5 py-1.5 dark:border-paimon-dark-strong",
                region === r &&
                  "border-paimon-accent bg-paimon-accent dark:border-paimon-dark-accent dark:bg-paimon-dark-accent",
              )}
              onPress={() => setRegion(r)}
            >
              <Text
                className={cn(
                  "text-xs text-paimon-subtle dark:text-paimon-dark-subtle",
                  region === r && "font-bold text-white dark:text-black",
                )}
              >
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="mb-4 gap-2.5 rounded-xl border border-paimon-border bg-paimon-surface p-4 dark:border-paimon-dark-border dark:bg-paimon-dark-surface">
        <Text className="text-xs font-semibold uppercase tracking-wide text-paimon-accent dark:text-paimon-dark-accent">
          Appearance
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {COLOR_SCHEMES.map((scheme) => (
            <TouchableOpacity
              key={scheme.value}
              className={cn(
                "rounded-full border border-paimon-strong px-3.5 py-1.5 dark:border-paimon-dark-strong",
                colorScheme === scheme.value &&
                  "border-paimon-accent bg-paimon-accent dark:border-paimon-dark-accent dark:bg-paimon-dark-accent",
              )}
              onPress={() => setColorScheme(scheme.value)}
            >
              <Text
                className={cn(
                  "text-xs text-paimon-subtle dark:text-paimon-dark-subtle",
                  colorScheme === scheme.value &&
                    "font-bold text-white dark:text-black",
                )}
              >
                {scheme.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="mb-4 gap-2.5 rounded-xl border border-paimon-border bg-paimon-surface p-4 dark:border-paimon-dark-border dark:bg-paimon-dark-surface">
        <Text className="text-xs font-semibold uppercase tracking-wide text-paimon-accent dark:text-paimon-dark-accent">
          About
        </Text>
        <Text className="text-xs leading-5 text-paimon-subtle dark:text-paimon-dark-subtle">
          Paimon Planner - v1.0.0
        </Text>
        <Text className="text-xs leading-5 text-paimon-subtle dark:text-paimon-dark-subtle">
          Character data provided by{" "}
          <Text className="text-paimon-accent dark:text-paimon-dark-accent">
            Enka.Network
          </Text>
        </Text>
        <Text className="text-xs leading-5 text-paimon-subtle dark:text-paimon-dark-subtle">
          Game data from{" "}
          <Text className="text-paimon-accent dark:text-paimon-dark-accent">
            genshin.dev
          </Text>
        </Text>
        <Text className="text-xs leading-5 text-paimon-subtle dark:text-paimon-dark-subtle">
          Build guides are curated by you based on community resources (KQM,
          Genshin Helper Team).
        </Text>
      </View>
    </ScrollView>
  );
}

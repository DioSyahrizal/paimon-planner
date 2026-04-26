import { useUserStore } from "@/store/user-store";
import { useAppTheme, type AppColorScheme, type AppTheme } from "@/theme/app-theme";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Text, XStack, YStack } from "tamagui";

type ServerRegion = "Asia" | "America" | "Europe" | "TW/HK/MO";

const REGIONS: ServerRegion[] = ["Asia", "America", "Europe", "TW/HK/MO"];
const COLOR_SCHEMES: { label: string; value: AppColorScheme }[] = [
  { label: "System", value: "system" },
  { label: "Dark", value: "dark" },
  { label: "Light", value: "light" },
];

export default function SettingsScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { uid, region, colorScheme, setUid, setRegion, setColorScheme } = useUserStore();
  const [uidInput, setUidInput] = useState("");

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.screenTitle}>Settings</Text>

      <YStack style={styles.section}>
        <Text style={styles.sectionTitle}>Enka.Network</Text>
        <Text style={styles.label}>Player UID</Text>
        <XStack style={styles.uidRow}>
          <TextInput
            style={styles.uidInput}
            value={uidInput}
            onChangeText={setUidInput}
            placeholder="9-digit UID"
            placeholderTextColor={theme.textSubtle}
            keyboardType="numeric"
            maxLength={9}
            returnKeyType="done"
            onSubmitEditing={handleSaveUid}
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveUid}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </XStack>
        <Text style={styles.hint}>
          Find your UID in-game on the Paimon menu (bottom-right corner). Make
          sure your Character Showcase is set to public.
        </Text>
      </YStack>

      <YStack style={styles.section}>
        <Text style={styles.sectionTitle}>Server Region</Text>
        <XStack style={styles.regionRow}>
          {REGIONS.map((r) => (
            <TouchableOpacity
              key={r}
              style={[
                styles.regionChip,
                region === r && styles.regionChipActive,
              ]}
              onPress={() => setRegion(r)}
            >
              <Text
                style={[
                  styles.regionText,
                  region === r && styles.regionTextActive,
                ]}
              >
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </XStack>
      </YStack>

      <YStack style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <XStack style={styles.regionRow}>
          {COLOR_SCHEMES.map((scheme) => (
            <TouchableOpacity
              key={scheme.value}
              style={[
                styles.regionChip,
                colorScheme === scheme.value && styles.regionChipActive,
              ]}
              onPress={() => setColorScheme(scheme.value)}
            >
              <Text
                style={[
                  styles.regionText,
                  colorScheme === scheme.value && styles.regionTextActive,
                ]}
              >
                {scheme.label}
              </Text>
            </TouchableOpacity>
          ))}
        </XStack>
      </YStack>

      <YStack style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>Paimon Planner — v1.0.0</Text>
        <Text style={styles.aboutText}>
          Character data provided by{" "}
          <Text style={styles.link}>Enka.Network</Text>
        </Text>
        <Text style={styles.aboutText}>
          Game data from <Text style={styles.link}>genshin.dev</Text>
        </Text>
        <Text style={styles.aboutText}>
          Build guides are curated by you based on community resources (KQM,
          Genshin Helper Team).
        </Text>
      </YStack>
    </ScrollView>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { padding: 20, paddingBottom: 40 },
  screenTitle: {
    color: theme.text,
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
  },
  section: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  sectionTitle: {
    color: theme.accent,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  label: { color: theme.textMuted, fontSize: 14 },
  uidRow: { gap: 10, alignItems: "center" },
  uidInput: {
    flex: 1,
    backgroundColor: theme.input,
    borderWidth: 1,
    borderColor: theme.borderStrong,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: theme.text,
    fontSize: 16,
    letterSpacing: 2,
  },
  saveButton: {
    backgroundColor: theme.accent,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonText: { color: theme.accentText, fontWeight: "700", fontSize: 14 },
  hint: { color: theme.textSubtle, fontSize: 12, lineHeight: 18 },
  regionRow: { flexWrap: "wrap", gap: 8 },
  regionChip: {
    borderWidth: 1,
    borderColor: theme.borderStrong,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  regionChipActive: { backgroundColor: theme.accent, borderColor: theme.accent },
  regionText: { color: theme.textSubtle, fontSize: 13 },
  regionTextActive: { color: theme.accentText, fontWeight: "700" },
  aboutText: { color: theme.textSubtle, fontSize: 13, lineHeight: 20 },
  link: { color: theme.accent },
});

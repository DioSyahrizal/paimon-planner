import { useUserStore } from "@/store/user-store";
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

export default function SettingsScreen() {
  const { uid, region, setUid, setRegion } = useUserStore();
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
            placeholderTextColor="#555"
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f0f" },
  content: { padding: 20, paddingBottom: 40 },
  screenTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
  },
  section: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 10,
  },
  sectionTitle: {
    color: "#c9a227",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  label: { color: "#ccc", fontSize: 14 },
  uidRow: { gap: 10, alignItems: "center" },
  uidInput: {
    flex: 1,
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#fff",
    fontSize: 16,
    letterSpacing: 2,
  },
  saveButton: {
    backgroundColor: "#c9a227",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonText: { color: "#000", fontWeight: "700", fontSize: 14 },
  hint: { color: "#666", fontSize: 12, lineHeight: 18 },
  regionRow: { flexWrap: "wrap", gap: 8 },
  regionChip: {
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  regionChipActive: { backgroundColor: "#c9a227", borderColor: "#c9a227" },
  regionText: { color: "#888", fontSize: 13 },
  regionTextActive: { color: "#000", fontWeight: "700" },
  aboutText: { color: "#666", fontSize: 13, lineHeight: 20 },
  link: { color: "#c9a227" },
});

import { useEnkaUser } from "@/hooks/useEnkaUser";
import { useUserStore } from "@/store/user-store";
import { useAppTheme, type AppTheme } from "@/theme/app-theme";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, View } from "tamagui";
import { CharacterHeader, TabToggle, WeaponCard } from "./components";
import MyBuildTab from "./components/tabs/MyBuildTab";
import RecommendedTab from "./components/tabs/RecommendedTab";
import CompareTab from "./components/tabs/components/CompareTab";

export type CharacterTab = "my-build" | "recommended" | "compare";

const VALID_TABS: CharacterTab[] = ["my-build", "recommended", "compare"];

function getInitialTab(tabParam?: string | string[]): CharacterTab {
  const tab = Array.isArray(tabParam) ? tabParam[0] : tabParam;

  if (tab && VALID_TABS.includes(tab as CharacterTab)) {
    return tab as CharacterTab;
  }

  return "my-build";
}

const CharacterPage = () => {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { bottom } = useSafeAreaInsets();
  const { id, tab } = useLocalSearchParams<{ id: string; tab?: string | string[] }>();
  const uid = useUserStore((s) => s.uid);
  const [activeTab, setActiveTab] = useState<CharacterTab>(() => getInitialTab(tab));

  const { data } = useEnkaUser(uid);
  const character = data?.characters.find((c) => c.id === id);

  if (!character) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Character not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: bottom + 24 }]}
    >
      <CharacterHeader character={character} />
      <WeaponCard weapon={character.weapon} />
      <TabToggle active={activeTab} onChange={setActiveTab} />

      {activeTab === "my-build" && <MyBuildTab character={character} />}
      {activeTab === "recommended" && <RecommendedTab characterId={character.id} />}
      {activeTab === "compare" && <CompareTab characterId={character.id} character={character} />}
    </ScrollView>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { padding: 16, gap: 12 },
  centerContainer: {
    flex: 1,
    backgroundColor: theme.background,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: { color: theme.textSubtle, fontSize: 15 },
});

export default CharacterPage;

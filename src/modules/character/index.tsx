import { useEnkaUser } from "@/hooks/useEnkaUser";
import { useUserStore } from "@/store/user-store";
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

const CharacterPage = () => {
  const { bottom } = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const uid = useUserStore((s) => s.uid);
  const [activeTab, setActiveTab] = useState<CharacterTab>("my-build");

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f0f" },
  content: { padding: 16, gap: 12 },
  centerContainer: {
    flex: 1,
    backgroundColor: "#0f0f0f",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: { color: "#888", fontSize: 15 },
});

export default CharacterPage;

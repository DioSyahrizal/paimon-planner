import { getEnkaErrorMessage } from "@/api/enka";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  SkeletonList,
} from "@/components/ScreenState";
import { useEnkaUser } from "@/hooks/useEnkaUser";
import { useUserStore } from "@/store/user-store";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const { bottom } = useSafeAreaInsets();
  const { id, tab } = useLocalSearchParams<{
    id: string;
    tab?: string | string[];
  }>();
  const uid = useUserStore((s) => s.uid);
  const isHydrated = useUserStore((s) => s.isHydrated);
  const [activeTab, setActiveTab] = useState<CharacterTab>(() =>
    getInitialTab(tab),
  );

  const { data, isLoading, isError, error, refetch } = useEnkaUser(uid);
  const character = data?.characters.find((c) => c.id === id);

  if (!isHydrated) {
    return <LoadingState message="Preparing character details..." />;
  }

  if (!uid) {
    return (
      <EmptyState
        title="No UID set"
        message="Go to Settings and enter your Genshin Impact UID before opening character details."
      />
    );
  }

  if (isLoading) {
    return <SkeletonList title="Loading character details..." count={4} />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Could not load character"
        message={getEnkaErrorMessage(error)}
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  if (!character) {
    return (
      <EmptyState
        title="Character not found"
        message="This character is not in the currently loaded public showcase."
      />
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-paimon-bg dark:bg-paimon-dark-bg"
      contentContainerClassName="gap-3 p-4"
      contentContainerStyle={{ paddingBottom: bottom + 24 }}
    >
      <CharacterHeader character={character} />
      <WeaponCard weapon={character.weapon} />
      <TabToggle active={activeTab} onChange={setActiveTab} />

      {activeTab === "my-build" && <MyBuildTab character={character} />}
      {activeTab === "recommended" && (
        <RecommendedTab characterId={character.id} />
      )}
      {activeTab === "compare" && (
        <CompareTab characterId={character.id} character={character} />
      )}
    </ScrollView>
  );
};

export default CharacterPage;

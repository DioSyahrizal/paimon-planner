import { getEnkaErrorMessage } from "@/api/enka";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  SkeletonList,
} from "@/components/ScreenState";
import { useEnkaUser } from "@/hooks/useEnkaUser";
import {
  getBuildsForCharacter,
  resolveSelectedBuild,
} from "@/lib/recommended-builds";
import { useUserStore } from "@/store/user-store";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BuildRolePicker,
  CharacterHeader,
  CharacterNavBar,
  TabToggle,
  WeaponCard,
} from "./components";
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
  const { top, bottom } = useSafeAreaInsets();
  const { id, tab, role } = useLocalSearchParams<{
    id: string;
    tab?: string | string[];
    role?: string | string[];
  }>();
  const uid = useUserStore((s) => s.uid);
  const isHydrated = useUserStore((s) => s.isHydrated);
  const [activeTab, setActiveTab] = useState<CharacterTab>(() =>
    getInitialTab(tab),
  );
  const [selectedRole, setSelectedRole] = useState<string | undefined>(() =>
    Array.isArray(role) ? role[0] : role,
  );

  const { data, isLoading, isError, error, refetch } = useEnkaUser(uid);
  const character = data?.characters.find((c) => c.id === id);
  const builds = useMemo(() => getBuildsForCharacter(id), [id]);
  const selectedBuild = useMemo(
    () => resolveSelectedBuild(id, selectedRole),
    [id, selectedRole],
  );
  const navTitle = character?.name ?? "Character";
  const navSubtitle =
    character && selectedBuild
      ? `${selectedBuild.role} build`
      : character
        ? `${character.element} character`
        : "Build details";

  useEffect(() => {
    setActiveTab(getInitialTab(tab));
  }, [tab, id]);

  useEffect(() => {
    const nextRole = Array.isArray(role) ? role[0] : role;
    setSelectedRole(nextRole);
  }, [role, id]);

  useEffect(() => {
    if (!builds.length) {
      if (selectedRole !== undefined) {
        setSelectedRole(undefined);
      }
      return;
    }

    if (!selectedBuild || selectedBuild.role !== selectedRole) {
      setSelectedRole(selectedBuild?.role);
    }
  }, [builds, selectedBuild, selectedRole]);

  if (!isHydrated) {
    return (
      <View className="flex-1 bg-paimon-bg dark:bg-paimon-dark-bg">
        <CharacterNavBar title={navTitle} subtitle={navSubtitle} topInset={top} />
        <LoadingState message="Preparing character details..." />
      </View>
    );
  }

  if (!uid) {
    return (
      <View className="flex-1 bg-paimon-bg dark:bg-paimon-dark-bg">
        <CharacterNavBar title={navTitle} subtitle={navSubtitle} topInset={top} />
        <EmptyState
          title="No UID set"
          message="Go to Settings and enter your Genshin Impact UID before opening character details."
        />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-paimon-bg dark:bg-paimon-dark-bg">
        <CharacterNavBar title={navTitle} subtitle={navSubtitle} topInset={top} />
        <SkeletonList title="Loading character details..." count={4} />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-paimon-bg dark:bg-paimon-dark-bg">
        <CharacterNavBar title={navTitle} subtitle={navSubtitle} topInset={top} />
        <ErrorState
          title="Could not load character"
          message={getEnkaErrorMessage(error)}
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </View>
    );
  }

  if (!character) {
    return (
      <View className="flex-1 bg-paimon-bg dark:bg-paimon-dark-bg">
        <CharacterNavBar title={navTitle} subtitle={navSubtitle} topInset={top} />
        <EmptyState
          title="Character not found"
          message="This character is not in the currently loaded public showcase."
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-paimon-bg dark:bg-paimon-dark-bg">
      <CharacterNavBar title={navTitle} subtitle={navSubtitle} topInset={top} />
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-3 p-4"
        contentContainerStyle={{ paddingBottom: bottom + 24 }}
      >
        <CharacterHeader character={character} />
        <WeaponCard weapon={character.weapon} />
        <TabToggle active={activeTab} onChange={setActiveTab} />
        <BuildRolePicker
          builds={builds}
          selectedRole={selectedBuild?.role ?? ""}
          onChange={setSelectedRole}
        />

        {activeTab === "my-build" && (
          <MyBuildTab character={character} build={selectedBuild} />
        )}
        {activeTab === "recommended" && (
          <RecommendedTab
            characterId={character.id}
            selectedRole={selectedBuild?.role}
          />
        )}
        {activeTab === "compare" && (
          <CompareTab character={character} build={selectedBuild} />
        )}
      </ScrollView>
    </View>
  );
};

export default CharacterPage;

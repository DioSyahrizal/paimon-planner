import { getAllBuilds } from "@/lib/recommended-builds";
import type { RecommendedBuild, WeaponRecommendation } from "@/types/build";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { SectionList, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface BuildSection {
  title: string;
  data: RecommendedBuild[];
}

const TIER_PRIORITY: Record<WeaponRecommendation["tier"], number> = {
  S: 0,
  A: 1,
  B: 2,
};

function getBestArtifactSet(build: RecommendedBuild): string {
  const topSet = build.artifactSets[0];

  if (!topSet) {
    return "No artifact set listed";
  }

  return topSet.sets.map((set) => `${set.pieces}pc ${set.setName}`).join(" + ");
}

function getTopWeapon(build: RecommendedBuild): string {
  const topWeapon = [...build.weapons].sort((a, b) => {
    const tierDiff = TIER_PRIORITY[a.tier] - TIER_PRIORITY[b.tier];

    if (tierDiff !== 0) {
      return tierDiff;
    }

    return a.weaponName.localeCompare(b.weaponName);
  })[0];

  return topWeapon?.weaponName ?? "No weapon listed";
}

function formatUpdatedDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
}

function BuildCard({ build }: { build: RecommendedBuild }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() =>
        router.push({
          pathname: "/character/[id]",
          params: { id: build.characterId, tab: "recommended", role: build.role },
        })
      }
    >
      <View className="mb-3 rounded-[14px] border border-paimon-border bg-paimon-surface p-3.5 dark:border-paimon-dark-border dark:bg-paimon-dark-surface">
        <View className="mb-3 flex-row items-center justify-between gap-3">
          <Text className="flex-1 text-base font-bold text-paimon-text dark:text-paimon-dark-text">
            {build.role}
          </Text>
          <View className="rounded-full bg-paimon-accentSoft px-2.5 py-1 dark:bg-paimon-dark-accentSoft">
            <Text className="text-xs font-bold text-paimon-accent dark:text-paimon-dark-accent">
              READ ONLY
            </Text>
          </View>
        </View>

        <View className="gap-2.5">
          <View>
            <Text className="mb-1 text-xs uppercase text-paimon-subtle dark:text-paimon-dark-subtle">
              Best set
            </Text>
            <Text className="text-sm leading-5 text-paimon-text dark:text-paimon-dark-text">
              {getBestArtifactSet(build)}
            </Text>
          </View>

          <View>
            <Text className="mb-1 text-xs uppercase text-paimon-subtle dark:text-paimon-dark-subtle">
              Top weapon
            </Text>
            <Text className="text-sm leading-5 text-paimon-text dark:text-paimon-dark-text">
              {getTopWeapon(build)}
            </Text>
          </View>
        </View>

        <View className="mt-3.5 flex-row justify-between gap-3 border-t border-paimon-border pt-3 dark:border-paimon-dark-border">
          <Text className="flex-1 text-xs text-paimon-subtle dark:text-paimon-dark-subtle">
            Source: {build.source}
          </Text>
          <Text className="flex-1 text-xs text-paimon-subtle dark:text-paimon-dark-subtle">
            Updated: {formatUpdatedDate(build.lastUpdated)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function BuildsScreen() {
  const { top } = useSafeAreaInsets();

  const sections = useMemo<BuildSection[]>(() => {
    const groupedBuilds = getAllBuilds()
      .slice()
      .sort((a, b) => {
        const nameDiff = a.characterName.localeCompare(b.characterName);

        if (nameDiff !== 0) {
          return nameDiff;
        }

        return a.role.localeCompare(b.role);
      })
      .reduce<Record<string, RecommendedBuild[]>>((acc, build) => {
        if (!acc[build.characterName]) {
          acc[build.characterName] = [];
        }

        acc[build.characterName].push(build);
        return acc;
      }, {});

    return Object.entries(groupedBuilds)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([title, data]) => ({ title, data }));
  }, []);

  if (sections.length === 0) {
    return (
      <View
        className="flex-1 items-center justify-center bg-paimon-bg p-6 dark:bg-paimon-dark-bg"
        style={{ paddingTop: top + 24 }}
      >
        <Text className="text-2xl font-bold text-paimon-text dark:text-paimon-dark-text">
          Build Guides
        </Text>
        <Text className="mt-5 text-center text-lg font-semibold text-paimon-text dark:text-paimon-dark-text">
          No build guides yet
        </Text>
        <Text className="mt-2 text-center text-sm leading-5 text-paimon-subtle dark:text-paimon-dark-subtle">
          This tab reads from the bundled recommendation JSON. More guides will
          appear as they are manually converted and added.
        </Text>
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-paimon-bg dark:bg-paimon-dark-bg"
      style={{ paddingTop: top }}
    >
      <SectionList
        sections={sections}
        keyExtractor={(item) => `${item.characterId}-${item.role}`}
        stickySectionHeadersEnabled={false}
        contentContainerClassName="px-4 pb-6"
        renderSectionHeader={({ section }) => (
          <Text className="mb-2.5 mt-4 text-lg font-bold text-paimon-accent dark:text-paimon-dark-accent">
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => <BuildCard build={item} />}
        ListHeaderComponent={
          <View className="pb-3 pt-4">
            <Text className="text-2xl font-bold text-paimon-text dark:text-paimon-dark-text">
              Build Guides
            </Text>
            <Text className="mt-1.5 text-sm leading-5 text-paimon-subtle dark:text-paimon-dark-subtle">
              Read-only community build references curated in the bundled JSON
              dataset.
            </Text>
          </View>
        }
      />
    </View>
  );
}

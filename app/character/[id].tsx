import { ELEMENT_COLOR } from "@/constants/color";
import { useEnkaUser } from "@/hooks/useEnkaUser";
import { useUserStore } from "@/store/user-store";
import type { Artifact } from "@/types/artifact";
import type { Character } from "@/types/character";
import type { Weapon } from "@/types/weapon";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image, Text, View, XStack, YStack } from "tamagui";

type Tab = "my-build" | "recommended" | "compare";

// ─── Section A: Character Header ─────────────────────────────────────────────

function CharacterHeader({ character }: { character: Character }) {
  const elementColor = ELEMENT_COLOR[character.element] ?? "#c9a227";

  return (
    <XStack style={styles.header} gap="$4">
      <Image
        src={character.iconUrl}
        width={80}
        height={80}
        borderRadius={40}
        borderWidth={2}
        borderColor={elementColor}
        backgroundColor="#1a1a1a"
      />
      <YStack flex={1} justifyContent="center" gap="$1">
        <XStack alignItems="center" gap="$2">
          <Text style={styles.characterName}>{character.name}</Text>
          <View
            style={[styles.elementBadge, { backgroundColor: elementColor }]}
          >
            <Text style={styles.elementText}>{character.element}</Text>
          </View>
        </XStack>
        <Text style={styles.metaText}>
          Lv.{character.level} · A{character.ascension}
        </Text>
        <XStack gap="$3">
          <Text style={styles.metaText}>C{character.constellation}</Text>
          <Text style={styles.metaText}>
            Friendship: {character.friendship}
          </Text>
        </XStack>
        <XStack mt="$2" gap="$1">
          <Text style={styles.talentText}>
            Normal Attack: {character.talents.normal} ·
          </Text>

          <Text style={styles.talentText}>
            Skill: {character.talents.skill} ·
          </Text>
          <Text style={styles.talentText}>
            Burst: {character.talents.burst}
          </Text>
        </XStack>
      </YStack>
    </XStack>
  );
}

// ─── Section A: Weapon Card ───────────────────────────────────────────────────

function WeaponCard({ weapon }: { weapon: Weapon }) {
  console.log("weapon", JSON.stringify(weapon, null, 2));
  return (
    <View style={styles.weaponCard}>
      <XStack gap="$3" alignItems="center">
        <Image
          src={weapon.iconUrl}
          width={64}
          height={64}
          borderRadius={8}
          backgroundColor="#111"
        />
        <XStack flex={1} justifyContent="space-between" alignItems="flex-start">
          <YStack flex={1} gap="$1">
            <Text style={styles.weaponName}>{weapon.name}</Text>
            <Text style={styles.weaponMeta}>
              Lv.{weapon.level} · R{weapon.refinement} · {weapon.type}
            </Text>
          </YStack>
          <YStack alignItems="flex-end" gap="$1">
            <Text style={styles.weaponStat}>ATK {weapon.baseATK}</Text>
            {weapon.subStat && (
              <Text style={styles.weaponSubStat}>
                {weapon.subStat.stat} {(weapon.subStat.value * 100).toFixed(1)}%
              </Text>
            )}
          </YStack>
        </XStack>
      </XStack>
    </View>
  );
}

// ─── Section B: Tab Toggle ────────────────────────────────────────────────────

function TabToggle({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (tab: Tab) => void;
}) {
  const tabs: { key: Tab; label: string }[] = [
    { key: "my-build", label: "My Build" },
    { key: "recommended", label: "Recommended" },
    { key: "compare", label: "Compare" },
  ];

  return (
    <XStack style={styles.tabRow}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, active === tab.key && styles.tabActive]}
          onPress={() => onChange(tab.key)}
        >
          <Text
            style={[styles.tabText, active === tab.key && styles.tabTextActive]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </XStack>
  );
}

// ─── Tab: Recommended (placeholder) ──────────────────────────────────────────

function RecommendedTab() {
  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderText}>Recommended builds coming soon</Text>
      <Text style={styles.placeholderSubText}>
        Add a build guide from the Builds tab first.
      </Text>
    </View>
  );
}

// ─── Tab: Compare (placeholder) ──────────────────────────────────────────────

function CompareTab() {
  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderText}>Gap analysis coming soon</Text>
      <Text style={styles.placeholderSubText}>
        Requires a saved recommended build.
      </Text>
    </View>
  );
}

// ─── Tab: My Build (your task — Steps 4 & 5) ─────────────────────────────────

function MyBuildTab({ character }: { character: Character }) {
  return (
    <YStack gap="$3">
      <Text style={styles.sectionLabel}>Artifacts</Text>
      {character.artifacts.map((artifact) => (
        <ArtifactCard key={artifact.id} artifact={artifact} />
      ))}
      <Text style={styles.sectionLabel}>Total Stats</Text>
      <StatsGrid character={character} />
    </YStack>
  );
}

// ─── Artifact Card (Step 4 — build this out) ─────────────────────────────────

function ArtifactCard({ artifact }: { artifact: Artifact }) {
  const renderStarRarity = (rarity: number) => {
    return "★".repeat(rarity);
  };
  return (
    <View style={styles.artifactCard}>
      <XStack gap="$3">
        <Image
          src={artifact.iconUrl}
          width={64}
          height={64}
          borderRadius={8}
          backgroundColor="#111"
        />
        <YStack flex={1}>
          <XStack justifyContent="space-between" marginBottom={4}>
            <Text style={styles.artifactSlot}>
              {artifact.slotType.toUpperCase()}
            </Text>
            <XStack gap="$2">
              <Text style={styles.artifactLevel}>
                {renderStarRarity(artifact.rarity)}
              </Text>
              <Text style={styles.artifactLevel}>+{artifact.level}</Text>
            </XStack>
          </XStack>
          <Text style={styles.artifactSet}>{artifact.setName}</Text>
          <Text style={styles.artifactMainStat}>
            {artifact.mainStat.stat}: {artifact.mainStat.value}
          </Text>
        </YStack>
      </XStack>
      <YStack marginTop={8} gap="$1">
        {artifact.subStats.map((sub, i) => (
          <Text key={i} style={styles.artifactSubStat}>
            · {sub.stat} {sub.value}
          </Text>
        ))}
      </YStack>
    </View>
  );
}

// ─── Stats Grid (Step 5 — build this out) ────────────────────────────────────

function StatsGrid({ character }: { character: Character }) {
  const { totalStats } = character;
  const rows = [
    { label: "HP", value: Math.round(totalStats.hp).toLocaleString() },
    { label: "ATK", value: Math.round(totalStats.atk).toLocaleString() },
    { label: "DEF", value: Math.round(totalStats.def).toLocaleString() },
    { label: "EM", value: Math.round(totalStats.em).toLocaleString() },
    { label: "ER%", value: `${(totalStats.er * 100).toFixed(1)}%` },
    { label: "CR%", value: `${(totalStats.cr * 100).toFixed(1)}%` },
    { label: "CD%", value: `${(totalStats.cd * 100).toFixed(1)}%` },
    ...(totalStats.elementalDmgBonus
      ? [
          {
            label: "DMG%",
            value: `${(totalStats.elementalDmgBonus * 100).toFixed(1)}%`,
          },
        ]
      : []),
    ...(totalStats.healingBonus
      ? [
          {
            label: "Heal%",
            value: `${(totalStats.healingBonus * 100).toFixed(1)}%`,
          },
        ]
      : []),
  ];

  return (
    <View style={styles.statsGrid}>
      {rows.map((row) => (
        <XStack
          key={row.label}
          justifyContent="space-between"
          paddingVertical={6}
          borderBottomWidth={1}
          borderBottomColor="#2a2a2a"
        >
          <Text style={styles.statLabel}>{row.label}</Text>
          <Text style={styles.statValue}>{row.value}</Text>
        </XStack>
      ))}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function CharacterDetailScreen() {
  const { bottom } = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const uid = useUserStore((s) => s.uid);
  const [activeTab, setActiveTab] = useState<Tab>("my-build");

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
      {activeTab === "recommended" && <RecommendedTab />}
      {activeTab === "compare" && <CompareTab />}
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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

  // Header
  header: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
  },
  characterName: { color: "#fff", fontSize: 20, fontWeight: "700" },
  elementBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  elementText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  metaText: { color: "#aaa", fontSize: 13 },
  talentText: { color: "#c9a227", fontSize: 12 },

  // Weapon
  weaponCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 14,
  },
  weaponName: { color: "#fff", fontSize: 15, fontWeight: "600" },
  weaponMeta: { color: "#888", fontSize: 12, marginTop: 2 },
  weaponStat: { color: "#c9a227", fontSize: 14, fontWeight: "600" },
  weaponSubStat: { color: "#aaa", fontSize: 12 },

  // Tabs
  tabRow: {
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  tabActive: { backgroundColor: "#c9a227" },
  tabText: { color: "#888", fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: "#000" },

  // My Build
  sectionLabel: {
    color: "#c9a227",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 4,
  },

  // Artifact
  artifactCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    padding: 12,
  },
  artifactSlot: {
    color: "#888",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  artifactLevel: { color: "#c9a227", fontSize: 12, fontWeight: "700" },
  artifactSet: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  artifactMainStat: { color: "#c9a227", fontSize: 13 },
  artifactSubStat: { color: "#aaa", fontSize: 12 },

  // Stats
  statsGrid: {
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  statLabel: { color: "#888", fontSize: 13 },
  statValue: { color: "#fff", fontSize: 13, fontWeight: "600" },

  // Placeholders
  placeholderContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    gap: 8,
  },
  placeholderText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  placeholderSubText: { color: "#666", fontSize: 13, textAlign: "center" },
});

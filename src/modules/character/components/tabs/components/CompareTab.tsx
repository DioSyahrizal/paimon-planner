import { analyzeGap } from "@/lib/gap-analysis";
import { getBuildsForCharacter } from "@/lib/recommended-builds";
import type { ArtifactSlot } from "@/types/artifact";
import type { GapAnalysis, StatGap } from "@/types/build";
import type { Character } from "@/types/character";
import React, { FC } from "react";
import { StyleSheet } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";

interface Props {
  characterId: string;
  character: Character;
}

const SLOT_LABELS: Record<ArtifactSlot, string> = {
  flower: "Flower",
  feather: "Feather",
  sands: "Sands",
  goblet: "Goblet",
  circlet: "Circlet",
};

const TIER_COLORS: Record<string, string> = {
  S: "#c9a227",
  A: "#9b8fc7",
  B: "#6b8fa3",
  unranked: "#555",
};

function scoreColor(score: number): string {
  if (score >= 80) return "#4caf50";
  if (score >= 50) return "#c9a227";
  return "#e05c5c";
}

function deltaColor(delta: number): string {
  if (delta >= 0) return "#4caf50";
  if (delta >= -20) return "#c9a227";
  return "#e05c5c";
}

const SectionLabel: FC<{ label: string }> = ({ label }) => (
  <Text style={styles.sectionLabel}>{label}</Text>
);

const ScoreBadge: FC<{ score: number }> = ({ score }) => (
  <View style={[styles.scoreBadge, { borderColor: scoreColor(score) }]}>
    <Text style={[styles.scoreValue, { color: scoreColor(score) }]}>
      {score}
    </Text>
    <Text style={styles.scoreMax}>/100</Text>
  </View>
);

const CheckRow: FC<{ label: string; passed: boolean; detail?: string }> = ({
  label,
  passed,
  detail,
}) => (
  <XStack
    style={styles.rowCard}
    alignItems="center"
    justifyContent="space-between"
  >
    <YStack flex={1} gap="$1">
      <Text style={styles.rowLabel}>{label}</Text>
      {detail && <Text style={styles.rowDetail}>{detail}</Text>}
    </YStack>
    <Text style={passed ? styles.iconPass : styles.iconFail}>
      {passed ? "✓" : "✗"}
    </Text>
  </XStack>
);

const StatGapRow: FC<{ gap: StatGap }> = ({ gap }) => {
  const isPct = gap.stat.endsWith("%");
  const suffix = isPct ? "%" : "";
  const decimals = isPct ? 1 : 0;
  const currentDisplay = `${gap.current.toFixed(decimals)}${suffix}`;
  const goalDisplay = `${gap.recommended}${suffix}`;
  const deltaDisplay =
    gap.delta >= 0
      ? `+${gap.delta.toFixed(decimals)}${suffix}`
      : `${gap.delta.toFixed(decimals)}${suffix}`;

  return (
    <XStack
      style={styles.rowCard}
      alignItems="center"
      justifyContent="space-between"
    >
      <Text style={styles.rowLabel}>{gap.stat}</Text>
      <XStack gap="$3" alignItems="center">
        <YStack alignItems="flex-end">
          <Text style={styles.statCurrent}>{currentDisplay}</Text>
          <Text style={styles.statGoal}>goal: {goalDisplay}</Text>
        </YStack>
        <Text style={[styles.statDelta, { color: deltaColor(gap.delta) }]}>
          {deltaDisplay}
        </Text>
      </XStack>
    </XStack>
  );
};

const CompareTab: FC<Props> = ({ characterId, character }) => {
  const builds = getBuildsForCharacter(characterId);

  if (builds.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No recommended build found.</Text>
        <Text style={styles.emptySubText}>
          Add a build entry to recommended-builds.json for this character first.
        </Text>
      </View>
    );
  }

  const build = builds[0];
  const analysis: GapAnalysis = analyzeGap(character, build);

  const mainStatSlots = ["sands", "goblet", "circlet"] as const;
  const recommendedMainStats = build.mainStats;

  return (
    <YStack gap="$4">
      {/* Score Header */}
      <XStack
        style={styles.scoreHeader}
        alignItems="center"
        justifyContent="space-between"
      >
        <YStack gap="$1">
          <Text style={styles.roleTitle}>{build.role}</Text>
          <Text style={styles.sourceLabel}>vs. {build.source} guide</Text>
        </YStack>
        <ScoreBadge score={analysis.overallScore} />
      </XStack>

      {/* Artifact Set */}
      <SectionLabel label="Artifact Set" />
      <CheckRow
        label={build.artifactSets[0].sets
          .map((s) => `${s.setName} ${s.pieces}pc`)
          .join(" + ")}
        passed={analysis.artifactSetMatch}
        detail={
          analysis.artifactSetMatch ? "Set bonus active" : "Wrong set equipped"
        }
      />

      {/* Main Stats */}
      <SectionLabel label="Main Stats" />
      {mainStatSlots.map((slot) => {
        const passed = analysis.mainStatMatch[slot];
        const options = recommendedMainStats[slot].join(" / ");
        const equipped = character.artifacts.find((a) => a.slotType === slot)
          ?.mainStat.stat;
        return (
          <CheckRow
            key={slot}
            label={SLOT_LABELS[slot]}
            passed={passed}
            detail={
              passed
                ? `${equipped} ✓`
                : `Have: ${equipped ?? "—"} · Want: ${options}`
            }
          />
        );
      })}

      {/* Weapon */}
      <SectionLabel label="Weapon" />
      <XStack
        style={styles.rowCard}
        alignItems="center"
        justifyContent="space-between"
      >
        <YStack flex={1} gap="$1">
          <Text style={styles.rowLabel}>{character.weapon.name}</Text>
          <Text style={styles.rowDetail}>
            {analysis.weaponTier === "unranked"
              ? "Not in recommended list"
              : `Tier ${analysis.weaponTier} pick`}
          </Text>
        </YStack>
        <Text
          style={[styles.tierText, { color: TIER_COLORS[analysis.weaponTier] }]}
        >
          {analysis.weaponTier === "unranked" ? "—" : analysis.weaponTier}
        </Text>
      </XStack>

      {/* Goal Stats */}
      {analysis.substatGaps.length > 0 && (
        <>
          <SectionLabel label="Goal Stats" />
          {analysis.substatGaps.map((gap) => (
            <StatGapRow key={gap.stat} gap={gap} />
          ))}
        </>
      )}

      {/* Substat Coverage */}
      <SectionLabel label="Substat Coverage" />
      <View style={styles.rowCard}>
        <XStack flexWrap="wrap" gap="$2">
          {build.substatPriority.slice(0, 4).map((stat, i) => {
            const allSubs = character.artifacts.flatMap((a) =>
              a.subStats.map((s) => s.stat),
            );
            const present = allSubs.includes(stat);
            return (
              <XStack key={stat} alignItems="center" gap="$1">
                <Text style={styles.priorityIndex}>{i + 1}.</Text>
                <Text
                  style={[
                    styles.substatChip,
                    { color: present ? "#4caf50" : "#555" },
                  ]}
                >
                  {stat}
                </Text>
              </XStack>
            );
          })}
        </XStack>
        <Text style={styles.coverageHint}>
          Green = present in at least one artifact
        </Text>
      </View>
    </YStack>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  emptySubText: { color: "#666", fontSize: 13, textAlign: "center" },

  scoreHeader: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
  },
  scoreBadge: {
    borderWidth: 2,
    borderRadius: 40,
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreValue: { fontSize: 20, fontWeight: "800" },
  scoreMax: { color: "#555", fontSize: 10 },

  sectionLabel: {
    color: "#c9a227",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 4,
  },

  rowCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    padding: 12,
  },
  rowLabel: { color: "#fff", fontSize: 14, fontWeight: "600" },
  rowDetail: { color: "#888", fontSize: 12 },

  iconPass: { color: "#4caf50", fontSize: 18, fontWeight: "700" },
  iconFail: { color: "#e05c5c", fontSize: 18, fontWeight: "700" },

  tierText: { fontSize: 18, fontWeight: "800" },

  statCurrent: { color: "#fff", fontSize: 13, fontWeight: "600" },
  statGoal: { color: "#666", fontSize: 11 },
  statDelta: {
    fontSize: 13,
    fontWeight: "700",
    minWidth: 52,
    textAlign: "right",
  },

  substatChip: { fontSize: 14, fontWeight: "600" },
  priorityIndex: { color: "#555", fontSize: 12 },
  coverageHint: { color: "#444", fontSize: 11, marginTop: 8 },

  roleTitle: { color: "#fff", fontSize: 15, fontWeight: "700" },
  sourceLabel: { color: "#666", fontSize: 11 },
});

export default CompareTab;

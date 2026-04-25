import type { ArtifactScore, Grade } from "@/lib/artifact-scorer";
import type { Artifact, StatType } from "@/types/artifact";
import { FC } from "react";
import { StyleSheet } from "react-native";
import { Image, Text, View, XStack, YStack } from "tamagui";

// ── Grade colours ─────────────────────────────────────────────────────────────
const GRADE_COLORS: Record<Grade, { bg: string; text: string }> = {
  S: { bg: "#FFD700", text: "#000" },
  A: { bg: "#9de06b", text: "#000" },
  B: { bg: "#8ec8ff", text: "#000" },
  C: { bg: "#e7c766", text: "#000" },
  D: { bg: "#555", text: "#fff" },
};

// ── Substat colours by priority rank ─────────────────────────────────────────
const PRIORITY_COLORS: Record<number, string> = {
  0: "#FFD700", // 1st priority — gold
  1: "#e7c766", // 2nd priority — light gold
  2: "#8ec8ff", // 3rd priority — blue
  3: "#aaa",    // 4th priority — muted
};

function getSubstatColor(priorityRank: number | null): string {
  if (priorityRank === null) return "#555";
  return PRIORITY_COLORS[priorityRank] ?? "#aaa";
}

function formatValue(stat: StatType, value: number): string {
  const isPct =
    stat.endsWith("%") ||
    stat === "EM" ||
    stat.endsWith("DMG%") ||
    stat === "Healing%";
  // Percentage stats come from Enka as e.g. 3.89 (not 0.0389)
  return isPct ? `${value.toFixed(1)}` : `${Math.round(value)}`;
}

// ── Grade badge ───────────────────────────────────────────────────────────────
function GradeBadge({ grade }: { grade: Grade }) {
  const { bg, text } = GRADE_COLORS[grade];
  return (
    <View style={[styles.gradeBadge, { backgroundColor: bg }]}>
      <Text style={[styles.gradeText, { color: text }]}>{grade}</Text>
    </View>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
  artifact: Artifact;
  score?: ArtifactScore;
}

const ArtifactCard: FC<Props> = ({ artifact, score }) => {
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
          <XStack justifyContent="space-between" alignItems="center" marginBottom={4}>
            <Text style={styles.artifactSlot}>
              {artifact.slotType.toUpperCase()}
            </Text>
            <XStack gap="$2" alignItems="center">
              <Text style={styles.artifactLevel}>
                {"★".repeat(artifact.rarity)}
              </Text>
              <Text style={styles.artifactLevel}>+{artifact.level}</Text>
              {score && <GradeBadge grade={score.grade} />}
            </XStack>
          </XStack>
          <Text style={styles.artifactSet}>{artifact.setName}</Text>
          <Text style={styles.artifactMainStat}>
            {artifact.mainStat.stat}: {formatValue(artifact.mainStat.stat, artifact.mainStat.value)}
          </Text>
        </YStack>
      </XStack>

      <YStack marginTop={8} gap="$1">
        {artifact.subStats.map((sub, i) => {
          const contribution = score?.substatContributions.find(
            (c) => c.stat === sub.stat,
          );
          const priorityRank = contribution?.priorityRank ?? null;
          const color = getSubstatColor(priorityRank);
          const efficiencyPct =
            contribution && priorityRank !== null
              ? Math.round(contribution.efficiency * 100)
              : null;

          return (
            <XStack key={i} justifyContent="space-between" alignItems="center">
              <Text style={[styles.artifactSubStat, { color }]}>
                · {sub.stat} {formatValue(sub.stat, sub.value)}
              </Text>
              {efficiencyPct !== null && (
                <Text style={[styles.efficiencyText, { color }]}>
                  {efficiencyPct}%
                </Text>
              )}
            </XStack>
          );
        })}
      </YStack>

      {score && (
        <View style={styles.scoreBar}>
          <View
            style={[styles.scoreBarFill, { width: `${score.score}%` as `${number}%` }]}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  artifactSubStat: { fontSize: 12 },
  efficiencyText: { fontSize: 11, fontWeight: "600", opacity: 0.8 },
  gradeBadge: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  gradeText: { fontSize: 11, fontWeight: "800" },
  scoreBar: {
    marginTop: 10,
    height: 3,
    backgroundColor: "#2a2a2a",
    borderRadius: 999,
    overflow: "hidden",
  },
  scoreBarFill: {
    height: 3,
    backgroundColor: "#c9a227",
    borderRadius: 999,
  },
});

export default ArtifactCard;

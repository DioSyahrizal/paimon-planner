import type { ArtifactScore, Grade } from "@/lib/artifact-scorer";
import type { Artifact, StatType } from "@/types/artifact";
import { FC } from "react";
import { Image, Text, View } from "react-native";

const GRADE_COLORS: Record<Grade, { bg: string; text: string }> = {
  S: { bg: "#FFD700", text: "#000" },
  A: { bg: "#9de06b", text: "#000" },
  B: { bg: "#8ec8ff", text: "#000" },
  C: { bg: "#e7c766", text: "#000" },
  D: { bg: "#555", text: "#fff" },
};

const PRIORITY_COLORS: Record<number, string> = {
  0: "#FFD700",
  1: "#e7c766",
  2: "#8ec8ff",
  3: "#aaa",
};

function getSubstatColor(priorityRank: number | null): string {
  if (priorityRank === null) return "#7d715f";
  return PRIORITY_COLORS[priorityRank] ?? "#aaa";
}

function formatValue(stat: StatType, value: number): string {
  const isPct =
    stat.endsWith("%") ||
    stat === "EM" ||
    stat.endsWith("DMG%") ||
    stat === "Healing%";
  return isPct ? `${value.toFixed(1)}` : `${Math.round(value)}`;
}

function GradeBadge({ grade }: { grade: Grade }) {
  const { bg, text } = GRADE_COLORS[grade];
  return (
    <View
      className="items-center justify-center rounded-md px-2 py-0.5"
      style={{ backgroundColor: bg }}
    >
      <Text className="text-xs font-extrabold" style={{ color: text }}>
        {grade}
      </Text>
    </View>
  );
}

interface Props {
  artifact: Artifact;
  score?: ArtifactScore;
}

const ArtifactCard: FC<Props> = ({ artifact, score }) => {
  return (
    <View className="rounded-xl border border-paimon-border bg-paimon-surface p-3 dark:border-paimon-dark-border dark:bg-paimon-dark-surface">
      <View className="flex-row gap-3">
        <Image
          source={{ uri: artifact.iconUrl }}
          className="h-16 w-16 rounded-lg bg-paimon-raised dark:bg-paimon-dark-raised"
        />
        <View className="flex-1">
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="text-xs font-bold uppercase tracking-wide text-paimon-subtle dark:text-paimon-dark-subtle">
              {artifact.slotType}
            </Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-xs font-bold text-paimon-accent dark:text-paimon-dark-accent">
                {"★".repeat(artifact.rarity)}
              </Text>
              <Text className="text-xs font-bold text-paimon-accent dark:text-paimon-dark-accent">
                +{artifact.level}
              </Text>
              {score && <GradeBadge grade={score.grade} />}
            </View>
          </View>
          <Text className="mb-1 text-sm font-semibold text-paimon-text dark:text-paimon-dark-text">
            {artifact.setName}
          </Text>
          <Text className="text-xs text-paimon-accent dark:text-paimon-dark-accent">
            {artifact.mainStat.stat}:{" "}
            {formatValue(artifact.mainStat.stat, artifact.mainStat.value)}
          </Text>
        </View>
      </View>

      <View className="mt-2 gap-1">
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
            <View key={i} className="flex-row items-center justify-between">
              <Text className="text-xs" style={{ color }}>
                · {sub.stat} {formatValue(sub.stat, sub.value)}
              </Text>
              {efficiencyPct !== null && (
                <Text className="text-xs font-semibold opacity-80" style={{ color }}>
                  {efficiencyPct}%
                </Text>
              )}
            </View>
          );
        })}
      </View>

      {score && (
        <View className="mt-2.5 h-[3px] overflow-hidden rounded-full bg-paimon-border dark:bg-paimon-dark-border">
          <View
            className="h-[3px] rounded-full bg-paimon-accent dark:bg-paimon-dark-accent"
            style={{ width: `${score.score}%` }}
          />
        </View>
      )}
    </View>
  );
};

export default ArtifactCard;

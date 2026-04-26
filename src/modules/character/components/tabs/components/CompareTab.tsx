import { cn } from "@/lib/cn";
import { analyzeGap } from "@/lib/gap-analysis";
import { getBuildsForCharacter } from "@/lib/recommended-builds";
import type { ArtifactSlot } from "@/types/artifact";
import type { GapAnalysis, StatGap } from "@/types/build";
import type { Character } from "@/types/character";
import React, { FC } from "react";
import { Text, View } from "react-native";

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
  <Text className="mt-1 text-xs font-bold uppercase tracking-wide text-paimon-accent dark:text-paimon-dark-accent">
    {label}
  </Text>
);

const ScoreBadge: FC<{ score: number }> = ({ score }) => (
  <View
    className="h-16 w-16 items-center justify-center rounded-full border-2"
    style={{ borderColor: scoreColor(score) }}
  >
    <Text className="text-xl font-extrabold" style={{ color: scoreColor(score) }}>
      {score}
    </Text>
    <Text className="text-[10px] text-paimon-subtle dark:text-paimon-dark-subtle">
      /100
    </Text>
  </View>
);

const CheckRow: FC<{ label: string; passed: boolean; detail?: string }> = ({
  label,
  passed,
  detail,
}) => (
  <View className="flex-row items-center justify-between rounded-xl border border-paimon-border bg-paimon-surface p-3 dark:border-paimon-dark-border dark:bg-paimon-dark-surface">
    <View className="flex-1 gap-1">
      <Text className="text-sm font-semibold text-paimon-text dark:text-paimon-dark-text">
        {label}
      </Text>
      {detail && (
        <Text className="text-xs text-paimon-subtle dark:text-paimon-dark-subtle">
          {detail}
        </Text>
      )}
    </View>
    <Text
      className={cn(
        "text-lg font-bold",
        passed
          ? "text-paimon-success dark:text-paimon-dark-success"
          : "text-paimon-danger dark:text-paimon-dark-danger",
      )}
    >
      {passed ? "✓" : "✕"}
    </Text>
  </View>
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
    <View className="flex-row items-center justify-between rounded-xl border border-paimon-border bg-paimon-surface p-3 dark:border-paimon-dark-border dark:bg-paimon-dark-surface">
      <Text className="text-sm font-semibold text-paimon-text dark:text-paimon-dark-text">
        {gap.stat}
      </Text>
      <View className="flex-row items-center gap-3">
        <View className="items-end">
          <Text className="text-xs font-semibold text-paimon-text dark:text-paimon-dark-text">
            {currentDisplay}
          </Text>
          <Text className="text-xs text-paimon-subtle dark:text-paimon-dark-subtle">
            goal: {goalDisplay}
          </Text>
        </View>
        <Text
          className="min-w-[52px] text-right text-xs font-bold"
          style={{ color: deltaColor(gap.delta) }}
        >
          {deltaDisplay}
        </Text>
      </View>
    </View>
  );
};

const CompareTab: FC<Props> = ({ characterId, character }) => {
  const builds = getBuildsForCharacter(characterId);

  if (builds.length === 0) {
    return (
      <View className="items-center gap-2 rounded-xl border border-paimon-border bg-paimon-surface p-8 dark:border-paimon-dark-border dark:bg-paimon-dark-surface">
        <Text className="text-center text-[15px] font-semibold text-paimon-text dark:text-paimon-dark-text">
          No recommended build found.
        </Text>
        <Text className="text-center text-xs text-paimon-subtle dark:text-paimon-dark-subtle">
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
    <View className="gap-4">
      <View className="flex-row items-center justify-between rounded-xl border border-paimon-border bg-paimon-surface p-4 dark:border-paimon-dark-border dark:bg-paimon-dark-surface">
        <View className="gap-1">
          <Text className="text-[15px] font-bold text-paimon-text dark:text-paimon-dark-text">
            {build.role}
          </Text>
          <Text className="text-xs text-paimon-subtle dark:text-paimon-dark-subtle">
            vs. {build.source} guide
          </Text>
        </View>
        <ScoreBadge score={analysis.overallScore} />
      </View>

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
                : `Have: ${equipped ?? "-"} · Want: ${options}`
            }
          />
        );
      })}

      <SectionLabel label="Weapon" />
      <View className="flex-row items-center justify-between rounded-xl border border-paimon-border bg-paimon-surface p-3 dark:border-paimon-dark-border dark:bg-paimon-dark-surface">
        <View className="flex-1 gap-1">
          <Text className="text-sm font-semibold text-paimon-text dark:text-paimon-dark-text">
            {character.weapon.name}
          </Text>
          <Text className="text-xs text-paimon-subtle dark:text-paimon-dark-subtle">
            {analysis.weaponTier === "unranked"
              ? "Not in recommended list"
              : `Tier ${analysis.weaponTier} pick`}
          </Text>
        </View>
        <Text
          className="text-lg font-extrabold"
          style={{ color: TIER_COLORS[analysis.weaponTier] }}
        >
          {analysis.weaponTier === "unranked" ? "-" : analysis.weaponTier}
        </Text>
      </View>

      {analysis.substatGaps.length > 0 && (
        <>
          <SectionLabel label="Goal Stats" />
          {analysis.substatGaps.map((gap) => (
            <StatGapRow key={gap.stat} gap={gap} />
          ))}
        </>
      )}

      <SectionLabel label="Substat Coverage" />
      <View className="rounded-xl border border-paimon-border bg-paimon-surface p-3 dark:border-paimon-dark-border dark:bg-paimon-dark-surface">
        <View className="flex-row flex-wrap gap-2">
          {build.substatPriority.slice(0, 4).map((stat, i) => {
            const allSubs = character.artifacts.flatMap((a) =>
              a.subStats.map((s) => s.stat),
            );
            const present = allSubs.includes(stat);
            return (
              <View key={stat} className="flex-row items-center gap-1">
                <Text className="text-xs text-paimon-subtle dark:text-paimon-dark-subtle">
                  {i + 1}.
                </Text>
                <Text
                  className={cn(
                    "text-sm font-semibold",
                    present
                      ? "text-paimon-success dark:text-paimon-dark-success"
                      : "text-paimon-subtle dark:text-paimon-dark-subtle",
                  )}
                >
                  {stat}
                </Text>
              </View>
            );
          })}
        </View>
        <Text className="mt-2 text-xs text-paimon-subtle dark:text-paimon-dark-subtle">
          Green = present in at least one artifact
        </Text>
      </View>
    </View>
  );
};

export default CompareTab;

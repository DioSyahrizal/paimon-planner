import { scoreBuild, type BuildScore, type Grade } from "@/lib/artifact-scorer";
import { getBuildsForCharacter } from "@/lib/recommended-builds";
import type { Character } from "@/types/character";
import React, { FC, useMemo } from "react";
import { Text, View } from "react-native";
import ArtifactCard from "./components/ArtifactCard";
import StatsGrid from "./components/StatsGrid";

const GRADE_COLORS: Record<Grade, { bg: string; text: string }> = {
  S: { bg: "#FFD700", text: "#000" },
  A: { bg: "#9de06b", text: "#000" },
  B: { bg: "#8ec8ff", text: "#000" },
  C: { bg: "#e7c766", text: "#000" },
  D: { bg: "#555", text: "#fff" },
};

function OverallScoreBanner({ buildScore }: { buildScore: BuildScore }) {
  const { bg, text } = GRADE_COLORS[buildScore.grade];

  return (
    <View className="rounded-xl border border-paimon-border bg-paimon-surface p-3.5 dark:border-paimon-dark-border dark:bg-paimon-dark-surface">
      <Text className="text-xs font-bold uppercase tracking-wide text-paimon-subtle dark:text-paimon-dark-subtle">
        Build Score
      </Text>
      <View className="flex-row items-end gap-2">
        <Text className="text-4xl font-extrabold text-paimon-text dark:text-paimon-dark-text">
          {buildScore.overall}
        </Text>
        <Text className="mb-1 text-sm text-paimon-subtle dark:text-paimon-dark-subtle">
          /100
        </Text>
        <View
          className="mb-1 rounded-lg px-2.5 py-1"
          style={{ backgroundColor: bg }}
        >
          <Text className="text-sm font-extrabold" style={{ color: text }}>
            {buildScore.grade}
          </Text>
        </View>
      </View>
      <View className="mt-1 flex-row flex-wrap gap-3">
        <Text className="text-xs text-paimon-subtle dark:text-paimon-dark-subtle">
          Substats {buildScore.substatScore}/60
        </Text>
        <Text className="text-xs text-paimon-subtle dark:text-paimon-dark-subtle">
          Main stats {buildScore.mainStatScore}/30
        </Text>
        <Text className="text-xs text-paimon-subtle dark:text-paimon-dark-subtle">
          Set {buildScore.setScore}/10
        </Text>
      </View>
    </View>
  );
}

interface Props {
  character: Character;
}

const MyBuildTab: FC<Props> = ({ character }) => {
  const buildScore = useMemo(() => {
    const builds = getBuildsForCharacter(character.id);
    if (!builds.length || !character.artifacts.length) return null;
    return scoreBuild(character.artifacts, builds[0]);
  }, [character.id, character.artifacts]);

  return (
    <View className="gap-3">
      {buildScore && <OverallScoreBanner buildScore={buildScore} />}

      <Text className="mt-1 text-xs font-bold uppercase tracking-wide text-paimon-accent dark:text-paimon-dark-accent">
        Artifacts
      </Text>
      {character.artifacts.map((artifact) => {
        const artifactScore = buildScore?.artifactScores.find(
          (s) => s.artifactId === artifact.id,
        );
        return (
          <ArtifactCard
            key={artifact.id}
            artifact={artifact}
            score={artifactScore}
          />
        );
      })}

      <Text className="mt-1 text-xs font-bold uppercase tracking-wide text-paimon-accent dark:text-paimon-dark-accent">
        Total Stats
      </Text>
      <StatsGrid character={character} />
    </View>
  );
};

export default MyBuildTab;

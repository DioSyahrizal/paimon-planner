import { scoreBuild, scoreToGrade, type BuildScore, type Grade } from "@/lib/artifact-scorer";
import { getBuildsForCharacter } from "@/lib/recommended-builds";
import type { Character } from "@/types/character";
import React, { FC, useMemo } from "react";
import { StyleSheet } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";
import ArtifactCard from "./components/ArtifactCard";
import StatsGrid from "./components/StatsGrid";

// ── Overall score badge ───────────────────────────────────────────────────────
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
    <View style={styles.scoreBanner}>
      <YStack gap={2}>
        <Text style={styles.scoreBannerLabel}>Build Score</Text>
        <XStack gap="$2" alignItems="center">
          <Text style={styles.scoreBannerValue}>{buildScore.overall}</Text>
          <Text style={styles.scoreBannerMax}>/100</Text>
          <View style={[styles.gradePill, { backgroundColor: bg }]}>
            <Text style={[styles.gradePillText, { color: text }]}>
              {buildScore.grade}
            </Text>
          </View>
        </XStack>
        <XStack gap="$3" marginTop={4}>
          <Text style={styles.scoreBreakdown}>
            Substats {buildScore.substatScore}/60
          </Text>
          <Text style={styles.scoreBreakdown}>
            Main stats {buildScore.mainStatScore}/30
          </Text>
          <Text style={styles.scoreBreakdown}>
            Set {buildScore.setScore}/10
          </Text>
        </XStack>
      </YStack>
    </View>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
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
    <YStack gap="$3">
      {buildScore && <OverallScoreBanner buildScore={buildScore} />}

      <Text style={styles.sectionLabel}>Artifacts</Text>
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

      <Text style={styles.sectionLabel}>Total Stats</Text>
      <StatsGrid character={character} />
    </YStack>
  );
};

const styles = StyleSheet.create({
  sectionLabel: {
    color: "#c9a227",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 4,
  },
  scoreBanner: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    padding: 14,
  },
  scoreBannerLabel: {
    color: "#888",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  scoreBannerValue: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
  },
  scoreBannerMax: {
    color: "#888",
    fontSize: 14,
    alignSelf: "flex-end",
    marginBottom: 4,
  },
  gradePill: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: "flex-end",
    marginBottom: 3,
  },
  gradePillText: { fontSize: 14, fontWeight: "800" },
  scoreBreakdown: {
    color: "#666",
    fontSize: 11,
  },
});

export default MyBuildTab;

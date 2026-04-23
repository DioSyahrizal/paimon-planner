import { Character } from "@/types/character";
import React, { FC } from "react";
import { StyleSheet } from "react-native";
import { Text, YStack } from "tamagui";
import ArtifactCard from "./components/ArtifactCard";
import StatsGrid from "./components/StatsGrid";

interface Props {
  character: Character;
}

const MyBuildTab: FC<Props> = ({ character }) => {
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
};

const styles = StyleSheet.create({
  // My Build
  sectionLabel: {
    color: "#c9a227",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 4,
  },
});

export default MyBuildTab;

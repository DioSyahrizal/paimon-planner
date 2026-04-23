import { Artifact } from "@/types/artifact";
import { FC } from "react";
import { StyleSheet } from "react-native";
import { Image, Text, View, XStack, YStack } from "tamagui";

interface Props {
  artifact: Artifact;
}

const ArtifactCard: FC<Props> = ({ artifact }) => {
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
};

const styles = StyleSheet.create({
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
});

export default ArtifactCard;

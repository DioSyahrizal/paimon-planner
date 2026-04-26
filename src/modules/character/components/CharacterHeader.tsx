import { ELEMENT_COLOR } from "@/constants/color";
import { useAppTheme, type AppTheme } from "@/theme/app-theme";
import { Character } from "@/types/character";
import React, { FC } from "react";
import { StyleSheet } from "react-native";
import { Image, Text, View, XStack, YStack } from "tamagui";

interface Props {
  character: Character;
}

const CharacterHeader: FC<Props> = ({ character }) => {
  const theme = useAppTheme();
  const styles = createStyles(theme);
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
        backgroundColor={theme.surface}
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
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  // Header
  header: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  characterName: { color: theme.text, fontSize: 20, fontWeight: "700" },
  elementBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  metaText: { color: theme.textMuted, fontSize: 13 },
  talentText: { color: theme.accent, fontSize: 12 },
  elementText: { color: "#fff", fontSize: 11, fontWeight: "700" },
});

export default CharacterHeader;

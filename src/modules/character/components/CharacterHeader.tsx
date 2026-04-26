import { ELEMENT_COLOR } from "@/constants/color";
import { Character } from "@/types/character";
import React, { FC } from "react";
import { Image, Text, View } from "react-native";

interface Props {
  character: Character;
}

const CharacterHeader: FC<Props> = ({ character }) => {
  const elementColor = ELEMENT_COLOR[character.element] ?? "#c9a227";

  return (
    <View className="flex-row gap-4 rounded-xl border border-paimon-border bg-paimon-surface p-4 dark:border-paimon-dark-border dark:bg-paimon-dark-surface">
      <Image
        source={{ uri: character.iconUrl }}
        className="h-20 w-20 rounded-full border-2 bg-paimon-surface dark:bg-paimon-dark-surface"
        style={{ borderColor: elementColor }}
      />
      <View className="flex-1 justify-center gap-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-xl font-bold text-paimon-text dark:text-paimon-dark-text">
            {character.name}
          </Text>
          <View
            className="rounded-md px-2 py-0.5"
            style={{ backgroundColor: elementColor }}
          >
            <Text className="text-xs font-bold text-white">
              {character.element}
            </Text>
          </View>
        </View>
        <Text className="text-xs text-paimon-soft dark:text-paimon-dark-soft">
          Lv.{character.level} · A{character.ascension}
        </Text>
        <View className="flex-row gap-3">
          <Text className="text-xs text-paimon-soft dark:text-paimon-dark-soft">
            C{character.constellation}
          </Text>
          <Text className="text-xs text-paimon-soft dark:text-paimon-dark-soft">
            Friendship: {character.friendship}
          </Text>
        </View>
        <View className="mt-2 flex-row flex-wrap gap-1">
          <Text className="text-xs text-paimon-accent dark:text-paimon-dark-accent">
            Normal Attack: {character.talents.normal} ·
          </Text>
          <Text className="text-xs text-paimon-accent dark:text-paimon-dark-accent">
            Skill: {character.talents.skill} ·
          </Text>
          <Text className="text-xs text-paimon-accent dark:text-paimon-dark-accent">
            Burst: {character.talents.burst}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default CharacterHeader;

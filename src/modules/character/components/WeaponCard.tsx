import { Weapon } from "@/types/weapon";
import React, { FC } from "react";
import { Image, Text, View } from "react-native";

interface Props {
  weapon: Weapon;
}

const WeaponCard: FC<Props> = ({ weapon }) => {
  const isWeaponStatPercentage = weapon.subStat
    ? weapon.subStat.stat.includes("%")
    : false;

  return (
    <View className="rounded-xl border border-paimon-border bg-paimon-surface p-3.5 dark:border-paimon-dark-border dark:bg-paimon-dark-surface">
      <View className="flex-row items-center gap-3">
        <Image
          source={{ uri: weapon.iconUrl }}
          className="h-16 w-16 rounded-lg bg-paimon-raised dark:bg-paimon-dark-raised"
        />
        <View className="flex-1 flex-row items-start justify-between">
          <View className="flex-1 gap-1">
            <Text className="text-[15px] font-semibold text-paimon-text dark:text-paimon-dark-text">
              {weapon.name}
            </Text>
            <Text className="mt-0.5 text-xs text-paimon-subtle dark:text-paimon-dark-subtle">
              Lv.{weapon.level} · R{weapon.refinement} · {weapon.type}
            </Text>
          </View>
          <View className="items-end gap-1">
            <Text className="text-sm font-semibold text-paimon-accent dark:text-paimon-dark-accent">
              ATK: {weapon.baseATK}
            </Text>
            {weapon.subStat && (
              <Text className="text-xs text-paimon-soft dark:text-paimon-dark-soft">
                {weapon.subStat.stat}: {weapon.subStat.value}
                {isWeaponStatPercentage && "%"}
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default WeaponCard;

import { Character } from "@/types/character";
import React, { FC } from "react";
import { Text, View } from "react-native";

interface Props {
  character: Character;
}

const StatsGrid: FC<Props> = ({ character }) => {
  const { totalStats } = character;
  const rows = [
    { label: "HP", value: Math.round(totalStats.hp).toLocaleString() },
    { label: "ATK", value: Math.round(totalStats.atk).toLocaleString() },
    { label: "DEF", value: Math.round(totalStats.def).toLocaleString() },
    { label: "EM", value: Math.round(totalStats.em).toLocaleString() },
    { label: "ER%", value: `${(totalStats.er * 100).toFixed(1)}%` },
    { label: "CR%", value: `${(totalStats.cr * 100).toFixed(1)}%` },
    { label: "CD%", value: `${(totalStats.cd * 100).toFixed(1)}%` },
    ...(totalStats.elementalDmgBonus
      ? [
          {
            label: "DMG%",
            value: `${(totalStats.elementalDmgBonus * 100).toFixed(1)}%`,
          },
        ]
      : []),
    ...(totalStats.healingBonus
      ? [
          {
            label: "Heal%",
            value: `${(totalStats.healingBonus * 100).toFixed(1)}%`,
          },
        ]
      : []),
  ];

  return (
    <View className="rounded-xl border border-paimon-border bg-paimon-surface px-3.5 py-1 dark:border-paimon-dark-border dark:bg-paimon-dark-surface">
      {rows.map((row) => (
        <View
          key={row.label}
          className="flex-row justify-between border-b border-paimon-border py-1.5 dark:border-paimon-dark-border"
        >
          <Text className="text-xs text-paimon-subtle dark:text-paimon-dark-subtle">
            {row.label}
          </Text>
          <Text className="text-xs font-semibold text-paimon-text dark:text-paimon-dark-text">
            {row.value}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default StatsGrid;

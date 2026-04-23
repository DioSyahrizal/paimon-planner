import { Character } from "@/types/character";
import React, { FC } from "react";
import { StyleSheet } from "react-native";
import { Text, View, XStack } from "tamagui";

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
    <View style={styles.statsGrid}>
      {rows.map((row) => (
        <XStack
          key={row.label}
          justifyContent="space-between"
          paddingVertical={6}
          borderBottomWidth={1}
          borderBottomColor="#2a2a2a"
        >
          <Text style={styles.statLabel}>{row.label}</Text>
          <Text style={styles.statValue}>{row.value}</Text>
        </XStack>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  // Stats
  statsGrid: {
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  statLabel: { color: "#888", fontSize: 13 },
  statValue: { color: "#fff", fontSize: 13, fontWeight: "600" },
});

export default StatsGrid;

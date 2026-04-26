import { useAppTheme, type AppTheme } from "@/theme/app-theme";
import { Character } from "@/types/character";
import React, { FC } from "react";
import { StyleSheet } from "react-native";
import { Text, View, XStack } from "tamagui";

interface Props {
  character: Character;
}

const StatsGrid: FC<Props> = ({ character }) => {
  const theme = useAppTheme();
  const styles = createStyles(theme);
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
          borderBottomColor={theme.border}
        >
          <Text style={styles.statLabel}>{row.label}</Text>
          <Text style={styles.statValue}>{row.value}</Text>
        </XStack>
      ))}
    </View>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  // Stats
  statsGrid: {
    backgroundColor: theme.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: theme.border,
  },
  statLabel: { color: theme.textSubtle, fontSize: 13 },
  statValue: { color: theme.text, fontSize: 13, fontWeight: "600" },
});

export default StatsGrid;

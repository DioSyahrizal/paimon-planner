import { useAppTheme, type AppTheme } from "@/theme/app-theme";
import React, { FC } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Text, XStack } from "tamagui";
import { CharacterTab } from "..";

interface Props {
  active: CharacterTab;
  onChange: (tab: CharacterTab) => void;
}

const TabToggle: FC<Props> = ({ active, onChange }) => {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const tabs: { key: CharacterTab; label: string }[] = [
    { key: "my-build", label: "My Build" },
    { key: "recommended", label: "Recommended" },
    { key: "compare", label: "Compare" },
  ];

  return (
    <XStack style={styles.tabRow}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, active === tab.key && styles.tabActive]}
          onPress={() => onChange(tab.key)}
        >
          <Text
            style={[styles.tabText, active === tab.key && styles.tabTextActive]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </XStack>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  // Tabs
  tabRow: {
    backgroundColor: theme.surface,
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  tabActive: { backgroundColor: theme.accent },
  tabText: { color: theme.textSubtle, fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: theme.accentText },
});

export default TabToggle;

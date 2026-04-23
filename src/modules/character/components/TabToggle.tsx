import React, { FC } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Text, XStack } from "tamagui";
import { CharacterTab } from "..";

interface Props {
  active: CharacterTab;
  onChange: (tab: CharacterTab) => void;
}

const TabToggle: FC<Props> = ({ active, onChange }) => {
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

const styles = StyleSheet.create({
  // Tabs
  tabRow: {
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  tabActive: { backgroundColor: "#c9a227" },
  tabText: { color: "#888", fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: "#000" },
});

export default TabToggle;

import { cn } from "@/lib/cn";
import React, { FC } from "react";
import { Text, TouchableOpacity, View } from "react-native";
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
    <View className="flex-row rounded-xl border border-paimon-border bg-paimon-surface p-1 dark:border-paimon-dark-border dark:bg-paimon-dark-surface">
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          className={cn(
            "flex-1 items-center rounded-lg py-2",
            active === tab.key &&
              "bg-paimon-accent dark:bg-paimon-dark-accent",
          )}
          onPress={() => onChange(tab.key)}
        >
          <Text
            className={cn(
              "text-xs font-semibold text-paimon-subtle dark:text-paimon-dark-subtle",
              active === tab.key && "text-white dark:text-black",
            )}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default TabToggle;

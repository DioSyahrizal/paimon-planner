import { cn } from "@/lib/cn";
import type { RecommendedBuild } from "@/types/build";
import React, { FC } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface Props {
  builds: RecommendedBuild[];
  selectedRole: string;
  onChange: (role: string) => void;
}

const BuildRolePicker: FC<Props> = ({ builds, selectedRole, onChange }) => {
  if (builds.length <= 1) {
    return null;
  }

  return (
    <View className="gap-2">
      <Text className="text-xs font-bold uppercase tracking-wide text-paimon-accent dark:text-paimon-dark-accent">
        Build Role
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {builds.map((build) => {
          const isActive = build.role === selectedRole;

          return (
            <TouchableOpacity
              key={`${build.characterId}-${build.role}`}
              className={cn(
                "rounded-full border px-3 py-2",
                isActive
                  ? "border-paimon-accent bg-paimon-accent dark:border-paimon-dark-accent dark:bg-paimon-dark-accent"
                  : "border-paimon-border bg-paimon-surface dark:border-paimon-dark-border dark:bg-paimon-dark-surface",
              )}
              onPress={() => onChange(build.role)}
            >
              <Text
                className={cn(
                  "text-xs font-semibold",
                  isActive
                    ? "text-white dark:text-black"
                    : "text-paimon-text dark:text-paimon-dark-text",
                )}
              >
                {build.role}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default BuildRolePicker;

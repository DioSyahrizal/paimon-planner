import { ChevronLeft } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import React, { FC } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "@/theme/app-theme";

interface Props {
  title: string;
  subtitle?: string;
  topInset: number;
}

const CharacterNavBar: FC<Props> = ({ title, subtitle, topInset }) => {
  const router = useRouter();
  const theme = useAppTheme();

  return (
    <View
      className="border-b border-paimon-border bg-paimon-surface px-4 pb-3 dark:border-paimon-dark-border dark:bg-paimon-dark-surface"
      style={{ paddingTop: topInset + 8 }}
    >
      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          accessibilityLabel="Go back"
          activeOpacity={0.8}
          className="h-10 w-10 items-center justify-center rounded-full border border-paimon-border bg-paimon-bg dark:border-paimon-dark-border dark:bg-paimon-dark-bg"
          onPress={() => router.back()}
        >
          <ChevronLeft color={theme.text} size={20} />
        </TouchableOpacity>

        <View className="flex-1">
          <Text
            className="text-lg font-bold text-paimon-text dark:text-paimon-dark-text"
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              className="mt-0.5 text-xs text-paimon-subtle dark:text-paimon-dark-subtle"
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
};

export default CharacterNavBar;

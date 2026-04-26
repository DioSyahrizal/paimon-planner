import { useAppTheme, type AppTheme } from "@/theme/app-theme";
import { Weapon } from "@/types/weapon";
import React, { FC } from "react";
import { StyleSheet } from "react-native";
import { Image, Text, View, XStack, YStack } from "tamagui";

interface Props {
  weapon: Weapon;
}

const WeaponCard: FC<Props> = ({ weapon }) => {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const isWeaponStatPercentage = weapon.subStat
    ? weapon.subStat.stat.includes("%")
    : false;

  return (
    <View style={styles.weaponCard}>
      <XStack gap="$3" alignItems="center">
        <Image
          src={weapon.iconUrl}
          width={64}
          height={64}
          borderRadius={8}
          backgroundColor={theme.raised}
        />
        <XStack flex={1} justifyContent="space-between" alignItems="flex-start">
          <YStack flex={1} gap="$1">
            <Text style={styles.weaponName}>{weapon.name}</Text>
            <Text style={styles.weaponMeta}>
              Lv.{weapon.level} · R{weapon.refinement} · {weapon.type}
            </Text>
          </YStack>
          <YStack alignItems="flex-end" gap="$1">
            <Text style={styles.weaponStat}>ATK: {weapon.baseATK}</Text>
            {weapon.subStat && (
              <Text style={styles.weaponSubStat}>
                {weapon.subStat.stat}: {weapon.subStat.value}
                {isWeaponStatPercentage && "%"}
              </Text>
            )}
          </YStack>
        </XStack>
      </XStack>
    </View>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  weaponCard: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.border,
  },
  weaponName: { color: theme.text, fontSize: 15, fontWeight: "600" },
  weaponMeta: { color: theme.textSubtle, fontSize: 12, marginTop: 2 },
  weaponStat: { color: theme.accent, fontSize: 14, fontWeight: "600" },
  weaponSubStat: { color: theme.textMuted, fontSize: 12 },
});

export default WeaponCard;

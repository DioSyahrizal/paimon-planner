import { getBuildsForCharacter } from "@/lib/recommended-builds";
import { useAppTheme, type AppTheme } from "@/theme/app-theme";
import type { RecommendedBuild, WeaponRecommendation } from "@/types/build";
import React, { FC } from "react";
import { StyleSheet } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";

type RecommendedStyles = ReturnType<typeof createStyles>;

interface Props {
  characterId: string;
}

const TIER_COLORS: Record<string, string> = {
  S: "#c9a227",
  A: "#9b8fc7",
  B: "#6b8fa3",
};

const TierBadge: FC<{ tier: string; styles: RecommendedStyles }> = ({ tier, styles }) => (
  <View style={[styles.tierBadge, { borderColor: TIER_COLORS[tier] ?? "#555" }]}>
    <Text style={[styles.tierText, { color: TIER_COLORS[tier] ?? "#555" }]}>
      {tier}
    </Text>
  </View>
);

const SectionLabel: FC<{ label: string; styles: RecommendedStyles }> = ({ label, styles }) => (
  <Text style={styles.sectionLabel}>{label}</Text>
);

const WeaponRow: FC<{ weapon: WeaponRecommendation; styles: RecommendedStyles }> = ({ weapon, styles }) => (
  <XStack style={styles.rowCard} alignItems="center" justifyContent="space-between">
    <YStack flex={1} gap="$1">
      <Text style={styles.weaponName}>{weapon.weaponName}</Text>
      {weapon.refinement && (
        <Text style={styles.weaponMeta}>{weapon.refinement}</Text>
      )}
      {weapon.note && <Text style={styles.noteText}>{weapon.note}</Text>}
    </YStack>
    <TierBadge tier={weapon.tier} styles={styles} />
  </XStack>
);

const RecommendedTab: FC<Props> = ({ characterId }) => {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const builds = getBuildsForCharacter(characterId);

  if (builds.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No recommended builds available.</Text>
        <Text style={styles.emptySubText}>
          Check back after we add data for this character.
        </Text>
      </View>
    );
  }

  return (
    <YStack gap="$4">
      {builds.map((build: RecommendedBuild) => (
        <YStack key={`${build.characterId}-${build.role}`} gap="$3">
          <XStack alignItems="center" justifyContent="space-between">
            <Text style={styles.roleTitle}>{build.role}</Text>
            <Text style={styles.sourceLabel}>Source: {build.source}</Text>
          </XStack>

          {/* Artifact Sets */}
          <SectionLabel label="Artifact Sets" styles={styles} />
          {build.artifactSets.map((option, i) => (
            <XStack key={i} style={styles.rowCard} alignItems="center" justifyContent="space-between">
              <YStack flex={1} gap="$1">
                <Text style={styles.artifactSetName}>
                  {option.sets.map((s) => `${s.setName} ${s.pieces}pc`).join(" + ")}
                </Text>
                <Text style={styles.weaponMeta}>{option.label}</Text>
              </YStack>
              <TierBadge tier={option.tier} styles={styles} />
            </XStack>
          ))}

          {/* Main Stats */}
          <SectionLabel label="Main Stats" styles={styles} />
          <View style={styles.rowCard}>
            {(
              [
                { slot: "Sands", stats: build.mainStats.sands },
                { slot: "Goblet", stats: build.mainStats.goblet },
                { slot: "Circlet", stats: build.mainStats.circlet },
              ] as const
            ).map(({ slot, stats }) => (
              <XStack key={slot} justifyContent="space-between" paddingVertical={4}>
                <Text style={styles.slotLabel}>{slot}</Text>
                <Text style={styles.statValue}>{stats.join(" / ")}</Text>
              </XStack>
            ))}
          </View>

          {/* Substat Priority */}
          <SectionLabel label="Substat Priority" styles={styles} />
          <View style={styles.rowCard}>
            <XStack flexWrap="wrap" gap="$2">
              {build.substatPriority.map((stat, i) => (
                <XStack key={stat} alignItems="center" gap="$1">
                  <Text style={styles.priorityIndex}>{i + 1}.</Text>
                  <Text style={styles.statValue}>{stat}</Text>
                </XStack>
              ))}
            </XStack>
          </View>

          {/* Goal Stats */}
          {build.goalStats && Object.keys(build.goalStats).length > 0 && (
            <>
              <SectionLabel label="Goal Stats" styles={styles} />
              <View style={styles.rowCard}>
                {Object.entries(build.goalStats).map(([stat, value]) => (
                  <XStack key={stat} justifyContent="space-between" paddingVertical={4}>
                    <Text style={styles.slotLabel}>{stat}</Text>
                    <Text style={styles.goalValue}>{value}{stat.endsWith('%') ? '%' : '+'}</Text>
                  </XStack>
                ))}
              </View>
            </>
          )}

          {/* Weapons */}
          <SectionLabel label="Weapons" styles={styles} />
          {build.weapons.map((weapon) => (
            <WeaponRow key={weapon.weaponId} weapon={weapon} styles={styles} />
          ))}

          {/* Talent Priority */}
          {build.talentPriority && build.talentPriority.length > 0 && (
            <>
              <SectionLabel label="Talent Priority" styles={styles} />
              <View style={styles.rowCard}>
                <XStack gap="$3">
                  {build.talentPriority.map((talent, i) => (
                    <XStack key={talent} alignItems="center" gap="$1">
                      <Text style={styles.priorityIndex}>{i + 1}.</Text>
                      <Text style={styles.statValue}>
                        {talent.charAt(0).toUpperCase() + talent.slice(1)}
                      </Text>
                    </XStack>
                  ))}
                </XStack>
              </View>
            </>
          )}

          {/* Notes */}
          {build.notes && (
            <>
              <SectionLabel label="Notes" styles={styles} />
              <View style={styles.rowCard}>
                <Text style={styles.noteText}>{build.notes}</Text>
              </View>
            </>
          )}
        </YStack>
      ))}
    </YStack>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  emptyContainer: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    gap: 8,
  },
  emptyText: { color: theme.text, fontSize: 15, fontWeight: "600", textAlign: "center" },
  emptySubText: { color: theme.textSubtle, fontSize: 13, textAlign: "center" },

  sectionLabel: {
    color: theme.accent,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 4,
  },
  roleTitle: { color: theme.text, fontSize: 16, fontWeight: "700" },
  sourceLabel: { color: theme.textSubtle, fontSize: 11 },

  rowCard: {
    backgroundColor: theme.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },

  tierBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  tierText: { fontSize: 12, fontWeight: "700" },

  artifactSetName: { color: theme.text, fontSize: 14, fontWeight: "600" },
  weaponName: { color: theme.text, fontSize: 14, fontWeight: "600" },
  weaponMeta: { color: theme.textSubtle, fontSize: 12 },

  slotLabel: { color: theme.textSubtle, fontSize: 13 },
  statValue: { color: theme.text, fontSize: 13, fontWeight: "600" },
  goalValue: { color: theme.accent, fontSize: 13, fontWeight: "700" },
  priorityIndex: { color: theme.textSubtle, fontSize: 12 },
  noteText: { color: theme.textMuted, fontSize: 13, lineHeight: 19 },
});

export default RecommendedTab;

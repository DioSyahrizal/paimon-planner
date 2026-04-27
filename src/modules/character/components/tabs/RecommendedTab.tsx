import {
  getBuildsForCharacter,
  resolveSelectedBuild,
} from "@/lib/recommended-builds";
import type { RecommendedBuild, WeaponRecommendation } from "@/types/build";
import React, { FC, useMemo } from "react";
import { Text, View } from "react-native";

interface Props {
  characterId: string;
  selectedRole?: string;
}

const TIER_COLORS: Record<string, string> = {
  S: "#c9a227",
  A: "#9b8fc7",
  B: "#6b8fa3",
};

const TierBadge: FC<{ tier: string }> = ({ tier }) => (
  <View
    className="ml-2 rounded-md border px-2 py-0.5"
    style={{ borderColor: TIER_COLORS[tier] ?? "#555" }}
  >
    <Text
      className="text-xs font-bold"
      style={{ color: TIER_COLORS[tier] ?? "#555" }}
    >
      {tier}
    </Text>
  </View>
);

const SectionLabel: FC<{ label: string }> = ({ label }) => (
  <Text className="mt-1 text-xs font-bold uppercase tracking-wide text-paimon-accent dark:text-paimon-dark-accent">
    {label}
  </Text>
);

const WeaponRow: FC<{ weapon: WeaponRecommendation }> = ({ weapon }) => (
  <View className="flex-row items-center justify-between rounded-xl border border-paimon-border bg-paimon-surface p-3 dark:border-paimon-dark-border dark:bg-paimon-dark-surface">
    <View className="flex-1 gap-1">
      <Text className="text-sm font-semibold text-paimon-text dark:text-paimon-dark-text">
        {weapon.weaponName}
      </Text>
      {weapon.refinement && (
        <Text className="text-xs text-paimon-subtle dark:text-paimon-dark-subtle">
          {weapon.refinement}
        </Text>
      )}
      {weapon.note && (
        <Text className="text-xs leading-5 text-paimon-soft dark:text-paimon-dark-soft">
          {weapon.note}
        </Text>
      )}
    </View>
    <TierBadge tier={weapon.tier} />
  </View>
);

const RecommendedTab: FC<Props> = ({ characterId, selectedRole }) => {
  const builds = useMemo(() => getBuildsForCharacter(characterId), [characterId]);
  const selectedBuild = useMemo(
    () => resolveSelectedBuild(characterId, selectedRole),
    [characterId, selectedRole],
  );

  if (builds.length === 0) {
    return (
      <View className="items-center gap-2 rounded-xl border border-paimon-border bg-paimon-surface p-8 dark:border-paimon-dark-border dark:bg-paimon-dark-surface">
        <Text className="text-center text-[15px] font-semibold text-paimon-text dark:text-paimon-dark-text">
          No recommended builds available.
        </Text>
        <Text className="text-center text-xs text-paimon-subtle dark:text-paimon-dark-subtle">
          Check back after we add data for this character.
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-4">
      {(selectedBuild ? [selectedBuild] : []).map((build: RecommendedBuild) => (
        <View key={`${build.characterId}-${build.role}`} className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-bold text-paimon-text dark:text-paimon-dark-text">
              {build.role}
            </Text>
            <Text className="text-xs text-paimon-subtle dark:text-paimon-dark-subtle">
              Source: {build.source}
            </Text>
          </View>

          <SectionLabel label="Artifact Sets" />
          {build.artifactSets.map((option, i) => (
            <View
              key={i}
              className="flex-row items-center justify-between rounded-xl border border-paimon-border bg-paimon-surface p-3 dark:border-paimon-dark-border dark:bg-paimon-dark-surface"
            >
              <View className="flex-1 gap-1">
                <Text className="text-sm font-semibold text-paimon-text dark:text-paimon-dark-text">
                  {option.sets
                    .map((s) => `${s.setName} ${s.pieces}pc`)
                    .join(" + ")}
                </Text>
                <Text className="text-xs text-paimon-subtle dark:text-paimon-dark-subtle">
                  {option.label}
                </Text>
              </View>
              <TierBadge tier={option.tier} />
            </View>
          ))}

          <SectionLabel label="Main Stats" />
          <View className="rounded-xl border border-paimon-border bg-paimon-surface p-3 dark:border-paimon-dark-border dark:bg-paimon-dark-surface">
            {(
              [
                { slot: "Sands", stats: build.mainStats.sands },
                { slot: "Goblet", stats: build.mainStats.goblet },
                { slot: "Circlet", stats: build.mainStats.circlet },
              ] as const
            ).map(({ slot, stats }) => (
              <View key={slot} className="flex-row justify-between py-1">
                <Text className="text-xs text-paimon-subtle dark:text-paimon-dark-subtle">
                  {slot}
                </Text>
                <Text className="text-xs font-semibold text-paimon-text dark:text-paimon-dark-text">
                  {stats.join(" / ")}
                </Text>
              </View>
            ))}
          </View>

          <SectionLabel label="Substat Priority" />
          <View className="rounded-xl border border-paimon-border bg-paimon-surface p-3 dark:border-paimon-dark-border dark:bg-paimon-dark-surface">
            <View className="flex-row flex-wrap gap-2">
              {build.substatPriority.map((stat, i) => (
                <View key={stat} className="flex-row items-center gap-1">
                  <Text className="text-xs text-paimon-subtle dark:text-paimon-dark-subtle">
                    {i + 1}.
                  </Text>
                  <Text className="text-xs font-semibold text-paimon-text dark:text-paimon-dark-text">
                    {stat}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {build.goalStats && Object.keys(build.goalStats).length > 0 && (
            <>
              <SectionLabel label="Goal Stats" />
              <View className="rounded-xl border border-paimon-border bg-paimon-surface p-3 dark:border-paimon-dark-border dark:bg-paimon-dark-surface">
                {Object.entries(build.goalStats).map(([stat, value]) => (
                  <View key={stat} className="flex-row justify-between py-1">
                    <Text className="text-xs text-paimon-subtle dark:text-paimon-dark-subtle">
                      {stat}
                    </Text>
                    <Text className="text-xs font-bold text-paimon-accent dark:text-paimon-dark-accent">
                      {value}
                      {stat.endsWith("%") ? "%" : "+"}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}

          <SectionLabel label="Weapons" />
          {build.weapons.map((weapon) => (
            <WeaponRow key={weapon.weaponId} weapon={weapon} />
          ))}

          {build.talentPriority && build.talentPriority.length > 0 && (
            <>
              <SectionLabel label="Talent Priority" />
              <View className="rounded-xl border border-paimon-border bg-paimon-surface p-3 dark:border-paimon-dark-border dark:bg-paimon-dark-surface">
                <View className="flex-row flex-wrap gap-3">
                  {build.talentPriority.map((talent, i) => (
                    <View key={talent} className="flex-row items-center gap-1">
                      <Text className="text-xs text-paimon-subtle dark:text-paimon-dark-subtle">
                        {i + 1}.
                      </Text>
                      <Text className="text-xs font-semibold text-paimon-text dark:text-paimon-dark-text">
                        {talent.charAt(0).toUpperCase() + talent.slice(1)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}

          {build.notes && (
            <>
              <SectionLabel label="Notes" />
              <View className="rounded-xl border border-paimon-border bg-paimon-surface p-3 dark:border-paimon-dark-border dark:bg-paimon-dark-surface">
                <Text className="text-xs leading-5 text-paimon-soft dark:text-paimon-dark-soft">
                  {build.notes}
                </Text>
              </View>
            </>
          )}
        </View>
      ))}
    </View>
  );
};

export default RecommendedTab;

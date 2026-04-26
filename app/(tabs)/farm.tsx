import { useEnkaUser } from "@/hooks/useEnkaUser";
import {
  getAvailableDomainsForDay,
  getCharacterDomains,
  getCharacterFarmData,
  getFarmTargetsForCharacter,
  getNextAscensionStage,
  getStageMaterialsWithSources,
} from "@/lib/farm-data";
import { useFarmStore } from "@/store/farm-store";
import { useUserStore } from "@/store/user-store";
import { useAppTheme, type AppTheme } from "@/theme/app-theme";
import type { Character } from "@/types/character";
import type { DayOfWeek, FarmSource, ResolvedFarmTarget } from "@/types/farm";
import { useEffect } from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image, Spinner, Text, View, XStack, YStack } from "tamagui";

type FarmStyles = ReturnType<typeof createStyles>;

const DAY_LABELS: DayOfWeek[] = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

const DEV_MOCK_DAY: DayOfWeek | null = null; // e.g. "Mon" to test Monday

function getToday(): DayOfWeek {
  return DEV_MOCK_DAY ?? DAY_LABELS[new Date().getDay()];
}

function getDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDayList(days?: DayOfWeek[]): string {
  if (!days?.length) {
    return "Always available";
  }

  return days.join(" / ");
}

function getCategoryBadge(source: FarmSource): string {
  switch (source.category) {
    case "artifact_domain":
      return "ART";
    case "talent_domain":
      return "TAL";
    case "normal_boss":
      return "BOSS";
    case "weekly_boss":
      return "WKLY";
    case "enemy":
      return "ENM";
    case "local_specialty":
      return "LOC";
    default:
      return "MAT";
  }
}

function getMaterialBadge(name: string): string {
  const words = name.split(" ");

  if (words.length === 1) {
    return words[0].slice(0, 3).toUpperCase();
  }

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

interface DailyChecklistItem {
  id: string;
  label: string;
}

function getDailyChecklistItems(
  characterId: string,
  targets: ResolvedFarmTarget[],
): DailyChecklistItem[] {
  const uniqueItems = new Map<string, DailyChecklistItem>();

  for (const target of targets) {
    if (!target.availableToday || !target.source) {
      continue;
    }

    const id = `${characterId}:${target.phase}:${target.materialName}:${target.source.id}`;

    if (!uniqueItems.has(id)) {
      uniqueItems.set(id, {
        id,
        label: `${target.materialName} - ${target.source.name}`,
      });
    }
  }

  return Array.from(uniqueItems.values());
}

function DomainCard({
  source,
  today,
  styles,
}: {
  source: FarmSource;
  today: DayOfWeek;
  styles: FarmStyles;
}) {
  return (
    <View style={styles.domainCard}>
      <XStack style={styles.domainHeader}>
        <XStack style={styles.domainTitleRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>
              {getCategoryBadge(source)}
            </Text>
          </View>
          <Text style={styles.domainName}>{source.name}</Text>
        </XStack>
        <XStack style={styles.domainHeaderRight}>
          <View style={styles.dayChip}>
            <Text style={styles.dayChipText}>{today}</Text>
          </View>
        </XStack>
      </XStack>
      <Text style={styles.domainMeta}>
        {source.region} · {source.location}
      </Text>
      <Text style={styles.domainDrops}>Drops: {source.drops.join(", ")}</Text>
      <Text style={styles.domainSchedule}>
        {formatDayList(source.availableDays)}
      </Text>
    </View>
  );
}

function CharacterFarmCard({
  character,
  today,
  completedIds,
  onToggleTask,
  styles,
}: {
  character: Character;
  today: DayOfWeek;
  completedIds: string[];
  onToggleTask: (taskId: string) => void;
  styles: FarmStyles;
}) {
  const farmData = getCharacterFarmData(character.id);
  const nextStage = getNextAscensionStage(character.id, character.level);
  const stageMaterials = getStageMaterialsWithSources(
    character.id,
    character.level,
  );
  const farmTargets = getFarmTargetsForCharacter(character.id, today);
  const todayChecklistItems = getDailyChecklistItems(character.id, farmTargets);
  const relatedDomains = getCharacterDomains(character.id);
  const portraitUrl = character.iconUrl;

  if (!farmData) {
    return null;
  }

  return (
    <View style={styles.characterCard}>
      <XStack style={styles.characterHeader}>
        <XStack style={styles.characterIdentity}>
          {portraitUrl ? (
            <Image src={portraitUrl} width={56} height={56} />
          ) : (
            <View style={styles.characterPortraitFallback}>
              <Text style={styles.characterPortraitFallbackText}>
                {character.name.slice(0, 1).toUpperCase()}
              </Text>
            </View>
          )}
          <YStack style={styles.characterHeaderCopy}>
            <Text style={styles.characterName}>{character.name}</Text>
            <Text style={styles.characterMeta}>
              Lv.{character.level} · C{character.constellation} · Friendship{" "}
              {character.friendship}
            </Text>
          </YStack>
        </XStack>
        <View style={styles.progressBadge}>
          <Text style={styles.progressBadgeText}>
            {nextStage
              ? `Next: ${nextStage.fromLevel}-${nextStage.toLevel}`
              : "Ascended"}
          </Text>
        </View>
      </XStack>

      {nextStage ? (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>Next ascension materials</Text>
          {stageMaterials.map((material) => (
            <XStack
              key={`${character.id}-${material.name}-${material.amount}`}
              style={styles.materialRow}
            >
              <View style={styles.materialBadge}>
                <Text style={styles.materialBadgeText}>
                  {getMaterialBadge(material.name)}
                </Text>
              </View>
              <YStack style={styles.materialCopy}>
                <Text style={styles.materialName}>
                  {material.name} x{material.amount}
                </Text>
                <Text style={styles.materialSource}>
                  {material.source ? material.source.name : "Boss / conversion"}
                </Text>
              </YStack>
            </XStack>
          ))}
        </View>
      ) : (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>Ascension</Text>
          <Text style={styles.helperText}>
            This character is already at Max Ascension
          </Text>
        </View>
      )}

      <View style={styles.sectionBlock}>
        <Text style={styles.sectionLabel}>Today&apos;s must-do</Text>
        {todayChecklistItems.length > 0 ? (
          todayChecklistItems.map((item) => {
            const isCompleted = completedIds.includes(item.id);

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                onPress={() => onToggleTask(item.id)}
              >
                <XStack
                  style={[
                    styles.todoItem,
                    isCompleted && styles.todoItemCompleted,
                  ]}
                >
                  <View
                    style={[
                      styles.todoCheckbox,
                      isCompleted && styles.todoCheckboxCompleted,
                    ]}
                  >
                    <Text style={styles.todoCheckboxText}>
                      {isCompleted ? "✓" : ""}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.todoLine,
                      isCompleted && styles.todoLineCompleted,
                    ]}
                  >
                    {item.label}
                  </Text>
                </XStack>
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={styles.helperText}>
            No day-locked domain target for today. Bosses and routes are still
            open.
          </Text>
        )}
      </View>

      <View style={styles.sectionBlock}>
        <Text style={styles.sectionLabel}>Tracked sources</Text>
        {relatedDomains.map((domain) => (
          <Text key={`${character.id}-${domain.id}`} style={styles.helperText}>
            {domain.name} · {formatDayList(domain.availableDays)}
          </Text>
        ))}
      </View>
    </View>
  );
}

export default function FarmScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { top } = useSafeAreaInsets();
  const uid = useUserStore((state) => state.uid);
  const isHydrated = useUserStore((state) => state.isHydrated);
  const today = getToday();
  const dateKey = getDateKey();
  const farmChecklist = useFarmStore((state) => state.checklist);
  const farmStoreHydrated = useFarmStore((state) => state.isHydrated);
  const hydrateFarmStore = useFarmStore((state) => state.hydrate);
  const resetForDate = useFarmStore((state) => state.resetForDate);
  const toggleCompleted = useFarmStore((state) => state.toggleCompleted);
  const { data, isLoading } = useEnkaUser(uid);

  const trackedCharacters = (data?.characters ?? []).filter((character) => {
    if (!getCharacterFarmData(character.id)) return false;
    return getFarmTargetsForCharacter(character.id, today).some(
      (t) => t.availableToday && t.source?.availableDays != null,
    );
  });

  const todayDomains = getAvailableDomainsForDay(today).filter((source) =>
    ["artifact_domain", "talent_domain"].includes(source.category),
  );

  useEffect(() => {
    hydrateFarmStore(dateKey);
  }, [dateKey, hydrateFarmStore]);

  if (!isHydrated || !farmStoreHydrated) {
    return (
      <View style={styles.centerContainer}>
        <Spinner size="large" color="$yellow9" />
      </View>
    );
  }

  if (!uid) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.title}>Farm Planner</Text>
        <Text style={styles.subtitle}>
          Add your UID in Settings to turn this into a day-by-day farming
          checklist.
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Spinner size="large" color="$yellow9" />
        <Text style={styles.loadingText}>
          Loading your tracked characters...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: top }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Farm Planner</Text>
        <Text style={styles.subtitle}>
          Today is {today}. This view combines your showcased tracked
          characters, their next ascension range, and the domains that are open
          right now.
        </Text>
      </View>

      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>Today&apos;s domains</Text>
        {todayDomains.map((source) => (
          <DomainCard key={source.id} source={source} today={today} styles={styles} />
        ))}
      </View>

      <View style={styles.sectionBlock}>
        <XStack style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Tracked characters</Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => resetForDate(dateKey)}
            style={styles.resetButton}
          >
            <Text style={styles.resetButtonText}>Reset today</Text>
          </TouchableOpacity>
        </XStack>
        {trackedCharacters.length > 0 ? (
          trackedCharacters.map((character) => (
            <CharacterFarmCard
              key={character.id}
              character={character}
              today={today}
              completedIds={farmChecklist.completedIds}
              onToggleTask={toggleCompleted}
              styles={styles}
            />
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              No tracked farm characters in showcase
            </Text>
            <Text style={styles.helperText}>
              Put curated characters like Chasca, Zibai, or Nahida in your Enka
              showcase to get level-aware farm planning.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { padding: 16, paddingBottom: 32, gap: 18 },
  centerContainer: {
    flex: 1,
    backgroundColor: theme.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  header: { gap: 6 },
  title: { color: theme.text, fontSize: 24, fontWeight: "700" },
  subtitle: { color: theme.textSubtle, fontSize: 14, lineHeight: 20 },
  loadingText: { color: theme.textSubtle, marginTop: 12, fontSize: 14 },
  sectionTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  sectionHeaderRow: {
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  sectionLabel: {
    color: theme.accent,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  sectionBlock: { gap: 10 },
  domainCard: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 14,
  },
  domainHeader: {
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  domainTitleRow: { alignItems: "center", gap: 10, flex: 1 },
  domainHeaderRight: { alignItems: "center" },
  domainName: { color: theme.text, fontSize: 16, fontWeight: "700", flex: 1 },
  categoryBadge: {
    minWidth: 42,
    backgroundColor: theme.infoSoft,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryBadgeText: { color: theme.info, fontSize: 10, fontWeight: "700" },
  dayChip: {
    backgroundColor: theme.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dayChipText: { color: theme.accent, fontSize: 11, fontWeight: "700" },
  domainMeta: { color: theme.textSubtle, fontSize: 12, marginTop: 8 },
  domainDrops: { color: theme.text, fontSize: 13, lineHeight: 18, marginTop: 8 },
  domainSchedule: { color: theme.textSubtle, fontSize: 12, marginTop: 8 },
  characterCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    gap: 14,
  },
  characterHeader: {
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  characterIdentity: { alignItems: "center", gap: 12, flex: 1 },
  characterHeaderCopy: { flex: 1, gap: 4 },
  characterPortraitFallback: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: theme.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  characterPortraitFallbackText: {
    color: theme.accent,
    fontSize: 22,
    fontWeight: "700",
  },
  characterName: { color: theme.text, fontSize: 18, fontWeight: "700" },
  characterMeta: { color: theme.textSubtle, fontSize: 13 },
  progressBadge: {
    backgroundColor: theme.successSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  progressBadgeText: { color: theme.success, fontSize: 11, fontWeight: "700" },
  resetButton: {
    backgroundColor: theme.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  resetButtonText: { color: theme.accent, fontSize: 12, fontWeight: "700" },
  todoItem: {
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: theme.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.border,
  },
  todoItemCompleted: {
    backgroundColor: theme.successSoft,
    borderColor: theme.success,
  },
  todoCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.background,
  },
  todoCheckboxCompleted: {
    backgroundColor: theme.success,
    borderColor: theme.success,
  },
  todoCheckboxText: { color: theme.background, fontSize: 12, fontWeight: "800" },
  materialRow: {
    backgroundColor: theme.surfaceMuted,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 10,
    alignItems: "center",
  },
  materialBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  materialBadgeText: { color: theme.accent, fontSize: 11, fontWeight: "700" },
  materialCopy: { flex: 1 },
  materialName: { color: theme.text, fontSize: 14, fontWeight: "600" },
  materialSource: { color: theme.textSubtle, fontSize: 12, marginTop: 4 },
  todoLine: {
    color: theme.text,
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
    flexShrink: 1,
  },
  todoLineCompleted: {
    color: theme.success,
    textDecorationLine: "line-through",
  },
  helperText: { color: theme.textSubtle, fontSize: 13, lineHeight: 18 },
  emptyCard: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
  },
  emptyTitle: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
});

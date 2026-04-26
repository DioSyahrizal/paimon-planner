import { getEnkaErrorMessage } from "@/api/enka";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  SkeletonList,
} from "@/components/ScreenState";
import { useEnkaUser } from "@/hooks/useEnkaUser";
import { cn } from "@/lib/cn";
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
import type { Character } from "@/types/character";
import type { DayOfWeek, FarmSource, ResolvedFarmTarget } from "@/types/farm";
import { useEffect } from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DAY_LABELS: DayOfWeek[] = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

const DEV_MOCK_DAY: DayOfWeek | null = null;

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
}: {
  source: FarmSource;
  today: DayOfWeek;
}) {
  return (
    <View className="rounded-[14px] border border-paimon-border bg-paimon-surface p-3.5 dark:border-paimon-dark-border dark:bg-paimon-dark-surface">
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1 flex-row items-center gap-2.5">
          <View className="min-w-[42px] items-center justify-center rounded-lg bg-paimon-infoSoft px-2 py-1.5 dark:bg-paimon-dark-infoSoft">
            <Text className="text-xs font-bold text-paimon-info dark:text-paimon-dark-info">
              {getCategoryBadge(source)}
            </Text>
          </View>
          <Text className="flex-1 text-base font-bold text-paimon-text dark:text-paimon-dark-text">
            {source.name}
          </Text>
        </View>
        <View className="rounded-full bg-paimon-accentSoft px-2.5 py-1 dark:bg-paimon-dark-accentSoft">
          <Text className="text-xs font-bold text-paimon-accent dark:text-paimon-dark-accent">
            {today}
          </Text>
        </View>
      </View>
      <Text className="mt-2 text-xs text-paimon-subtle dark:text-paimon-dark-subtle">
        {source.region} · {source.location}
      </Text>
      <Text className="mt-2 text-xs leading-5 text-paimon-text dark:text-paimon-dark-text">
        Drops: {source.drops.join(", ")}
      </Text>
      <Text className="mt-2 text-xs text-paimon-subtle dark:text-paimon-dark-subtle">
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
}: {
  character: Character;
  today: DayOfWeek;
  completedIds: string[];
  onToggleTask: (taskId: string) => void;
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
    <View className="gap-3.5 rounded-2xl border border-paimon-border bg-paimon-surface p-4 dark:border-paimon-dark-border dark:bg-paimon-dark-surface">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 flex-row items-center gap-3">
          {portraitUrl ? (
            <Image source={{ uri: portraitUrl }} className="h-14 w-14" />
          ) : (
            <View className="h-14 w-14 items-center justify-center rounded-[14px] bg-paimon-accentSoft dark:bg-paimon-dark-accentSoft">
              <Text className="text-2xl font-bold text-paimon-accent dark:text-paimon-dark-accent">
                {character.name.slice(0, 1).toUpperCase()}
              </Text>
            </View>
          )}
          <View className="flex-1 gap-1">
            <Text className="text-lg font-bold text-paimon-text dark:text-paimon-dark-text">
              {character.name}
            </Text>
            <Text className="text-xs text-paimon-subtle dark:text-paimon-dark-subtle">
              Lv.{character.level} · C{character.constellation} · Friendship{" "}
              {character.friendship}
            </Text>
          </View>
        </View>
        <View className="rounded-full bg-paimon-successSoft px-2.5 py-1 dark:bg-paimon-dark-successSoft">
          <Text className="text-xs font-bold text-paimon-success dark:text-paimon-dark-success">
            {nextStage
              ? `Next: ${nextStage.fromLevel}-${nextStage.toLevel}`
              : "Ascended"}
          </Text>
        </View>
      </View>

      {nextStage ? (
        <View className="gap-2.5">
          <Text className="mb-1 text-xs font-bold uppercase text-paimon-accent dark:text-paimon-dark-accent">
            Next ascension materials
          </Text>
          {stageMaterials.map((material) => (
            <View
              key={`${character.id}-${material.name}-${material.amount}`}
              className="flex-row items-center gap-2.5 rounded-xl border border-paimon-border bg-paimon-muted px-3 py-2.5 dark:border-paimon-dark-border dark:bg-paimon-dark-muted"
            >
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-paimon-accentSoft dark:bg-paimon-dark-accentSoft">
                <Text className="text-xs font-bold text-paimon-accent dark:text-paimon-dark-accent">
                  {getMaterialBadge(material.name)}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-paimon-text dark:text-paimon-dark-text">
                  {material.name} x{material.amount}
                </Text>
                <Text className="mt-1 text-xs text-paimon-subtle dark:text-paimon-dark-subtle">
                  {material.source ? material.source.name : "Boss / conversion"}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className="gap-2.5">
          <Text className="mb-1 text-xs font-bold uppercase text-paimon-accent dark:text-paimon-dark-accent">
            Ascension
          </Text>
          <Text className="text-xs leading-5 text-paimon-subtle dark:text-paimon-dark-subtle">
            This character is already at Max Ascension
          </Text>
        </View>
      )}

      <View className="gap-2.5">
        <Text className="mb-1 text-xs font-bold uppercase text-paimon-accent dark:text-paimon-dark-accent">
          Today&apos;s must-do
        </Text>
        {todayChecklistItems.length > 0 ? (
          todayChecklistItems.map((item) => {
            const isCompleted = completedIds.includes(item.id);

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                onPress={() => onToggleTask(item.id)}
              >
                <View
                  className={cn(
                    "flex-row items-center gap-2.5 rounded-xl border border-paimon-border bg-paimon-muted px-3 py-2.5 dark:border-paimon-dark-border dark:bg-paimon-dark-muted",
                    isCompleted &&
                      "border-paimon-success bg-paimon-successSoft dark:border-paimon-dark-success dark:bg-paimon-dark-successSoft",
                  )}
                >
                  <View
                    className={cn(
                      "h-[22px] w-[22px] items-center justify-center rounded-full border border-paimon-strong bg-paimon-bg dark:border-paimon-dark-strong dark:bg-paimon-dark-bg",
                      isCompleted &&
                        "border-paimon-success bg-paimon-success dark:border-paimon-dark-success dark:bg-paimon-dark-success",
                    )}
                  >
                    <Text className="text-xs font-extrabold text-paimon-bg dark:text-paimon-dark-bg">
                      {isCompleted ? "✓" : ""}
                    </Text>
                  </View>
                  <Text
                    className={cn(
                      "flex-1 text-xs leading-5 text-paimon-text dark:text-paimon-dark-text",
                      isCompleted &&
                        "text-paimon-success line-through dark:text-paimon-dark-success",
                    )}
                  >
                    {item.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <Text className="text-xs leading-5 text-paimon-subtle dark:text-paimon-dark-subtle">
            No day-locked domain target for today. Bosses and routes are still
            open.
          </Text>
        )}
      </View>

      <View className="gap-2.5">
        <Text className="mb-1 text-xs font-bold uppercase text-paimon-accent dark:text-paimon-dark-accent">
          Tracked sources
        </Text>
        {relatedDomains.map((domain) => (
          <Text
            key={`${character.id}-${domain.id}`}
            className="text-xs leading-5 text-paimon-subtle dark:text-paimon-dark-subtle"
          >
            {domain.name} · {formatDayList(domain.availableDays)}
          </Text>
        ))}
      </View>
    </View>
  );
}

export default function FarmScreen() {
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
  const { data, isLoading, isError, error, refetch } = useEnkaUser(uid);

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
    return <LoadingState message="Preparing today's checklist..." />;
  }

  if (!uid) {
    return (
      <EmptyState
        title="Farm Planner"
        message="Add your UID in Settings to turn this into a day-by-day farming checklist."
      />
    );
  }

  if (isLoading) {
    return <SkeletonList title="Loading your tracked characters..." count={3} />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Could not load farm plan"
        message={getEnkaErrorMessage(error)}
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-paimon-bg dark:bg-paimon-dark-bg"
      contentContainerClassName="gap-[18px] p-4 pb-8"
      style={{ paddingTop: top }}
    >
      <View className="gap-1.5">
        <Text className="text-2xl font-bold text-paimon-text dark:text-paimon-dark-text">
          Farm Planner
        </Text>
        <Text className="text-sm leading-5 text-paimon-subtle dark:text-paimon-dark-subtle">
          Today is {today}. This view combines your showcased tracked
          characters, their next ascension range, and the domains that are open
          right now.
        </Text>
      </View>

      <View className="gap-2.5">
        <Text className="mb-1 text-lg font-bold text-paimon-text dark:text-paimon-dark-text">
          Today&apos;s domains
        </Text>
        {todayDomains.map((source) => (
          <DomainCard key={source.id} source={source} today={today} />
        ))}
      </View>

      <View className="gap-2.5">
        <View className="mb-1 flex-row items-center justify-between gap-3">
          <Text className="text-lg font-bold text-paimon-text dark:text-paimon-dark-text">
            Tracked characters
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => resetForDate(dateKey)}
            className="rounded-full bg-paimon-accentSoft px-3 py-1.5 dark:bg-paimon-dark-accentSoft"
          >
            <Text className="text-xs font-bold text-paimon-accent dark:text-paimon-dark-accent">
              Reset today
            </Text>
          </TouchableOpacity>
        </View>
        {trackedCharacters.length > 0 ? (
          trackedCharacters.map((character) => (
            <CharacterFarmCard
              key={character.id}
              character={character}
              today={today}
              completedIds={farmChecklist.completedIds}
              onToggleTask={toggleCompleted}
            />
          ))
        ) : (
          <View className="rounded-[14px] border border-paimon-border bg-paimon-surface p-4 dark:border-paimon-dark-border dark:bg-paimon-dark-surface">
            <Text className="mb-1.5 text-base font-bold text-paimon-text dark:text-paimon-dark-text">
              No tracked farm characters in showcase
            </Text>
            <Text className="text-xs leading-5 text-paimon-subtle dark:text-paimon-dark-subtle">
              Put curated characters like Chasca, Zibai, or Nahida in your Enka
              showcase to get level-aware farm planning.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

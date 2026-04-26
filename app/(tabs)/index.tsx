import { getEnkaErrorMessage } from "@/api/enka";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  SkeletonList,
} from "@/components/ScreenState";
import { ELEMENT_COLOR } from "@/constants/color";
import { scoreBuild, scoreToGrade, type Grade } from "@/lib/artifact-scorer";
import { getBuildsForCharacter } from "@/lib/recommended-builds";
import { useEnkaUser } from "@/hooks/useEnkaUser";
import { useUserStore } from "@/store/user-store";
import type { Character } from "@/types/character";
import { useRouter } from "expo-router";
import {
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const GRADE_COLORS: Record<Grade, { bg: string; text: string }> = {
  S: { bg: "#FFD700", text: "#000" },
  A: { bg: "#9de06b", text: "#000" },
  B: { bg: "#8ec8ff", text: "#000" },
  C: { bg: "#e7c766", text: "#000" },
  D: { bg: "#555", text: "#fff" },
};

function BuildScoreBadge({ character }: { character: Character }) {
  const builds = getBuildsForCharacter(character.id);
  if (!builds.length || !character.artifacts.length) return null;

  const { overall } = scoreBuild(character.artifacts, builds[0]);
  const grade = scoreToGrade(overall);
  const { bg } = GRADE_COLORS[grade];

  return (
    <View className="flex-row items-center gap-1 rounded-md bg-paimon-raised px-1.5 py-0.5 dark:bg-paimon-dark-raised">
      <Text className="text-xs font-extrabold" style={{ color: bg }}>
        {grade}
      </Text>
      <Text className="text-xs text-paimon-subtle dark:text-paimon-dark-subtle">
        {overall}
      </Text>
    </View>
  );
}

function CharacterCard({ character }: { character: Character }) {
  const router = useRouter();
  const elementColor = ELEMENT_COLOR[character.element] ?? "#c9a227";

  return (
    <TouchableOpacity
      className="m-1.5 flex-1"
      onPress={() => router.push(`/character/${character.id}`)}
    >
      <View
        className="min-h-[120px] rounded-xl border-[1.5px] bg-paimon-surface p-3 dark:bg-paimon-dark-surface"
        style={{ borderColor: elementColor }}
      >
        <View
          className="mb-2 h-9 w-9 items-center justify-center rounded-xl"
          style={{ backgroundColor: elementColor }}
        >
          <Image source={{ uri: character.iconUrl }} className="h-6 w-6" />
        </View>

        <Text
          className="mb-1 text-[15px] font-semibold text-paimon-text dark:text-paimon-dark-text"
          numberOfLines={1}
        >
          {character.name}
        </Text>
        <View className="mb-1 flex-row gap-2">
          <Text className="text-xs text-paimon-soft dark:text-paimon-dark-soft">
            Lv.{character.level}
          </Text>
          <Text className="text-xs text-paimon-soft dark:text-paimon-dark-soft">
            C{character.constellation}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-paimon-accent dark:text-paimon-dark-accent">
            {"★".repeat(character.rarity)}
          </Text>
          <BuildScoreBadge character={character} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function PlayerInfoBar({
  nickname,
  level,
  uid,
}: {
  nickname: string;
  level: number;
  uid: string;
}) {
  return (
    <View className="border-b border-paimon-border bg-paimon-surface px-4 py-3 dark:border-paimon-dark-border dark:bg-paimon-dark-surface">
      <Text className="text-lg font-bold text-paimon-text dark:text-paimon-dark-text">
        {nickname}
      </Text>
      <Text className="mt-0.5 text-xs text-paimon-subtle dark:text-paimon-dark-subtle">
        AR {level} · UID {uid}
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  const { top } = useSafeAreaInsets();
  const uid = useUserStore((s) => s.uid);
  const isHydrated = useUserStore((s) => s.isHydrated);
  const { data, isLoading, isFetching, isError, error, refetch } =
    useEnkaUser(uid);

  if (!isHydrated) {
    return <LoadingState message="Preparing your planner..." />;
  }

  if (!uid) {
    return (
      <EmptyState
        title="No UID set"
        message="Go to Settings and enter your Genshin Impact UID to get started."
      />
    );
  }

  if (isLoading) {
    return <SkeletonList title="Fetching showcase..." count={4} />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Could not load showcase"
        message={getEnkaErrorMessage(error)}
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <View
      className="flex-1 bg-paimon-bg dark:bg-paimon-dark-bg"
      style={{ paddingTop: top }}
    >
      {data && (
        <PlayerInfoBar
          nickname={data.playerInfo.nickname}
          level={data.playerInfo.level}
          uid={uid}
        />
      )}
      <FlatList
        data={data?.characters ?? []}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerClassName="p-2"
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={() => refetch()}
            tintColor="#c9a227"
            colors={["#c9a227"]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="No characters found"
            message="Make sure your Character Showcase is set to public in-game (max 8 characters)."
          />
        }
        renderItem={({ item }: { item: Character }) => (
          <CharacterCard character={item} />
        )}
      />
    </View>
  );
}

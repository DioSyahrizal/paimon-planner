import { getEnkaErrorMessage } from "@/api/enka";
import { ELEMENT_COLOR } from "@/constants/color";
import { scoreBuild, scoreToGrade, type Grade } from "@/lib/artifact-scorer";
import { getBuildsForCharacter } from "@/lib/recommended-builds";
import { useEnkaUser } from "@/hooks/useEnkaUser";
import { useUserStore } from "@/store/user-store";
import { useAppTheme, type AppTheme } from "@/theme/app-theme";
import type { Character } from "@/types/character";
import { useRouter } from "expo-router";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image, Spinner, Text, View, XStack, YStack } from "tamagui";

type HomeStyles = ReturnType<typeof createStyles>;

const GRADE_COLORS: Record<Grade, { bg: string; text: string }> = {
  S: { bg: "#FFD700", text: "#000" },
  A: { bg: "#9de06b", text: "#000" },
  B: { bg: "#8ec8ff", text: "#000" },
  C: { bg: "#e7c766", text: "#000" },
  D: { bg: "#555", text: "#fff" },
};

function BuildScoreBadge({ character, styles }: { character: Character; styles: HomeStyles }) {
  const builds = getBuildsForCharacter(character.id);
  if (!builds.length || !character.artifacts.length) return null;

  const { overall } = scoreBuild(character.artifacts, builds[0]);
  const grade = scoreToGrade(overall);
  const { bg } = GRADE_COLORS[grade];

  return (
    <XStack style={styles.scoreBadge} gap={4} alignItems="center">
      <Text style={[styles.scoreBadgeGrade, { color: bg }]}>{grade}</Text>
      <Text style={styles.scoreBadgeValue}>{overall}</Text>
    </XStack>
  );
}

function CharacterCard({ character, styles }: { character: Character; styles: HomeStyles }) {
  const router = useRouter();
  const elementColor = ELEMENT_COLOR[character.element] ?? "#c9a227";

  return (
    <TouchableOpacity
      style={styles.cardTouchable}
      onPress={() => router.push(`/character/${character.id}`)}
    >
      <View style={[styles.card, { borderColor: elementColor }]}>
        <View style={[styles.elementBadge, { backgroundColor: elementColor }]}>
          <Image src={character.iconUrl} width={24} height={24} />
        </View>

        <Text style={styles.characterName} numberOfLines={1}>
          {character.name}
        </Text>
        <XStack style={styles.cardMeta}>
          <Text style={styles.metaText}>Lv.{character.level}</Text>
          <Text style={styles.metaText}>C{character.constellation}</Text>
        </XStack>
        <XStack justifyContent="space-between" alignItems="center">
          <Text style={styles.rarityText}>{"★".repeat(character.rarity)}</Text>
          <BuildScoreBadge character={character} styles={styles} />
        </XStack>
      </View>
    </TouchableOpacity>
  );
}

function PlayerInfoBar({
  nickname,
  level,
  uid,
  styles,
}: {
  nickname: string;
  level: number;
  uid: string;
  styles: HomeStyles;
}) {
  return (
    <View style={styles.playerBar}>
      <YStack>
        <Text style={styles.playerName}>{nickname}</Text>
        <Text style={styles.playerMeta}>
          AR {level} · UID {uid}
        </Text>
      </YStack>
    </View>
  );
}

export default function HomeScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { top } = useSafeAreaInsets();
  const uid = useUserStore((s) => s.uid);
  const isHydrated = useUserStore((s) => s.isHydrated);
  const { data, isLoading, isFetching, isError, error, refetch } =
    useEnkaUser(uid);

  if (!isHydrated) {
    return (
      <View style={styles.centerContainer}>
        <Spinner size="large" color="$yellow9" />
      </View>
    );
  }

  if (!uid) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>No UID set</Text>
        <Text style={styles.emptySubtitle}>
          Go to Settings and enter your Genshin Impact UID to get started.
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Spinner size="large" color="$yellow9" />
        <Text style={styles.loadingText}>Fetching showcase...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{getEnkaErrorMessage(error)}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      {data && (
        <PlayerInfoBar
          nickname={data.playerInfo.nickname}
          level={data.playerInfo.level}
          uid={uid}
          styles={styles}
        />
      )}
      <FlatList
        data={data?.characters ?? []}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={() => refetch()}
            tintColor={theme.accent}
            colors={[theme.accent]}
          />
        }
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.emptyTitle}>No characters found</Text>
            <Text style={styles.emptySubtitle}>
              Make sure your Character Showcase is set to public in-game (max 8
              characters).
            </Text>
          </View>
        }
        renderItem={({ item }: { item: Character }) => (
          <CharacterCard character={item} styles={styles} />
        )}
      />
    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  centerContainer: {
    flex: 1,
    backgroundColor: theme.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  playerBar: {
    backgroundColor: theme.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  playerName: { color: theme.text, fontSize: 18, fontWeight: "700" },
  playerMeta: { color: theme.textSubtle, fontSize: 13, marginTop: 2 },
  grid: { padding: 8 },
  cardTouchable: { flex: 1, margin: 6 },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 12,
    minHeight: 120,
  },
  elementBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  elementText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  characterName: {
    color: theme.text,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardMeta: { gap: 8, marginBottom: 4 },
  metaText: { color: theme.textMuted, fontSize: 12 },
  rarityText: { color: theme.accent, fontSize: 11 },
  scoreBadge: {
    backgroundColor: theme.raised,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  scoreBadgeGrade: { fontSize: 11, fontWeight: "800" },
  scoreBadgeValue: { color: theme.textSubtle, fontSize: 11 },
  loadingText: { color: theme.textSubtle, marginTop: 12, fontSize: 14 },
  emptyTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  emptySubtitle: {
    color: theme.textSubtle,
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  errorText: {
    color: theme.danger,
    fontSize: 15,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: theme.accent,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: { color: theme.accentText, fontWeight: "700" },
});

import { useRouter } from 'expo-router'
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native'
import { Text, View, XStack, YStack, Spinner } from 'tamagui'
import { useEnkaUser } from '@/hooks/useEnkaUser'
import { useUserStore } from '@/store/user-store'
import { getEnkaErrorMessage } from '@/api/enka'
import type { Character } from '@/types/character'

const ELEMENT_COLOR: Record<string, string> = {
  Pyro: '#ff6040',
  Hydro: '#4cb8f5',
  Anemo: '#74c69d',
  Electro: '#c77dff',
  Dendro: '#6abe30',
  Cryo: '#a8dadc',
  Geo: '#f4a261',
}

function CharacterCard({ character }: { character: Character }) {
  const router = useRouter()
  const elementColor = ELEMENT_COLOR[character.element] ?? '#c9a227'

  return (
    <TouchableOpacity
      style={styles.cardTouchable}
      onPress={() => router.push(`/character/${character.id}`)}>
      <View style={[styles.card, { borderColor: elementColor }]}>
        <View style={[styles.elementBadge, { backgroundColor: elementColor }]}>
          <Text style={styles.elementText}>{character.element[0]}</Text>
        </View>
        <Text style={styles.characterName} numberOfLines={1}>
          {character.name}
        </Text>
        <XStack style={styles.cardMeta}>
          <Text style={styles.metaText}>Lv.{character.level}</Text>
          <Text style={styles.metaText}>C{character.constellation}</Text>
        </XStack>
        <Text style={styles.rarityText}>{'★'.repeat(character.rarity)}</Text>
      </View>
    </TouchableOpacity>
  )
}

function PlayerInfoBar({ nickname, level, uid }: { nickname: string; level: number; uid: string }) {
  return (
    <View style={styles.playerBar}>
      <YStack>
        <Text style={styles.playerName}>{nickname}</Text>
        <Text style={styles.playerMeta}>AR {level} · UID {uid}</Text>
      </YStack>
    </View>
  )
}

export default function HomeScreen() {
  const uid = useUserStore((s) => s.uid)
  const { data, isLoading, isFetching, isError, error, refetch } = useEnkaUser(uid)

  if (!uid) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>No UID set</Text>
        <Text style={styles.emptySubtitle}>
          Go to Settings and enter your Genshin Impact UID to get started.
        </Text>
      </View>
    )
  }

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Spinner size="large" color="$yellow9" />
        <Text style={styles.loadingText}>Fetching showcase...</Text>
      </View>
    )
  }

  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{getEnkaErrorMessage(error)}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
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
        contentContainerStyle={styles.grid}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={() => refetch()}
            tintColor="#c9a227"
          />
        }
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.emptyTitle}>No characters found</Text>
            <Text style={styles.emptySubtitle}>
              Make sure your Character Showcase is set to public in-game (max 8 characters).
            </Text>
          </View>
        }
        renderItem={({ item }: { item: Character }) => (
          <CharacterCard character={item} />
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  playerBar: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  playerName: { color: '#fff', fontSize: 18, fontWeight: '700' },
  playerMeta: { color: '#888', fontSize: 13, marginTop: 2 },
  grid: { padding: 8 },
  cardTouchable: { flex: 1, margin: 6 },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 12,
    minHeight: 120,
  },
  elementBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  elementText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  characterName: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 4 },
  cardMeta: { gap: 8, marginBottom: 4 },
  metaText: { color: '#aaa', fontSize: 12 },
  rarityText: { color: '#c9a227', fontSize: 11 },
  loadingText: { color: '#888', marginTop: 12, fontSize: 14 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '600', textAlign: 'center' },
  emptySubtitle: { color: '#888', fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  errorText: { color: '#ff6b6b', fontSize: 15, textAlign: 'center', marginBottom: 16 },
  retryButton: {
    backgroundColor: '#c9a227',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: { color: '#000', fontWeight: '700' },
})

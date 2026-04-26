import { getAllBuilds } from '@/lib/recommended-builds'
import { useAppTheme, type AppTheme } from '@/theme/app-theme'
import type { RecommendedBuild, WeaponRecommendation } from '@/types/build'
import { useRouter } from 'expo-router'
import { useMemo } from 'react'
import { SectionList, StyleSheet, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, View, XStack, YStack } from 'tamagui'

type BuildsStyles = ReturnType<typeof createStyles>

interface BuildSection {
  title: string
  data: RecommendedBuild[]
}

const TIER_PRIORITY: Record<WeaponRecommendation['tier'], number> = {
  S: 0,
  A: 1,
  B: 2,
}

function getBestArtifactSet(build: RecommendedBuild): string {
  const topSet = build.artifactSets[0]

  if (!topSet) {
    return 'No artifact set listed'
  }

  return topSet.sets.map((set) => `${set.pieces}pc ${set.setName}`).join(' + ')
}

function getTopWeapon(build: RecommendedBuild): string {
  const topWeapon = [...build.weapons].sort((a, b) => {
    const tierDiff = TIER_PRIORITY[a.tier] - TIER_PRIORITY[b.tier]

    if (tierDiff !== 0) {
      return tierDiff
    }

    return a.weaponName.localeCompare(b.weaponName)
  })[0]

  return topWeapon?.weaponName ?? 'No weapon listed'
}

function formatUpdatedDate(date: string): string {
  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return date
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate)
}

function BuildCard({ build, styles }: { build: RecommendedBuild; styles: BuildsStyles }) {
  const router = useRouter()

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() =>
        router.push({
          pathname: '/character/[id]',
          params: { id: build.characterId, tab: 'recommended' },
        })
      }
    >
      <View style={styles.card}>
        <XStack style={styles.cardHeader}>
          <Text style={styles.role}>{build.role}</Text>
          <View style={styles.readOnlyBadge}>
            <Text style={styles.readOnlyBadgeText}>READ ONLY</Text>
          </View>
        </XStack>

        <YStack style={styles.infoStack}>
          <View>
            <Text style={styles.label}>Best set</Text>
            <Text style={styles.value}>{getBestArtifactSet(build)}</Text>
          </View>

          <View>
            <Text style={styles.label}>Top weapon</Text>
            <Text style={styles.value}>{getTopWeapon(build)}</Text>
          </View>
        </YStack>

        <XStack style={styles.metaRow}>
          <Text style={styles.metaText}>Source: {build.source}</Text>
          <Text style={styles.metaText}>Updated: {formatUpdatedDate(build.lastUpdated)}</Text>
        </XStack>
      </View>
    </TouchableOpacity>
  )
}

export default function BuildsScreen() {
  const theme = useAppTheme()
  const styles = createStyles(theme)
  const { top } = useSafeAreaInsets()

  const sections = useMemo<BuildSection[]>(() => {
    const groupedBuilds = getAllBuilds()
      .slice()
      .sort((a, b) => {
        const nameDiff = a.characterName.localeCompare(b.characterName)

        if (nameDiff !== 0) {
          return nameDiff
        }

        return a.role.localeCompare(b.role)
      })
      .reduce<Record<string, RecommendedBuild[]>>((acc, build) => {
        if (!acc[build.characterName]) {
          acc[build.characterName] = []
        }

        acc[build.characterName].push(build)
        return acc
      }, {})

    return Object.entries(groupedBuilds)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([title, data]) => ({ title, data }))
  }, [])

  if (sections.length === 0) {
    return (
      <View style={[styles.emptyContainer, { paddingTop: top + 24 }]}>
        <Text style={styles.title}>Build Guides</Text>
        <Text style={styles.emptyTitle}>No build guides yet</Text>
        <Text style={styles.emptySubtitle}>
          This tab reads from the bundled recommendation JSON. More guides will appear as they are
          manually converted and added.
        </Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => `${item.characterId}-${item.role}`}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.content}
        renderSectionHeader={({ section }) => <Text style={styles.sectionTitle}>{section.title}</Text>}
        renderItem={({ item }) => <BuildCard build={item} styles={styles} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Build Guides</Text>
            <Text style={styles.subtitle}>
              Read-only community build references curated in the bundled JSON dataset.
            </Text>
          </View>
        }
      />
    </View>
  )
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  header: { paddingTop: 16, paddingBottom: 12 },
  title: { color: theme.text, fontSize: 24, fontWeight: '700' },
  subtitle: { color: theme.textSubtle, fontSize: 14, lineHeight: 20, marginTop: 6 },
  sectionTitle: {
    color: theme.accent,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 10,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: { alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 },
  role: { color: theme.text, fontSize: 16, fontWeight: '700', flex: 1 },
  readOnlyBadge: {
    backgroundColor: theme.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  readOnlyBadgeText: { color: theme.accent, fontSize: 11, fontWeight: '700' },
  infoStack: { gap: 10 },
  label: { color: theme.textSubtle, fontSize: 12, marginBottom: 3, textTransform: 'uppercase' },
  value: { color: theme.text, fontSize: 14, lineHeight: 20 },
  metaRow: {
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  metaText: { color: theme.textSubtle, fontSize: 12, flex: 1 },
  emptyContainer: {
    flex: 1,
    backgroundColor: theme.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 18,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: theme.textSubtle,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
})

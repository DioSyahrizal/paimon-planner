import characterMaterialsData from '@/data/character-materials.json'
import farmSourcesData from '@/data/farm-sources.json'
import { getBuildsForCharacter } from '@/lib/recommended-builds'
import type {
  CharacterAscensionStage,
  CharacterMaterialEntry,
  CharacterMaterialRequirement,
  DayOfWeek,
  FarmSource,
  MaterialAmount,
  RecommendedArtifactDomain,
  ResolvedFarmTarget,
} from '@/types/farm'

const characterMaterials = characterMaterialsData as CharacterMaterialRequirement[]
const farmSources = farmSourcesData as FarmSource[]

const farmSourceMap = new Map(farmSources.map((source) => [source.id, source]))

function isSourceAvailableOnDay(source: FarmSource | undefined, day?: DayOfWeek): boolean {
  if (!source || !day || !source.availableDays) {
    return true
  }

  return source.availableDays.includes(day)
}

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  return Array.from(new Map(items.map((item) => [item.id, item])).values())
}

export function getFarmSources(): FarmSource[] {
  return farmSources
}

export function getCharacterFarmData(characterId: string): CharacterMaterialRequirement | undefined {
  return characterMaterials.find((entry) => entry.characterId === characterId)
}

export function getCharacterMaterials(characterId: string): CharacterMaterialEntry[] {
  const farmData = getCharacterFarmData(characterId)

  if (!farmData) {
    return []
  }

  const ascension = farmData.ascension.map<CharacterMaterialEntry>((entry) => ({
    ...entry,
    phase: 'ascension',
  }))
  const talents = farmData.talents.map<CharacterMaterialEntry>((entry) => ({
    ...entry,
    phase: 'talent',
  }))

  return [...ascension, ...talents]
}

export function getRecommendedArtifactDomains(characterId: string): RecommendedArtifactDomain[] {
  return getBuildsForCharacter(characterId).flatMap((build) =>
    build.artifactSets.flatMap((artifactOption) =>
      artifactOption.sets.flatMap((set) => {
        const source = farmSources.find((farmSource) => farmSource.drops.includes(set.setName))

        if (!source) {
          return []
        }

        return [
          {
            characterId: build.characterId,
            characterName: build.characterName,
            role: build.role,
            setName: set.setName,
            source,
          },
        ]
      }),
    ),
  )
}

export function getCharacterDomains(characterId: string): FarmSource[] {
  const materialSources = getCharacterMaterials(characterId)
    .map((entry) => (entry.sourceId ? farmSourceMap.get(entry.sourceId) : undefined))
    .filter((source): source is FarmSource => Boolean(source))
    .filter((source) =>
      ['artifact_domain', 'talent_domain', 'normal_boss', 'weekly_boss'].includes(source.category),
    )

  const artifactSources = getRecommendedArtifactDomains(characterId).map((entry) => entry.source)

  return uniqueById([...materialSources, ...artifactSources])
}

export function getAvailableDomainsForDay(day: DayOfWeek, characterId?: string): FarmSource[] {
  const domainCategories = ['artifact_domain', 'talent_domain']
  const scopedSources = characterId ? getCharacterDomains(characterId) : farmSources

  return uniqueById(
    scopedSources.filter(
      (source) => domainCategories.includes(source.category) && isSourceAvailableOnDay(source, day),
    ),
  )
}

export function getFarmTargetsForCharacter(characterId: string, day?: DayOfWeek): ResolvedFarmTarget[] {
  const farmData = getCharacterFarmData(characterId)

  if (!farmData) {
    return []
  }

  const materialTargets = getCharacterMaterials(characterId).map<ResolvedFarmTarget>((entry) => {
    const source = entry.sourceId ? farmSourceMap.get(entry.sourceId) : undefined

    return {
      characterId: farmData.characterId,
      characterName: farmData.characterName,
      phase: entry.phase,
      materialName: entry.name,
      materialType: entry.type,
      source,
      availableToday: isSourceAvailableOnDay(source, day),
      note: entry.note,
    }
  })

  const artifactTargets = getRecommendedArtifactDomains(characterId).map<ResolvedFarmTarget>((entry) => ({
    characterId: entry.characterId,
    characterName: entry.characterName,
    phase: 'artifact',
    materialName: entry.setName,
    materialType: 'artifact_set',
    source: entry.source,
    availableToday: isSourceAvailableOnDay(entry.source, day),
    note: `${entry.role} recommended set`,
  }))

  return [...materialTargets, ...artifactTargets]
}

export function getNextAscensionStage(
  characterId: string,
  level: number,
): CharacterAscensionStage | undefined {
  const stages = getCharacterFarmData(characterId)?.ascensionStages

  if (!stages?.length || level >= 80) {
    return undefined
  }

  return stages.find((stage) => level < stage.toLevel)
}

export function getStageMaterialsWithSources(
  characterId: string,
  level: number,
): (MaterialAmount & { source?: FarmSource })[] {
  const stage = getNextAscensionStage(characterId, level)

  if (!stage) {
    return []
  }

  return stage.materials.map((material) => ({
    ...material,
    source: material.sourceId ? farmSourceMap.get(material.sourceId) : undefined,
  }))
}

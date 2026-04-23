import type { RecommendedBuild } from '@/types/build'
import buildsData from '@/data/recommended-builds.json'

const builds = buildsData as RecommendedBuild[]

export function getAllBuilds(): RecommendedBuild[] {
  return builds
}

export function getBuildsForCharacter(characterId: string): RecommendedBuild[] {
  return builds.filter((b) => b.characterId === characterId)
}

export function getBuildByRole(characterId: string, role: string): RecommendedBuild | undefined {
  return builds.find((b) => b.characterId === characterId && b.role === role)
}

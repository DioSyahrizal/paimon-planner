import { scoreBuild, type BuildScore } from '@/lib/artifact-scorer'
import type { Artifact } from '@/types/artifact'
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

export function resolveSelectedBuild(
  characterId: string,
  role?: string,
): RecommendedBuild | undefined {
  const characterBuilds = getBuildsForCharacter(characterId)

  if (!characterBuilds.length) {
    return undefined
  }

  if (!role) {
    return characterBuilds[0]
  }

  return getBuildByRole(characterId, role) ?? characterBuilds[0]
}

export function getBestBuildScoreForArtifacts(
  characterId: string,
  artifacts: Artifact[],
): { build: RecommendedBuild; score: BuildScore } | null {
  const characterBuilds = getBuildsForCharacter(characterId)

  if (!characterBuilds.length || !artifacts.length) {
    return null
  }

  let bestResult: { build: RecommendedBuild; score: BuildScore } | null = null

  for (const build of characterBuilds) {
    const score = scoreBuild(artifacts, build)

    if (!bestResult || score.overall > bestResult.score.overall) {
      bestResult = { build, score }
    }
  }

  return bestResult
}

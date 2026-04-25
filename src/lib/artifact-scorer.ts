import type { Artifact, ArtifactSlot, StatType } from '@/types/artifact'
import type { ArtifactSetOption, RecommendedBuild } from '@/types/build'

// ── Max single-roll value per stat at 5-star rarity ─────────────────────────
// Source: Genshin Impact wiki — substat roll value tables
const MAX_ROLL_5STAR: Partial<Record<StatType, number>> = {
  HP: 298.75,
  ATK: 19.45,
  DEF: 23.15,
  'HP%': 5.83,
  'ATK%': 5.83,
  'DEF%': 7.29,
  EM: 23.31,
  'ER%': 6.48,
  'CR%': 3.89,
  'CD%': 7.77,
}

// 4-star substats are ~75% of 5-star values
const RARITY_SCALE: Record<number, number> = {
  5: 1.0,
  4: 0.75,
  3: 0.5,
}

// A +20 5-star artifact gets 5 upgrade rolls on top of the initial value,
// so a single substat can appear at most 6 times total.
const MAX_ROLLS = 6

// Priority weight by rank: 1st = 4x, 2nd = 3x, 3rd = 2x, 4th = 1x
const PRIORITY_WEIGHTS = [4, 3, 2, 1] as const

// ── Grades ───────────────────────────────────────────────────────────────────
export type Grade = 'S' | 'A' | 'B' | 'C' | 'D'

export function scoreToGrade(score: number): Grade {
  if (score >= 75) return 'S'
  if (score >= 55) return 'A'
  if (score >= 35) return 'B'
  if (score >= 15) return 'C'
  return 'D'
}

// ── Return types ─────────────────────────────────────────────────────────────
export interface SubstatContribution {
  stat: StatType
  value: number
  priorityRank: number | null // 0-based index in substatPriority; null = not a priority stat
  weight: number              // 0–4 based on rank
  efficiency: number          // 0–1 (actual / theoretical max)
  contribution: number        // weight × efficiency
}

export interface ArtifactScore {
  artifactId: string
  slotType: ArtifactSlot
  score: number               // 0–100
  grade: Grade
  substatContributions: SubstatContribution[]
}

export interface BuildScore {
  overall: number             // 0–100
  grade: Grade
  substatScore: number        // 0–60 (60% weight — avg artifact substat quality)
  mainStatScore: number       // 0–30 (10 pts each for sands / goblet / circlet)
  setScore: number            // 0–10 (set match bonus)
  artifactScores: ArtifactScore[]
  mainStatMatch: Record<'sands' | 'goblet' | 'circlet', boolean>
  setMatch: boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getMaxRollValue(stat: StatType, rarity: number): number {
  const base = MAX_ROLL_5STAR[stat]
  if (base === undefined) return 0
  const scale = RARITY_SCALE[rarity] ?? 1.0
  return base * scale
}

// ── Per-artifact scoring ─────────────────────────────────────────────────────
//
// Algorithm:
//   For each substat:
//     1. Find its rank in substatPriority (0-based). If not in top 4, weight = 0.
//     2. efficiency = actual value / (max single roll × MAX_ROLLS), capped at 1.0
//     3. contribution = weight × efficiency
//   Score = (sum of contributions / max possible contributions) × 100
//
// Max possible = sum of top N priority weights, where N = number of substats
// on this artifact (up to 4). This is a FIXED denominator — it does not
// depend on which priority stats happen to appear. An artifact that lacks the
// top priority stats is penalised even if the ones it has are perfectly rolled.
//
// Example with 4 substats: maxPossible = 4+3+2+1 = 10 always.
//   • Only 4th priority stat at 100% eff → score = 1/10 = 10
//   • Only 1st priority stat at 100% eff → score = 4/10 = 40
//   • All 4 priority stats at 100% eff  → score = 10/10 = 100

export function scoreArtifact(
  artifact: Artifact,
  substatPriority: StatType[],
): ArtifactScore {
  const contributions: SubstatContribution[] = []
  let totalContribution = 0

  // Fixed denominator: best possible score for this many substats
  const substatCount = Math.min(artifact.subStats.length, 4)
  const maxPossible = PRIORITY_WEIGHTS.slice(0, substatCount).reduce(
    (sum, w) => sum + w,
    0,
  )

  for (const substat of artifact.subStats) {
    const priorityRank = substatPriority.slice(0, 4).indexOf(substat.stat)
    const weight = priorityRank >= 0 ? PRIORITY_WEIGHTS[priorityRank] : 0

    const maxRoll = getMaxRollValue(substat.stat, artifact.rarity)
    const efficiency =
      maxRoll > 0 ? Math.min(substat.value / (maxRoll * MAX_ROLLS), 1.0) : 0
    const contribution = weight * efficiency

    totalContribution += contribution
    contributions.push({
      stat: substat.stat,
      value: substat.value,
      priorityRank: priorityRank >= 0 ? priorityRank : null,
      weight,
      efficiency,
      contribution,
    })
  }

  const score =
    maxPossible > 0 ? Math.min(Math.round((totalContribution / maxPossible) * 100), 100) : 0

  return {
    artifactId: artifact.id,
    slotType: artifact.slotType,
    score,
    grade: scoreToGrade(score),
    substatContributions: contributions,
  }
}

// ── Main stat check ───────────────────────────────────────────────────────────
// Flower (HP) and Feather (ATK) are fixed stats — always correct, not scored.
// Only Sands / Goblet / Circlet are compared against the recommended build.

function checkMainStatMatch(
  artifacts: Artifact[],
  mainStats: RecommendedBuild['mainStats'],
): Record<'sands' | 'goblet' | 'circlet', boolean> {
  const result: Record<'sands' | 'goblet' | 'circlet', boolean> = {
    sands: false,
    goblet: false,
    circlet: false,
  }

  for (const artifact of artifacts) {
    if (artifact.slotType === 'sands') {
      result.sands = mainStats.sands.includes(artifact.mainStat.stat)
    } else if (artifact.slotType === 'goblet') {
      result.goblet = mainStats.goblet.includes(artifact.mainStat.stat)
    } else if (artifact.slotType === 'circlet') {
      result.circlet = mainStats.circlet.includes(artifact.mainStat.stat)
    }
  }

  return result
}

// ── Set match check ───────────────────────────────────────────────────────────
// Returns true if the equipped artifacts satisfy at least one recommended
// ArtifactSetOption (e.g. 4pc BiS, or a valid 2pc+2pc combo).

function checkSetMatch(
  artifacts: Artifact[],
  recommendedSets: ArtifactSetOption[],
): boolean {
  const setCounts = new Map<string, number>()
  for (const artifact of artifacts) {
    setCounts.set(artifact.setId, (setCounts.get(artifact.setId) ?? 0) + 1)
  }

  return recommendedSets.some((option) =>
    option.sets.every(({ setId, pieces }) => (setCounts.get(setId) ?? 0) >= pieces),
  )
}

// ── Full build score ──────────────────────────────────────────────────────────
//
// Score breakdown (max 100):
//   • Substat quality  — avg artifact score × 0.6  → up to 60 pts
//   • Main stat match  — 10 pts each (sands/goblet/circlet) → up to 30 pts
//   • Set match        — 10 pts if any recommended set is satisfied → up to 10 pts

export function scoreBuild(
  artifacts: Artifact[],
  build: RecommendedBuild,
): BuildScore {
  const artifactScores = artifacts.map((artifact) =>
    scoreArtifact(artifact, build.substatPriority),
  )

  const avgArtifactScore =
    artifactScores.length > 0
      ? artifactScores.reduce((sum, a) => sum + a.score, 0) / artifactScores.length
      : 0
  const substatScore = Math.round(avgArtifactScore * 0.6)

  const mainStatMatch = checkMainStatMatch(artifacts, build.mainStats)
  const mainStatScore = Object.values(mainStatMatch).filter(Boolean).length * 10

  const setMatch = checkSetMatch(artifacts, build.artifactSets)
  const setScore = setMatch ? 10 : 0

  const overall = Math.min(substatScore + mainStatScore + setScore, 100)

  return {
    overall,
    grade: scoreToGrade(overall),
    substatScore,
    mainStatScore,
    setScore,
    artifactScores,
    mainStatMatch,
    setMatch,
  }
}

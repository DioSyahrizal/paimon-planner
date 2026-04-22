import type { ArtifactSlot, StatType } from './artifact'

export interface ArtifactSetOption {
  sets: { setId: string; setName: string; pieces: 2 | 4 }[]
  label: string
  tier: 'S' | 'A' | 'B'
}

export interface WeaponRecommendation {
  weaponId: string
  weaponName: string
  refinement?: string
  tier: 'S' | 'A' | 'B'
  note?: string
}

export interface TeamComp {
  label: string
  characters: string[]
  note?: string
}

export interface RecommendedBuild {
  characterId: string
  characterName: string
  role: string
  artifactSets: ArtifactSetOption[]
  mainStats: {
    sands: StatType[]
    goblet: StatType[]
    circlet: StatType[]
  }
  substatPriority: StatType[]
  weapons: WeaponRecommendation[]
  teamComps?: TeamComp[]
  notes?: string
  source: string
  lastUpdated: string
}

export interface StatGap {
  stat: StatType
  current: number
  recommended: number
  delta: number
}

export interface GapAnalysis {
  characterId: string
  overallScore: number
  artifactSetMatch: boolean
  mainStatMatch: Record<ArtifactSlot, boolean>
  substatGaps: StatGap[]
  weaponTier: 'S' | 'A' | 'B' | 'unranked'
}

export interface FarmItem {
  id: string
  characterId: string
  type: 'artifact_domain' | 'talent_book' | 'boss_material' | 'ascension_material'
  name: string
  domain?: string
  availableDays?: string[]
  completed: boolean
}

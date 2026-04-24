export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'

export type FarmSourceCategory =
  | 'artifact_domain'
  | 'talent_domain'
  | 'normal_boss'
  | 'weekly_boss'
  | 'enemy'
  | 'local_specialty'
  | 'special'

export type CharacterMaterialType =
  | 'ascension_gemstone'
  | 'local_specialty'
  | 'enemy_drop'
  | 'normal_boss_drop'
  | 'talent_book'
  | 'weekly_boss_drop'
  | 'crown'

export interface FarmSource {
  id: string
  name: string
  category: FarmSourceCategory
  region: string
  location: string
  drops: string[]
  availableDays?: DayOfWeek[]
  note?: string
}

export interface CharacterMaterialLink {
  name: string
  type: CharacterMaterialType
  sourceId?: string
  note?: string
}

export interface MaterialAmount extends CharacterMaterialLink {
  amount: number
}

export interface CharacterAscensionStage {
  fromLevel: number
  toLevel: number
  materials: MaterialAmount[]
}

export interface CharacterMaterialRequirement {
  characterId: string
  characterName: string
  ascension: CharacterMaterialLink[]
  talents: CharacterMaterialLink[]
  ascensionStages?: CharacterAscensionStage[]
}

export interface CharacterMaterialEntry extends CharacterMaterialLink {
  phase: 'ascension' | 'talent'
}

export interface ResolvedFarmTarget {
  characterId: string
  characterName: string
  phase: 'ascension' | 'talent' | 'artifact'
  materialName: string
  materialType: CharacterMaterialType | 'artifact_set'
  source?: FarmSource
  availableToday: boolean
  note?: string
}

export interface RecommendedArtifactDomain {
  characterId: string
  characterName: string
  role: string
  setName: string
  source: FarmSource
}

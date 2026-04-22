export type StatType =
  | 'HP'
  | 'HP%'
  | 'ATK'
  | 'ATK%'
  | 'DEF'
  | 'DEF%'
  | 'EM'
  | 'ER%'
  | 'CR%'
  | 'CD%'
  | 'Healing%'
  | 'Pyro DMG%'
  | 'Hydro DMG%'
  | 'Anemo DMG%'
  | 'Electro DMG%'
  | 'Dendro DMG%'
  | 'Cryo DMG%'
  | 'Geo DMG%'
  | 'Physical DMG%'

export type ArtifactSlot = 'flower' | 'feather' | 'sands' | 'goblet' | 'circlet'

export interface StatValue {
  stat: StatType
  value: number
}

export interface Artifact {
  id: string
  setId: string
  setName: string
  slotType: ArtifactSlot
  rarity: number
  level: number
  mainStat: StatValue
  subStats: StatValue[]
}

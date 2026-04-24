import type { Artifact } from './artifact'
import type { Weapon } from './weapon'

export type Element =
  | 'Pyro'
  | 'Hydro'
  | 'Anemo'
  | 'Electro'
  | 'Dendro'
  | 'Cryo'
  | 'Geo'

export interface TalentLevels {
  normal: number
  skill: number
  burst: number
}

export interface StatBlock {
  hp: number
  atk: number
  def: number
  em: number
  er: number
  cr: number
  cd: number
  elementalDmgBonus?: number
  healingBonus?: number
}

export interface Character {
  id: string
  name: string
  element: Element
  rarity: 4 | 5
  level: number
  ascension: number
  constellation: number
  friendship: number
  talents: TalentLevels
  weapon: Weapon
  artifacts: Artifact[]
  totalStats: StatBlock
  iconUrl?: string
  costumeId?: number
}

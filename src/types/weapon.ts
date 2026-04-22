import type { StatValue } from './artifact'

export type WeaponType = 'Sword' | 'Claymore' | 'Polearm' | 'Bow' | 'Catalyst'

export interface Weapon {
  id: string
  name: string
  type: WeaponType
  rarity: number
  level: number
  ascension: number
  refinement: number
  baseATK: number
  subStat?: StatValue
  iconUrl: string
}

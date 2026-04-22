import type { EnkaAvatarInfo, EnkaEquipItem } from '@/api/types'
import type { Character, Element, StatBlock, TalentLevels } from '@/types/character'
import type { Artifact, ArtifactSlot, StatType, StatValue } from '@/types/artifact'
import type { Weapon, WeaponType } from '@/types/weapon'

// Bundled lookup tables — download from https://github.com/EnkaNetwork/API-docs/tree/master/store
import characters from '@/data/enka-store/characters.json'
import loc from '@/data/enka-store/loc.json'

const ENKA_CDN = 'https://enka.network/ui'

const FIGHT_PROP_MAP: Record<string, StatType> = {
  '2000': 'HP',
  '2001': 'ATK',
  '2002': 'DEF',
  '28': 'EM',
  '23': 'ER%',
  '20': 'CR%',
  '22': 'CD%',
  '26': 'Healing%',
  '30': 'Physical DMG%',
  '40': 'Pyro DMG%',
  '41': 'Electro DMG%',
  '42': 'Hydro DMG%',
  '43': 'Dendro DMG%',
  '44': 'Anemo DMG%',
  '45': 'Geo DMG%',
  '46': 'Cryo DMG%',
}

const RELIQUARY_MAIN_PROP_MAP: Record<string, StatType> = {
  FIGHT_PROP_HP: 'HP',
  FIGHT_PROP_ATTACK: 'ATK',
  FIGHT_PROP_DEFENSE: 'DEF',
  FIGHT_PROP_HP_PERCENT: 'HP%',
  FIGHT_PROP_ATTACK_PERCENT: 'ATK%',
  FIGHT_PROP_DEFENSE_PERCENT: 'DEF%',
  FIGHT_PROP_ELEMENT_MASTERY: 'EM',
  FIGHT_PROP_CHARGE_EFFICIENCY: 'ER%',
  FIGHT_PROP_CRITICAL: 'CR%',
  FIGHT_PROP_CRITICAL_HURT: 'CD%',
  FIGHT_PROP_HEAL_ADD: 'Healing%',
  FIGHT_PROP_PHYSICAL_ADD_HURT: 'Physical DMG%',
  FIGHT_PROP_FIRE_ADD_HURT: 'Pyro DMG%',
  FIGHT_PROP_ELEC_ADD_HURT: 'Electro DMG%',
  FIGHT_PROP_WATER_ADD_HURT: 'Hydro DMG%',
  FIGHT_PROP_GRASS_ADD_HURT: 'Dendro DMG%',
  FIGHT_PROP_WIND_ADD_HURT: 'Anemo DMG%',
  FIGHT_PROP_ROCK_ADD_HURT: 'Geo DMG%',
  FIGHT_PROP_ICE_ADD_HURT: 'Cryo DMG%',
}

const EQUIP_TYPE_MAP: Record<string, ArtifactSlot> = {
  EQUIP_BRACER: 'flower',
  EQUIP_NECKLACE: 'feather',
  EQUIP_SHOES: 'sands',
  EQUIP_RING: 'goblet',
  EQUIP_DRESS: 'circlet',
}

// Skill depot → element mapping for common characters
const SKILL_DEPOT_ELEMENT_MAP: Record<number, Element> = {
  // Pyro depots
  701: 'Pyro', 1401: 'Pyro',
  // Hydro
  601: 'Hydro', 1301: 'Hydro',
  // Anemo
  401: 'Anemo', 901: 'Anemo',
  // Electro
  801: 'Electro', 1501: 'Electro',
  // Dendro
  1601: 'Dendro',
  // Cryo
  301: 'Cryo', 1001: 'Cryo',
  // Geo
  1101: 'Geo', 1201: 'Geo',
}

// Real loc.json from Enka has structure: { "EN": { "hash": "name" }, "CHS": {...}, ... }
const locEN: Record<string, string> =
  ((loc as Record<string, unknown>)['EN'] ?? (loc as Record<string, unknown>)['en']) as Record<string, string> ?? (loc as Record<string, string>)

function lookupText(hash: string | number): string {
  const key = String(hash)
  return locEN[key] ?? key
}

function getCharacterMeta(avatarId: number): {
  name: string
  element: Element
  rarity: 4 | 5
  iconName: string
} | null {
  const charData = (characters as Record<string, unknown>)[String(avatarId)]
  if (!charData || typeof charData !== 'object') return null

  const data = charData as Record<string, unknown>
  const nameHash = data['NameTextMapHash']
  const element = String(data['Element'] ?? '')
  const qualityType = String(data['QualityType'] ?? '')
  const iconName = String(data['SideIconName'] ?? '')

  const elementMap: Record<string, Element> = {
    Fire: 'Pyro', Water: 'Hydro', Wind: 'Anemo',
    Electric: 'Electro', Grass: 'Dendro', Ice: 'Cryo', Rock: 'Geo',
  }

  return {
    name: nameHash ? lookupText(String(nameHash)) : `Character ${avatarId}`,
    element: elementMap[element] ?? 'Pyro',
    rarity: qualityType === 'QUALITY_ORANGE' ? 5 : 4,
    iconName: iconName.replace('UI_AvatarIcon_Side_', 'UI_AvatarIcon_'),
  }
}

function parseArtifact(item: EnkaEquipItem): Artifact | null {
  if (item.flat.itemType !== 'ITEM_RELIQUARY') return null
  if (!item.reliquary || !item.flat.equipType) return null

  const slotType = EQUIP_TYPE_MAP[item.flat.equipType]
  if (!slotType) return null

  const mainStatPropId = item.flat.reliquaryMainstat?.mainPropId ?? ''
  const mainStatType = RELIQUARY_MAIN_PROP_MAP[mainStatPropId] ?? 'HP'

  const mainStat: StatValue = {
    stat: mainStatType,
    value: item.flat.reliquaryMainstat?.statValue ?? 0,
  }

  const subStats: StatValue[] = (item.flat.reliquarySubstats ?? []).map((sub) => ({
    stat: RELIQUARY_MAIN_PROP_MAP[sub.appendPropId] ?? 'HP',
    value: sub.statValue,
  }))

  const setHash = item.flat.setNameTextMapHash ?? ''

  return {
    id: String(item.itemId),
    setId: setHash,
    setName: lookupText(setHash),
    slotType,
    rarity: item.flat.rankLevel,
    level: item.reliquary.level - 1,
    mainStat,
    subStats,
  }
}

function parseWeapon(item: EnkaEquipItem): Weapon | null {
  if (item.flat.itemType !== 'ITEM_WEAPON') return null
  if (!item.weapon) return null

  const weaponStats = item.flat.weaponStat ?? []
  const baseATKStat = weaponStats.find((s) => s.propType === 'FIGHT_PROP_BASE_ATTACK')
  const subStatEntry = weaponStats.find((s) => s.propType !== 'FIGHT_PROP_BASE_ATTACK')

  const refinement = item.weapon.affixMap
    ? (Object.values(item.weapon.affixMap)[0] ?? 0) + 1
    : 1

  return {
    id: String(item.itemId),
    name: lookupText(item.flat.nameTextMapHash),
    type: 'Sword' as WeaponType, // Requires weapon type lookup table for accuracy
    rarity: item.flat.rankLevel,
    level: item.weapon.level,
    ascension: item.weapon.promoteLevel ?? 0,
    refinement,
    baseATK: baseATKStat?.statValue ?? 0,
    subStat: subStatEntry
      ? {
          stat: RELIQUARY_MAIN_PROP_MAP[subStatEntry.propType] ?? 'ATK%',
          value: subStatEntry.statValue,
        }
      : undefined,
  }
}

function parseTotalStats(fightPropMap: Record<string, number>): StatBlock {
  return {
    hp: fightPropMap['2000'] ?? 0,
    atk: fightPropMap['2001'] ?? 0,
    def: fightPropMap['2002'] ?? 0,
    em: fightPropMap['28'] ?? 0,
    er: fightPropMap['23'] ?? 1,
    cr: fightPropMap['20'] ?? 0.05,
    cd: fightPropMap['22'] ?? 0.5,
    elementalDmgBonus: Math.max(
      fightPropMap['40'] ?? 0,
      fightPropMap['41'] ?? 0,
      fightPropMap['42'] ?? 0,
      fightPropMap['43'] ?? 0,
      fightPropMap['44'] ?? 0,
      fightPropMap['45'] ?? 0,
      fightPropMap['46'] ?? 0,
    ),
    healingBonus: fightPropMap['26'] ?? 0,
  }
}

function parseTalents(
  skillLevelMap: Record<string, number>,
  skillDepotId: number,
): TalentLevels {
  const levels = Object.values(skillLevelMap)
  return {
    normal: levels[0] ?? 1,
    skill: levels[1] ?? 1,
    burst: levels[2] ?? 1,
  }
}

export function parseEnkaAvatar(avatarInfo: EnkaAvatarInfo): Character | null {
  const meta = getCharacterMeta(avatarInfo.avatarId)

  const level = parseInt(avatarInfo.propMap['4001']?.val ?? '1', 10)
  const ascension = parseInt(avatarInfo.propMap['1002']?.val ?? '0', 10)
  const friendship = avatarInfo.fetterInfo?.expLevel ?? 1
  const constellation = avatarInfo.talentIdList?.length ?? 0

  const artifacts: Artifact[] = []
  let weapon: Weapon | null = null

  for (const item of avatarInfo.equipList) {
    if (item.flat.itemType === 'ITEM_RELIQUARY') {
      const artifact = parseArtifact(item)
      if (artifact) artifacts.push(artifact)
    } else if (item.flat.itemType === 'ITEM_WEAPON') {
      weapon = parseWeapon(item)
    }
  }

  if (!weapon) return null

  const talents = parseTalents(avatarInfo.skillLevelMap, avatarInfo.skillDepotId)
  const totalStats = parseTotalStats(avatarInfo.fightPropMap)

  const iconName = meta?.iconName ?? ''

  return {
    id: String(avatarInfo.avatarId),
    name: meta?.name ?? `Character ${avatarInfo.avatarId}`,
    element: meta?.element ?? 'Pyro',
    rarity: meta?.rarity ?? 4,
    level,
    ascension,
    constellation,
    friendship,
    talents,
    weapon,
    artifacts,
    totalStats,
    iconUrl: iconName ? `${ENKA_CDN}/${iconName}.png` : undefined,
  }
}

export function parseEnkaResponse(
  avatarInfoList: EnkaAvatarInfo[],
): Character[] {
  return avatarInfoList
    .map(parseEnkaAvatar)
    .filter((c): c is Character => c !== null)
}

export interface EnkaRawResponse {
  playerInfo: EnkaPlayerInfo
  avatarInfoList: EnkaAvatarInfo[]
  ttl: number
  uid: string
}

export interface EnkaPlayerInfo {
  nickname: string
  level: number
  signature?: string
  worldLevel?: number
  nameCardId: number
  finishAchievementNum?: number
  towerFloorIndex?: number
  towerLevelIndex?: number
  showAvatarInfoList?: { avatarId: number; level: number }[]
  showNameCardIdList?: number[]
  profilePicture?: { avatarId?: number; costumeId?: number; id?: number }
}

export interface EnkaAvatarInfo {
  avatarId: number
  propMap: Record<string, { type: number; ival?: string; val?: string }>
  talentIdList?: number[]
  fightPropMap: Record<string, number>
  skillDepotId: number
  inherentProudSkillList: number[]
  skillLevelMap: Record<string, number>
  equipList: EnkaEquipItem[]
  fetterInfo?: { expLevel: number }
  costumeId?: number
}

export interface EnkaEquipItem {
  itemId: number
  reliquary?: {
    level: number
    mainPropId: number
    appendPropIdList: number[]
  }
  weapon?: {
    level: number
    promoteLevel?: number
    affixMap?: Record<string, number>
  }
  flat: EnkaFlatData
}

export interface EnkaFlatData {
  nameTextMapHash: string
  setNameTextMapHash?: string
  rankLevel: number
  itemType: 'ITEM_RELIQUARY' | 'ITEM_WEAPON'
  icon: string
  equipType?: string
  weaponStats?: Array<{ appendPropId: string; statValue: number }>
  reliquaryMainstat?: { mainPropId: string; statValue: number }
  reliquarySubstats?: Array<{ appendPropId: string; statValue: number }>
}

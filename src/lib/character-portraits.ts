import characters from '@/data/enka-store/characters.json'

const ENKA_CDN = 'https://enka.network/ui'

interface CharacterCostumeMeta {
  icon?: string
  sideIconName?: string
}

interface CharacterStoreMeta {
  SideIconName?: string
  Costumes?: Record<string, CharacterCostumeMeta>
}

function sideIconToAvatarIcon(assetName?: string): string | undefined {
  if (!assetName) {
    return undefined
  }

  return assetName.replace('UI_AvatarIcon_Side_', 'UI_AvatarIcon_')
}

function toCdnUrl(assetName?: string): string | undefined {
  if (!assetName) {
    return undefined
  }

  return `${ENKA_CDN}/${assetName}.png`
}

export function getCharacterPortraitUrl(
  characterId: string,
  costumeId?: number,
  fallbackUrl?: string,
): string | undefined {
  const meta = (characters as Record<string, CharacterStoreMeta>)[characterId]

  if (!meta) {
    return fallbackUrl
  }

  if (costumeId) {
    const costume = meta.Costumes?.[String(costumeId)]
    const costumePortrait =
      toCdnUrl(costume?.icon) ??
      toCdnUrl(sideIconToAvatarIcon(costume?.sideIconName)) ??
      toCdnUrl(costume?.sideIconName)

    if (costumePortrait) {
      return costumePortrait
    }
  }

  return toCdnUrl(sideIconToAvatarIcon(meta.SideIconName)) ?? toCdnUrl(meta.SideIconName) ?? fallbackUrl
}

# Enka Parser Documentation

> Reference for `src/lib/enka-parser.ts` — parsing the raw Enka Network REST API response into app types.

## Why a custom parser?

The `enka-network-api` npm package depends on Node.js-only modules (`fs`, `path`, `unzipper`) and is incompatible with React Native's Hermes runtime. We call the Enka REST API directly via `fetch()` and parse the response ourselves.

---

## API Response Shape

Single endpoint: `GET https://enka.network/api/uid/{UID}`

```json
{
  "playerInfo": { "nickname": "...", "level": 60 },
  "avatarInfoList": [ ...up to 8 characters ],
  "ttl": 60
}
```

Each entry in `avatarInfoList` has:
- `avatarId` — numeric character ID
- `propMap` — character level, ascension as raw values
- `fightPropMap` — final computed stats (HP, ATK, CR%, etc.) keyed by numeric prop ID
- `equipList` — array of equipped items (artifacts + weapon)
- `skillLevelMap` — talent levels
- `talentIdList` — constellation unlock IDs
- `fetterInfo.expLevel` — friendship level

Each item in `equipList` has a `flat` object with:
- `itemType` — `"ITEM_RELIQUARY"` (artifact) or `"ITEM_WEAPON"`
- `icon` — asset name used for CDN image URL and ID extraction
- `nameTextMapHash` — hash for item name lookup in `loc.json`

---

## Bundled Lookup Tables (`src/data/enka-store/`)

| File | Key | Value | Notes |
|------|-----|-------|-------|
| `avatars.json` | `avatarId` (string) | character metadata | Element, WeaponType, SideIconName, NameTextMapHash. Use `store/gi/avatars.json` — more up to date than the old `characters.json` |
| `locs.json` | textMapHash (string) | localized string | From `store/gi/locs.json`. Structure: `{ "en": { "hash": "name" } }` — use lowercase `"en"`. Must match the same `store/gi/` version as `avatars.json` and `weapons.json` |
| `weapons.json` | `itemId` (string) | weapon metadata | NameTextMapHash, WeaponType (numeric), Icon. From `store/gi/weapons.json` |

**Update all three manually when a new Genshin patch drops.**

---

## Lookup Strategies

### Character names
`characters.json[avatarId].NameTextMapHash` → `loc.json["en"][hash]`

### Character icon URL
`characters.json[avatarId].SideIconName` with `"UI_AvatarIcon_Side_"` stripped → `https://enka.network/ui/{iconName}.png`

### Artifact set names
**Do NOT use `flat.setNameTextMapHash`** — it frequently drifts from the bundled `loc.json` across game patches.

Instead, extract the numeric set ID from the artifact icon name:
```
flat.icon = "UI_RelicIcon_15002_4"
                          └──── split("_")[2] = "15002"
```
Then look up in `src/data/artifact-sets.json` (manually maintained `setId → setName` map).

### Artifact / weapon image URLs
```
https://enka.network/ui/{flat.icon}.png
```
Works for both artifacts and weapons directly.

### Weapon names
Two-step lookup via `weapons.json` as a bridge:
```
item.itemId → weapons.json[itemId].NameTextMapHash → loc.json["en"][hash]
```

**Hash offset caveat:** `weapons.json` hashes sometimes differ from `loc.json` keys by ±512 due to version skew between the two store files. Resolution order:
```typescript
locEN[String(hash)] ?? locEN[String(hash + 512)] ?? locEN[String(hash - 512)]
```

### Weapon type
Not present on the equip item itself. Read from `characters.json[avatarId].WeaponType`:

| Raw value | Mapped type |
|-----------|-------------|
| `WEAPON_SWORD_ONE_HAND` | `"Sword"` |
| `WEAPON_CLAYMORE` | `"Claymore"` |
| `WEAPON_POLE` | `"Polearm"` |
| `WEAPON_BOW` | `"Bow"` |
| `WEAPON_CATALYST` | `"Catalyst"` |

---

## Artifact Parsing

`flat` fields for `ITEM_RELIQUARY`:
- `equipType` — slot (`EQUIP_BRACER` → `"flower"`, `EQUIP_NECKLACE` → `"feather"`, `EQUIP_SHOES` → `"sands"`, `EQUIP_RING` → `"goblet"`, `EQUIP_DRESS` → `"circlet"`)
- `reliquaryMainstat.mainPropId` — main stat key (e.g. `FIGHT_PROP_CRITICAL`)
- `reliquaryMainstat.statValue` — main stat value
- `reliquarySubstats[].appendPropId` — substat key
- `reliquarySubstats[].statValue` — substat value
- `rankLevel` — rarity (4 or 5)
- `reliquary.level` — stored as 1-indexed; subtract 1 for display (level 21 = +20)

---

## Weapon Parsing

`flat` fields for `ITEM_WEAPON`:
- `weaponStats` (plural — NOT `weaponStat`) — array of stat entries
  - Each entry: `{ appendPropId: string, statValue: number }`
  - Base ATK: `appendPropId === "FIGHT_PROP_BASE_ATTACK"`
  - Substat: any other `appendPropId`
- `weapon.affixMap` — refinement level stored as 0-indexed; add 1 for display

---

## Stat Prop ID Map (`fightPropMap`)

| Prop ID | Stat |
|---------|------|
| `2000` | HP (final) |
| `2001` | ATK (final) |
| `2002` | DEF (final) |
| `28` | Elemental Mastery |
| `23` | Energy Recharge |
| `20` | Crit Rate |
| `22` | Crit DMG |
| `26` | Healing Bonus |
| `30` | Physical DMG% |
| `40` | Pyro DMG% |
| `41` | Electro DMG% |
| `42` | Hydro DMG% |
| `43` | Dendro DMG% |
| `44` | Anemo DMG% |
| `45` | Geo DMG% |
| `46` | Cryo DMG% |

---

## Patch Update Checklist

When a new Genshin Impact patch drops:
- [ ] Re-download `src/data/enka-store/avatars.json` from `store/gi/avatars.json` in Enka API-docs repo
- [ ] Re-download `src/data/enka-store/locs.json` from `store/gi/locs.json` in Enka API-docs repo
- [ ] Re-download `src/data/enka-store/weapons.json` from Enka API-docs repo (`gi/weapons.json`)
- [ ] Re-download `src/data/enka-store/relics.json` from `store/gi/relics.json` in Enka API-docs repo
- [ ] Regenerate `src/data/artifact-sets.json` by running: `curl store/gi/relics.json | python3 -c "import json,sys; relics=json.load(sys.stdin); locs=json.load(open('src/data/enka-store/locs.json')); en=locs.get('en',locs); print(json.dumps({k: en[str(v['Name'])] for k,v in relics['Sets'].items() if str(v['Name']) in en}, indent=2))" > src/data/artifact-sets.json`

#!/usr/bin/env node
/**
 * Interactive CLI to import a community build guide into recommended-builds.json.
 * Usage: npm run import-guide
 */
import * as readline from 'readline'
import * as fs from 'fs'
import * as path from 'path'

// ── Types (inlined to avoid @/ alias issues in Node) ─────────────────────────

type StatType =
  | 'HP' | 'HP%' | 'ATK' | 'ATK%' | 'DEF' | 'DEF%'
  | 'EM' | 'ER%' | 'CR%' | 'CD%' | 'Healing%'
  | 'Pyro DMG%' | 'Hydro DMG%' | 'Anemo DMG%'
  | 'Electro DMG%' | 'Dendro DMG%' | 'Cryo DMG%'
  | 'Geo DMG%' | 'Physical DMG%'

type TalentKey = 'normal' | 'skill' | 'burst'
type Tier = 'S' | 'A' | 'B'

interface ArtifactSetOption {
  sets: { setId: string; setName: string; pieces: 2 | 4 }[]
  label: string
  tier: Tier
}

interface WeaponRecommendation {
  weaponId: string
  weaponName: string
  refinement?: string
  tier: Tier
  note?: string
}

interface RecommendedBuild {
  characterId: string
  characterName: string
  role: string
  artifactSets: ArtifactSetOption[]
  mainStats: { sands: StatType[]; goblet: StatType[]; circlet: StatType[] }
  substatPriority: StatType[]
  goalStats?: Partial<Record<StatType, number>>
  talentPriority?: TalentKey[]
  weapons: WeaponRecommendation[]
  notes?: string
  source: string
  lastUpdated: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const VALID_STATS: StatType[] = [
  'HP', 'HP%', 'ATK', 'ATK%', 'DEF', 'DEF%', 'EM', 'ER%', 'CR%', 'CD%',
  'Healing%', 'Pyro DMG%', 'Hydro DMG%', 'Anemo DMG%', 'Electro DMG%',
  'Dendro DMG%', 'Cryo DMG%', 'Geo DMG%', 'Physical DMG%',
]

const VALID_TALENTS: TalentKey[] = ['normal', 'skill', 'burst']
const VALID_TIERS: Tier[] = ['S', 'A', 'B']

const BUILDS_PATH = path.resolve(__dirname, '../src/data/recommended-builds.json')

// ── Readline helpers ──────────────────────────────────────────────────────────

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

function ask(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, (ans) => resolve(ans.trim())))
}

async function askRequired(question: string): Promise<string> {
  let val = ''
  while (!val) {
    val = await ask(question)
    if (!val) console.log('  (required, cannot be empty)')
  }
  return val
}

async function askOneOf<T extends string>(question: string, valid: T[]): Promise<T> {
  const hint = `[${valid.join('/')}]`
  let val = '' as T
  while (!VALID_TIERS.includes(val as Tier) && !valid.includes(val)) {
    const raw = await ask(`${question} ${hint}: `)
    if (valid.includes(raw as T)) {
      val = raw as T
    } else {
      console.log(`  Must be one of: ${valid.join(', ')}`)
    }
  }
  return val
}

function parseStats(raw: string): StatType[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s): s is StatType => {
      if (!s) return false
      if (!VALID_STATS.includes(s as StatType)) {
        console.log(`  Warning: "${s}" is not a recognized StatType — included anyway`)
      }
      return true
    })
}

function parseGoalStats(raw: string): Partial<Record<StatType, number>> | undefined {
  if (!raw) return undefined
  const result: Partial<Record<StatType, number>> = {}
  for (const pair of raw.split(',')) {
    const [key, val] = pair.split('=').map((s) => s.trim())
    if (!key || !val) continue
    const num = parseFloat(val)
    if (isNaN(num)) {
      console.log(`  Warning: "${val}" is not a number for stat "${key}" — skipped`)
      continue
    }
    result[key as StatType] = num
  }
  return Object.keys(result).length > 0 ? result : undefined
}

// ── Section prompts ───────────────────────────────────────────────────────────

async function promptCharacterInfo() {
  console.log('\n── Character Info ───────────────────────────────────────────')
  const characterId = await askRequired('  Character ID (Enka avatarId, e.g. 10000073): ')
  const characterName = await askRequired('  Character Name: ')
  const role = await askRequired('  Role (e.g. "Sub-DPS / Support"): ')
  return { characterId, characterName, role }
}

async function promptArtifactSets(): Promise<ArtifactSetOption[]> {
  console.log('\n── Artifact Sets ────────────────────────────────────────────')
  const sets: ArtifactSetOption[] = []
  let addMore = true
  let idx = 1

  while (addMore) {
    console.log(`\n  Set option ${idx}:`)
    const label = await askRequired('    Label (e.g. "Best in Slot", "Alternative"): ')
    const tier = await askOneOf('    Tier', VALID_TIERS)

    const pieces: { setId: string; setName: string; pieces: 2 | 4 }[] = []
    let addPiece = true
    let pieceIdx = 1

    while (addPiece) {
      console.log(`    Piece group ${pieceIdx}:`)
      const setName = await askRequired('      Set Name: ')
      const setId = await askRequired('      Set ID (number from Enka, or slug): ')
      const piecesRaw = await askOneOf('      Pieces', ['2', '4'] as const)
      pieces.push({ setId, setName, pieces: parseInt(piecesRaw) as 2 | 4 })

      const more = await ask('    Add another piece group to this option? (y/N): ')
      addPiece = more.toLowerCase() === 'y'
      pieceIdx++
    }

    sets.push({ sets: pieces, label, tier })

    const more = await ask('\n  Add another artifact set option? (y/N): ')
    addMore = more.toLowerCase() === 'y'
    idx++
  }

  return sets
}

async function promptMainStats() {
  console.log('\n── Main Stats ───────────────────────────────────────────────')
  console.log(`  Valid stats: ${VALID_STATS.join(', ')}`)
  const sandsRaw = await askRequired('  Sands (comma-separated, first = most preferred): ')
  const gobletRaw = await askRequired('  Goblet: ')
  const circletRaw = await askRequired('  Circlet: ')
  return {
    sands: parseStats(sandsRaw),
    goblet: parseStats(gobletRaw),
    circlet: parseStats(circletRaw),
  }
}

async function promptSubstatPriority(): Promise<StatType[]> {
  console.log('\n── Substat Priority ─────────────────────────────────────────')
  const raw = await askRequired('  Priority order (comma-separated, e.g. "CR%, CD%, ATK%"): ')
  return parseStats(raw)
}

async function promptGoalStats() {
  console.log('\n── Goal Stats (optional) ────────────────────────────────────')
  console.log('  Format: "ATK=2000, CR%=45, CD%=200" — press Enter to skip')
  const raw = await ask('  Goal stats: ')
  return parseGoalStats(raw)
}

async function promptTalentPriority(): Promise<TalentKey[] | undefined> {
  console.log('\n── Talent Priority (optional) ───────────────────────────────')
  console.log('  Format: "skill, burst, normal" — press Enter to skip')
  const raw = await ask('  Talent priority: ')
  if (!raw) return undefined
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s): s is TalentKey => {
      if (!VALID_TALENTS.includes(s as TalentKey)) {
        console.log(`  Warning: "${s}" is not a valid talent key — skipped`)
        return false
      }
      return true
    })
}

async function promptWeapons(): Promise<WeaponRecommendation[]> {
  console.log('\n── Weapons ──────────────────────────────────────────────────')
  const weapons: WeaponRecommendation[] = []
  let addMore = true
  let idx = 1

  while (addMore) {
    console.log(`\n  Weapon ${idx}:`)
    const weaponName = await askRequired('    Name: ')
    const weaponId = await askRequired('    ID (number or slug): ')
    const refinement = await ask('    Refinement (e.g. R1, R5 — press Enter to skip): ')
    const tier = await askOneOf('    Tier', VALID_TIERS)
    const note = await ask('    Note (optional — press Enter to skip): ')

    weapons.push({
      weaponId,
      weaponName,
      ...(refinement ? { refinement } : {}),
      tier,
      ...(note ? { note } : {}),
    })

    const more = await ask('\n  Add another weapon? (y/N): ')
    addMore = more.toLowerCase() === 'y'
    idx++
  }

  return weapons
}

async function promptMeta() {
  console.log('\n── Notes & Source ───────────────────────────────────────────')
  const notes = await ask('  Notes (optional — press Enter to skip): ')
  const source = await askRequired('  Source (e.g. "Game8", "KQM"): ')
  return { notes: notes || undefined, source }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗')
  console.log('║       Paimon Planner — Build Guide Importer                 ║')
  console.log('╚══════════════════════════════════════════════════════════════╝')

  const { characterId, characterName, role } = await promptCharacterInfo()
  const artifactSets = await promptArtifactSets()
  const mainStats = await promptMainStats()
  const substatPriority = await promptSubstatPriority()
  const goalStats = await promptGoalStats()
  const talentPriority = await promptTalentPriority()
  const weapons = await promptWeapons()
  const { notes, source } = await promptMeta()

  const today = new Date().toISOString().slice(0, 10)

  const build: RecommendedBuild = {
    characterId,
    characterName,
    role,
    artifactSets,
    mainStats,
    substatPriority,
    ...(goalStats ? { goalStats } : {}),
    ...(talentPriority ? { talentPriority } : {}),
    weapons,
    ...(notes ? { notes } : {}),
    source,
    lastUpdated: today,
  }

  console.log('\n── Preview ──────────────────────────────────────────────────')
  console.log(JSON.stringify(build, null, 2))

  const confirm = await ask('\n  Append this build to recommended-builds.json? (y/N): ')
  if (confirm.toLowerCase() !== 'y') {
    console.log('  Aborted. Nothing was written.')
    rl.close()
    return
  }

  const existing: RecommendedBuild[] = JSON.parse(fs.readFileSync(BUILDS_PATH, 'utf-8'))

  const dupeIdx = existing.findIndex(
    (b) => b.characterId === characterId && b.role === role
  )
  if (dupeIdx !== -1) {
    const overwrite = await ask(
      `  A build for "${characterName}" (${role}) already exists. Overwrite? (y/N): `
    )
    if (overwrite.toLowerCase() === 'y') {
      existing[dupeIdx] = build
      console.log('  Overwritten.')
    } else {
      console.log('  Aborted. Existing build was not changed.')
      rl.close()
      return
    }
  } else {
    existing.push(build)
    console.log(`  Appended. Total builds: ${existing.length}`)
  }

  fs.writeFileSync(BUILDS_PATH, JSON.stringify(existing, null, 2) + '\n', 'utf-8')
  console.log(`\n  Saved to ${BUILDS_PATH}`)

  rl.close()
}

main().catch((err) => {
  console.error(err)
  rl.close()
  process.exit(1)
})

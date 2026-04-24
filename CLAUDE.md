# CLAUDE.md — Paimon Planner

> A personal Genshin Impact companion app to view your current character builds (via Enka.Network), compare them against community-recommended builds, and track farming goals.

---

## Project Overview

**Name:** Paimon Planner
**Type:** Mobile app (React Native / Expo)
**Purpose:** Fetch live character build data from Enka.Network using UID, display artifact/weapon/stat details, compare against curated community build guides, and provide a gap analysis + farm planner.
**Target Platform:** Android first (primary dev device), iOS later
**Developer:** Single developer, frontend background (TypeScript, React, Next.js Pages Router). This is a learning project for React Native.

---

## Tech Stack

| Layer              | Tool                                              |
| ------------------ | ------------------------------------------------- |
| Framework          | Expo SDK 55 (managed workflow)                    |
| Routing            | Expo Router v4 (file-based)                       |
| Language           | TypeScript (strict mode)                          |
| State Management   | Zustand                                           |
| Server State       | TanStack Query (React Query) v5                   |
| Local Storage      | expo-sqlite (for structured data + caching)       |
| Styling            | Tamagui                                           |
| Package Manager    | pnpm                                              |
| Linting/Formatting | ESLint + Prettier (Expo default config)           |
| Testing            | Jest + React Native Testing Library (later phase) |

### Why These Choices

- **Expo managed workflow** — No Xcode/Android Studio setup pain. Use Expo Go for development, EAS Build for production.
- **Expo Router** — File-based routing, similar mental model to Next.js Pages Router. Familiar territory.
- **Zustand** — Lightweight, no boilerplate, already familiar from web projects.
- **TanStack Query** — Handles Enka API caching, stale-while-revalidate, retry logic, and TTL-based refetching out of the box.
- **expo-sqlite** — Better than AsyncStorage for structured relational data (characters, artifacts, builds). Synchronous reads, good for offline-first.
- **Tamagui** — React Native component library.

---

## Data Sources

### 1. Enka.Network API (Live Player Data)

- **Endpoint:** `https://enka.network/api/uid/{UID}`
- **Auth:** None (public, read-only)
- **Rate Limit:** Dynamic. Responses include a `ttl` field (seconds until next fresh fetch). Cache data locally and respect TTL.
- **Data returned:** `playerInfo` (profile) + `avatarInfoList` (showcased characters with full artifact, weapon, constellation, and stat data)
- **Limitation:** Only returns characters in the player's **Character Showcase** (max 8 characters). Player must set showcase to public in-game.
- **User-Agent:** Set a custom User-Agent header: `PaimonPlanner/1.0.0`
- **Error codes:** 400 (bad UID format), 404 (player not found), 424 (game maintenance), 429 (rate limited), 500/503 (server error)
- **Reference:** https://github.com/EnkaNetwork/API-docs/blob/master/api.md

### 2. genshin.dev / Static Game Data

- **Endpoint:** `https://genshin.jmp.blue`
- **Auth:** None
- **Data:** Characters (base stats, elements, rarity), weapons, artifacts (set names, set bonuses), materials, domains
- **Usage:** Populate reference UI — set bonus descriptions, base character info, material icons. Bundle or cache aggressively since this data changes only on game patches.

### 3. Community Build Guides (User-Managed Local Data)

- **Storage:** SQLite database (via expo-sqlite), NOT bundled JSON files. All build data is created and managed by the user through the in-app Build Editor UI.
- **Structure:** Per-character recommended builds — best artifact sets, main stats per slot, substat priority, weapon tier list, team comp suggestions
- **Data entry:** User manually inputs recommended builds via a dedicated Build Editor screen. The app ships with an empty build database — the user curates their own based on community guides (KQM, Genshin Helper Team, etc.)
- **Why local-first:** Avoids licensing/scraping issues with community guides, gives the user full control, and teaches CRUD + SQLite patterns in React Native.
- **Future option:** Export/import build configs as JSON for sharing or backup. Optionally serve from a remote JSON endpoint on VPS for cross-device sync later.

### Important: No `enka-network-api` npm wrapper

The `enka-network-api` npm package (by yuko1101) is **NOT compatible with React Native**. It depends on Node.js-only modules (`fs`, `path`, `unzipper`, `yauzl`) for its filesystem-based cache manager. These modules don't exist in React Native's Hermes runtime.

**Use direct `fetch()` calls to the Enka REST API instead.** The raw API is simple (one main endpoint), and we build our own parser (`enka-parser.ts`) to map numeric IDs to readable data using bundled static lookup tables from Enka's `store/` JSON files.

---

## App Architecture

### Directory Structure

```
paimon-planner/
├── app/                          # Expo Router file-based routes
│   ├── _layout.tsx               # Root layout (providers, global nav)
│   ├── (tabs)/                   # Tab navigator group
│   │   ├── _layout.tsx           # Tab bar layout
│   │   ├── index.tsx             # Home / Dashboard (character grid)
│   │   ├── builds.tsx            # Build Guide Manager (list all custom builds)
│   │   ├── farm.tsx              # Farm Planner
│   │   └── settings.tsx          # Settings (UID, preferences)
│   ├── character/
│   │   └── [id].tsx              # Character Detail (dynamic route)
│   └── build-editor/
│       ├── index.tsx             # Build Editor — select character
│       └── [characterId].tsx     # Build Editor — edit build for character
├── src/
│   ├── api/                      # API layer
│   │   ├── enka.ts               # Enka.Network API client
│   │   ├── genshin-dev.ts        # genshin.dev static data fetcher
│   │   └── types.ts              # API response types
│   ├── components/               # Shared UI components
│   │   ├── ui/                   # Generic reusable (Button, Card, Badge, Modal, etc.)
│   │   ├── character/            # Character-specific components
│   │   │   ├── CharacterCard.tsx
│   │   │   ├── ArtifactSlot.tsx
│   │   │   ├── StatBar.tsx
│   │   │   ├── WeaponCard.tsx
│   │   │   └── BuildComparison.tsx
│   │   ├── build-editor/         # Build guide editor components
│   │   │   ├── ArtifactSetPicker.tsx
│   │   │   ├── MainStatSelector.tsx
│   │   │   ├── SubstatPriorityList.tsx  # Drag-to-reorder substat priority
│   │   │   ├── WeaponTierEditor.tsx
│   │   │   └── BuildPreview.tsx
│   │   └── farm/                 # Farm planner components
│   │       ├── DomainCard.tsx
│   │       └── MaterialList.tsx
│   ├── data/                     # Bundled static reference data (game data, NOT user builds)
│   │   ├── enka-store/           # Enka lookup tables (characters.json, loc.json, etc.)
│   │   ├── character-materials.json # Curated character farm requirements + ascension stages
│   │   ├── farm-sources.json     # Domains, bosses, enemy routes, local specialty sources
│   │   └── artifact-sets.json    # Set names + set bonus reference
│   ├── db/                       # SQLite database layer
│   │   ├── schema.ts             # Table definitions (recommended_builds, farm_items)
│   │   ├── builds-repository.ts  # CRUD operations for recommended builds
│   │   └── farm-repository.ts    # CRUD operations for farm checklist
│   ├── hooks/                    # Custom hooks
│   │   ├── useEnkaUser.ts        # TanStack Query hook for Enka fetch
│   │   ├── useCharacterBuild.ts  # Merged current + recommended build
│   │   └── useFarmPlan.ts        # Computed farm checklist
│   ├── lib/                      # Utility functions
│   │   ├── artifact-scorer.ts    # Artifact scoring / grading logic
│   │   ├── stat-calculator.ts    # Stat aggregation from artifacts + weapon
│   │   ├── gap-analysis.ts       # Diff current vs recommended
│   │   ├── farm-data.ts          # Farm planner selectors + day filtering
│   │   ├── character-portraits.ts # Character portrait resolver helpers
│   │   └── enka-parser.ts        # Parse raw Enka response into app types
│   ├── store/                    # Zustand stores
│   │   ├── user-store.ts         # UID, player info, preferences
│   │   ├── build-store.ts        # In-memory cache of builds from SQLite
│   │   └── farm-store.ts         # Farm checklist state (persisted)
│   └── types/                    # App-wide TypeScript types
│       ├── character.ts
│       ├── artifact.ts
│       ├── farm.ts
│       ├── weapon.ts
│       └── build.ts
├── assets/                       # Static assets (fonts, images, icons)
├── CLAUDE.md                     # This file
├── app.json                      # Expo config
├── tsconfig.json
└── package.json
```

### Navigation Structure

```
Root Layout (_layout.tsx)
├── Tab Navigator (tabs/_layout.tsx)
│   ├── Tab 1: Home/Dashboard (tabs/index.tsx)
│   │   └── Push: Character Detail (character/[id].tsx)
│   ├── Tab 2: Build Guides (tabs/builds.tsx)
│   │   └── Push: Build Editor (build-editor/[characterId].tsx)
│   ├── Tab 3: Farm Planner (tabs/farm.tsx)
│   └── Tab 4: Settings (tabs/settings.tsx)
```

---

## Core Types

```typescript
// === Character (merged view) ===
interface Character {
  id: string; // Enka avatarId
  name: string;
  element: Element;
  rarity: 4 | 5;
  level: number;
  ascension: number;
  constellation: number;
  friendship: number;
  talents: TalentLevels;
  weapon: Weapon;
  artifacts: Artifact[]; // length 5 (flower, feather, sands, goblet, circlet)
  totalStats: StatBlock; // Aggregated final stats
}

type Element =
  | "Pyro"
  | "Hydro"
  | "Anemo"
  | "Electro"
  | "Dendro"
  | "Cryo"
  | "Geo";

interface TalentLevels {
  normal: number;
  skill: number;
  burst: number;
}

// === Artifact ===
interface Artifact {
  id: string;
  setId: string;
  setName: string;
  slotType: ArtifactSlot;
  rarity: number; // 4 or 5
  level: number; // 0-20
  mainStat: StatValue;
  subStats: StatValue[]; // 1-4 substats
}

type ArtifactSlot = "flower" | "feather" | "sands" | "goblet" | "circlet";

interface StatValue {
  stat: StatType;
  value: number;
}

type StatType =
  | "HP"
  | "HP%"
  | "ATK"
  | "ATK%"
  | "DEF"
  | "DEF%"
  | "EM"
  | "ER%"
  | "CR%"
  | "CD%"
  | "Healing%"
  | "Pyro DMG%"
  | "Hydro DMG%"
  | "Anemo DMG%"
  | "Electro DMG%"
  | "Dendro DMG%"
  | "Cryo DMG%"
  | "Geo DMG%"
  | "Physical DMG%";

// === Weapon ===
interface Weapon {
  id: string;
  name: string;
  type: WeaponType;
  rarity: number;
  level: number;
  ascension: number;
  refinement: number; // 1-5
  baseATK: number;
  subStat?: StatValue;
}

type WeaponType = "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst";

// === Recommended Build (curated data) ===
interface RecommendedBuild {
  characterId: string;
  characterName: string;
  role: string; // e.g. "Main DPS (Nightsoul)", "Sub DPS", "Support"
  artifactSets: ArtifactSetOption[];
  mainStats: {
    sands: StatType[]; // Preferred main stats, ordered by priority
    goblet: StatType[];
    circlet: StatType[];
  };
  substatPriority: StatType[]; // e.g. ["CR%", "CD%", "ATK%", "EM"]
  weapons: WeaponRecommendation[];
  teamComps?: TeamComp[];
  notes?: string;
  source: string; // "KQM" | "community" | "custom"
  lastUpdated: string; // ISO date
}

interface ArtifactSetOption {
  sets: { setId: string; setName: string; pieces: 2 | 4 }[];
  label: string; // e.g. "Best in Slot", "Alternative"
  tier: "S" | "A" | "B";
}

interface WeaponRecommendation {
  weaponId: string;
  weaponName: string;
  refinement?: string; // e.g. "R1", "R5"
  tier: "S" | "A" | "B";
  note?: string; // e.g. "Best for Nightsoul DPS ceiling"
}

interface TeamComp {
  label: string; // e.g. "Double Pyro Vaporize"
  characters: string[]; // character names
  note?: string;
}

// === Gap Analysis ===
interface GapAnalysis {
  characterId: string;
  overallScore: number; // 0-100
  artifactSetMatch: boolean;
  mainStatMatch: Record<ArtifactSlot, boolean>;
  substatGaps: StatGap[];
  weaponTier: "S" | "A" | "B" | "unranked";
}

interface StatGap {
  stat: StatType;
  current: number;
  recommended: number; // target threshold
  delta: number;
}

// === Farm Plan ===
interface FarmItem {
  id: string;
  characterId: string;
  type:
    | "artifact_domain"
    | "talent_book"
    | "boss_material"
    | "ascension_material";
  name: string;
  domain?: string;
  availableDays?: string[]; // e.g. ["Mon", "Thu", "Sun"]
  completed: boolean;
}

// === Aggregated Stats ===
interface StatBlock {
  hp: number;
  atk: number;
  def: number;
  em: number;
  er: number;
  cr: number;
  cd: number;
  elementalDmgBonus?: number;
  healingBonus?: number;
}
```

---

## Screen Specifications

### Screen 1: Home / Dashboard (`tabs/index.tsx`)

**Purpose:** Overview of all showcased characters from Enka.
**Layout:**

- Top: Player info bar (nickname, AR level, UID)
- Pull-to-refresh to re-fetch from Enka
- Grid of `CharacterCard` components (2 columns)
- Each card shows: character portrait/icon, name, level, constellation count, element badge, and a quick build score badge (percentage match vs recommended)

**Data flow:**

1. On mount / pull-to-refresh → `useEnkaUser(uid)` → TanStack Query fetches `https://enka.network/api/uid/{UID}`
2. Parse raw response with `enka-parser.ts` → array of `Character` objects
3. For each character, compute quick score via `gap-analysis.ts`
4. Cache in TanStack Query (respect `ttl` from response)

**Empty state:** If no UID saved → show prompt to enter UID in Settings tab.
**Error states:** Handle 404 (bad UID), 429 (rate limited → show retry timer), 424 (maintenance).

---

### Screen 2: Character Detail (`character/[id].tsx`)

**Purpose:** Deep dive into one character's build with comparison to recommended.
**Navigation:** Push from Home dashboard card tap.
**Layout:** Scrollable screen with sections:

**Section A — Character Header**

- Character name, element icon, level, constellation stars, friendship level
- Weapon card (name, level, refinement, base ATK, substat)

**Section B — Tab Toggle: "My Build" / "Recommended" / "Compare"**

**"My Build" tab:**

- 5 artifact slot cards in a column or 2+3 grid
  - Each shows: set icon, slot type, level, main stat, 4 substats with roll indicators
- Total stats summary at bottom (CR, CD, ATK, ER, EM, etc.)

**"Recommended" tab:**

- Best artifact set(s) with tier badges
- Main stat recommendations per slot (sands/goblet/circlet)
- Substat priority list (ordered)
- Weapon tier list (S/A/B with notes)
- Team comp suggestions (optional, later phase)
- Source attribution (e.g. "Source: KQM")

**"Compare" tab (Gap Analysis):**

- Side-by-side stat comparison: current vs recommended target
- Color coded: green (meets/exceeds), yellow (close), red (far off)
- Per-artifact-slot breakdown: "Sands main stat: EM ✓" or "Goblet: HP% ✗ (want Anemo DMG%)"
- Overall build score percentage
- Action items: "Farm Obsidian Codex domain for better Sands"

---

### Screen 3: Build Guides Manager (`tabs/builds.tsx`)

**Purpose:** View, create, edit, and delete custom recommended build guides.
**Layout:**

- Top: "My Build Guides" header + "Add Build" FAB button
- List of saved builds grouped by character, each showing: character name, role label, artifact set name, tier badge
- Tap a build → push to Build Editor for editing
- Swipe to delete with confirmation
- Empty state: "No build guides yet. Tap + to add your first one!"

**Data flow:**

1. On mount → read all builds from SQLite via `builds-repository.ts`
2. Display as grouped FlatList
3. FAB → push to `build-editor/index.tsx` (character selector)

---

### Screen 3b: Build Editor (`build-editor/[characterId].tsx`)

**Purpose:** Create or edit a recommended build guide for a specific character.
**Navigation:** Push from Build Guides Manager.
**Layout:** Scrollable form with sections:

**Section 1 — Character & Role**

- Character selector (searchable dropdown from static character list)
- Role text input (e.g. "Main DPS (Nightsoul)", "Sub DPS", "Support")

**Section 2 — Artifact Sets**

- Artifact set picker (searchable dropdown from `artifact-sets.json`)
- Support multiple options: "Best in Slot" (4pc set), "Alternative" (2pc+2pc), etc.
- Tier badge selector per option (S / A / B)

**Section 3 — Main Stats**

- Three slot selectors: Sands, Goblet, Circlet
- Each is a multi-select from valid main stat options for that slot
- Ordered by priority (first = most preferred)

**Section 4 — Substat Priority**

- Drag-to-reorder list of substats (CR%, CD%, ATK%, EM, ER%, HP%, DEF%)
- Top 4 are highlighted as "priority substats"
- Uses `react-native-draggable-flatlist` or similar for reorder UX

**Section 5 — Weapon Ranking**

- Add weapons with tier (S/A/B), refinement note, and optional text note
- Searchable weapon picker from static weapon data
- Reorderable within each tier

**Section 6 — Notes & Source**

- Free text notes field (tips, caveats, team comp notes)
- Source attribution text input (e.g. "KQM", "personal testing")

**Bottom: Save / Cancel buttons**

**Data flow:**

1. If editing → load existing build from SQLite
2. On save → validate required fields → upsert to SQLite via `builds-repository.ts`
3. Navigate back to Build Guides list

---

### Screen 4: Farm Planner (`tabs/farm.tsx`)

**Purpose:** Track what materials/artifacts you still need to farm.
**Layout:**

- Segmented by day of the week (today highlighted)
- List of farmable domains and what they drop
- Linked to characters who need those materials (from gap analysis)
- Checklist with toggle (persisted in SQLite via farm-store)
- Section for weekly bosses

**Data flow:**

1. Read from `materials.json` for domain schedules
2. Cross-reference with gap analysis results to highlight priority domains
3. Checklist state persisted in Zustand → SQLite

---

### Screen 5: Settings (`tabs/settings.tsx`)

**Purpose:** App configuration.
**Fields:**

- UID input (with validation: 9-digit number)
- Server region selector (Asia, America, Europe, TW/HK/MO)
- Theme toggle (light/dark, follow system)
- Language preference (EN default)
- Cache management (clear cached data)
- About section (version, credits, Enka.Network attribution)

---

## Key Implementation Details

### Enka API Integration

```typescript
// src/api/enka.ts
const ENKA_BASE_URL = "https://enka.network/api/uid";
const USER_AGENT = "PaimonPlanner/1.0.0";

async function fetchEnkaUser(uid: string): Promise<EnkaRawResponse> {
  const response = await fetch(`${ENKA_BASE_URL}/${uid}`, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) {
    // Handle specific error codes
    throw new EnkaApiError(response.status);
  }

  return response.json();
}
```

### TanStack Query with TTL

```typescript
// src/hooks/useEnkaUser.ts
function useEnkaUser(uid: string) {
  return useQuery({
    queryKey: ["enka-user", uid],
    queryFn: () => fetchEnkaUser(uid),
    staleTime: (query) => {
      // Use TTL from last response (seconds → ms)
      const ttl = query.state.data?.ttl ?? 60;
      return ttl * 1000;
    },
    enabled: !!uid && uid.length === 9,
    retry: (failureCount, error) => {
      if (error instanceof EnkaApiError && error.status === 429) return false;
      return failureCount < 3;
    },
  });
}
```

### Artifact Scoring Algorithm

Simple weighted scoring based on recommended substats for the character:

1. For each substat on the artifact, check if it's in the character's `substatPriority` list
2. Weight by priority position (1st priority = 4x, 2nd = 3x, 3rd = 2x, 4th = 1x)
3. Multiply by roll value efficiency (actual value / max possible value for that stat at that rarity)
4. Normalize to 0-100 score per artifact
5. Overall build score = average across all 5 artifacts + main stat correctness bonus + set bonus match

### Enka Response Parsing

See **[docs/enka-parser.md](docs/enka-parser.md)** for full parser documentation — API response shape, lookup strategies, known gotchas, and patch update checklist.

### SQLite Schema for Build Guides

```sql
-- Recommended builds (user-curated via Build Editor)
CREATE TABLE IF NOT EXISTS recommended_builds (
  id TEXT PRIMARY KEY,              -- uuid
  character_id TEXT NOT NULL,       -- matches Enka avatarId
  character_name TEXT NOT NULL,
  role TEXT NOT NULL,               -- "Main DPS", "Sub DPS", "Support"
  artifact_sets TEXT NOT NULL,      -- JSON array of ArtifactSetOption[]
  main_stats TEXT NOT NULL,         -- JSON { sands: [], goblet: [], circlet: [] }
  substat_priority TEXT NOT NULL,   -- JSON array of StatType[] ordered by priority
  weapons TEXT NOT NULL,            -- JSON array of WeaponRecommendation[]
  team_comps TEXT,                  -- JSON array of TeamComp[] (nullable)
  notes TEXT,                       -- free text
  source TEXT,                      -- "KQM", "personal", etc.
  created_at TEXT NOT NULL,         -- ISO date
  updated_at TEXT NOT NULL          -- ISO date
);

-- Farm checklist items
CREATE TABLE IF NOT EXISTS farm_items (
  id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL,
  type TEXT NOT NULL,               -- "artifact_domain" | "talent_book" | "boss_material" | etc.
  name TEXT NOT NULL,
  domain TEXT,
  available_days TEXT,              -- JSON array of day strings
  completed INTEGER DEFAULT 0,     -- boolean as int
  created_at TEXT NOT NULL
);
```

**Note:** Complex nested data (artifact sets, weapons, substats) is stored as JSON strings in SQLite columns. This is simpler than fully normalized tables for a personal app, and we can parse with `JSON.parse()` on read. If performance becomes an issue with many builds, normalize later.

### Build Editor Data Flow

```
Build Guides Tab                    Build Editor Screen
┌────────────────┐                 ┌──────────────────────────────┐
│ List all builds│ ── tap ──────→ │ Load build from SQLite       │
│ from SQLite    │                 │ (or empty form for new)      │
│                │                 │                              │
│ + FAB button   │ ── tap ──────→ │ Character picker             │
│                │                 │ → Role input                 │
│ Swipe delete   │                 │ → Artifact set picker        │
└────────────────┘                 │ → Main stat selectors        │
       ▲                           │ → Substat drag-to-reorder    │
       │                           │ → Weapon tier editor         │
       │                           │ → Notes + source             │
       │                           │                              │
       └──────────── save ───────← │ [Save] → upsert to SQLite   │
                                   └──────────────────────────────┘
```

---

## Development Phases

### Phase 1 — Foundation (Week 1-2) ✅ COMPLETE

- [x] Initialize Expo project with TypeScript, Expo Router, Tamagui
- [x] Set up tab navigation (Home, Builds, Farm, Settings)
- [x] Settings screen: UID input + persist to Zustand/SQLite
- [x] Enka API client with direct fetch (no npm wrapper) + response parser
- [x] Bundle Enka lookup tables (characters.json, loc.json for ID → name mapping)
- [x] Home dashboard: fetch + display character grid with basic info

**Phase 1 implementation notes:**

- All Tamagui packages pinned to `1.144.4` — do NOT upgrade selectively or versions will split and break config detection (`npx @tamagui/cli check` to verify)
- `loc.json` from Enka uses lowercase `"en"` key (not `"EN"`) — parser handles both
- `@/*` path alias maps to `./src/*` (updated from the Expo default of `./`)
- Old Expo template files (`components/`, `hooks/`, `constants/` at root) were deleted — they conflicted with the new alias
- `babel.config.js` was created manually (Expo template had none); includes `@tamagui/babel-plugin` and `react-native-reanimated/plugin`
- SQLite schema (`getDatabase()` in `src/db/schema.ts`) is initialized on app mount in `app/_layout.tsx`
- UID is stored in Zustand (in-memory only for now — Phase 2 should persist it to SQLite or AsyncStorage so it survives app restarts)

### Phase 2 — Character Detail (Week 3-4) ✅ COMPLETE

- [x] Persist UID to SQLite or AsyncStorage (survives app restarts)
- [x] Character detail screen (`app/character/[id].tsx`)
- [x] "My Build" tab with full artifact + stat rendering
- [x] Total stat calculator — Enka's `fightPropMap` already provides final aggregated stats (base + weapon + artifacts). `parseTotalStats()` in `enka-parser.ts` maps these directly to `StatBlock`. No local calculation needed.
- [x] Pull-to-refresh on dashboard

### Phase 3 — Recommended Builds & Gap Analysis (Week 5-7) ✅ COMPLETE

**Approach changed:** Replaced SQLite + Build Editor with a bundled `src/data/recommended-builds.json` file. Builds are manually curated from community guides (KQM, Game8) and mapped to the `RecommendedBuild[]` type. Simpler, no CRUD UI needed for a personal app.

- [x] `src/data/recommended-builds.json` — bundled build data (Chasca, Zibai, Nahida entries)
- [x] `src/lib/recommended-builds.ts` — `getBuildsForCharacter()`, `getBuildByRole()`, `getAllBuilds()`
- [x] `src/lib/gap-analysis.ts` — `analyzeGap()` computes artifact set match, main stat match per slot, weapon tier (ID + name fallback), substat coverage, goal stat deltas with decimal→% conversion
- [x] "Recommended" tab — artifact sets with tier badges, main stats, substat priority, goal stats, weapons, talent priority, notes
- [x] "Compare" tab — overall score badge (0–100), artifact set check, main stat check per slot, weapon tier, goal stat delta rows, substat coverage chips
- [x] `RecommendedBuild` type extended with `goalStats` and `talentPriority` fields

**Skipped (intentionally):**
- SQLite schema for recommended builds — not needed with JSON approach
- Build Guides Manager screen — not needed
- Build Editor UI — not needed; paste community guides directly into JSON

### Phase 4 — Farm Planner & Polish (Week 8-9)

- [x] Build Guides tab — read-only viewer of `recommended-builds.json` (character name, role, best set, S-tier weapon). Tap → navigate to character detail with `tab=recommended`.
- [x] Materials/domain data mapping
- [x] Farm planner screen with day-based grouping
- [ ] Checklist persistence
- [ ] Artifact scoring/grading system
- [ ] Error handling polish (empty states, loading skeletons, error boundaries)
- [ ] Dark mode support

**Phase 4 implementation notes:**

- `recommended-builds.json` remains the source of truth for recommendations. Build Guides is read-only and grouped by character, with one row per build role.
- Character detail now accepts an optional `tab` route param: `my-build`, `recommended`, or `compare`.
- Farm planner data is currently curated for the active recommended roster (`Chasca`, `Zibai`, `Nahida`) via `src/data/character-materials.json` and `src/data/farm-sources.json`.
- `src/lib/farm-data.ts` exposes selectors for character materials, related domains, available domains by day, recommended artifact domains, and next ascension stage by current character level.
- The Farm tab uses live Enka showcase data for current character level, constellation, friendship, and portrait, then combines it with the local farm mapping to show:
  - today's open domains
  - tracked characters in showcase
  - next ascension range (e.g. `80-90`) with per-stage material counts
  - today's day-locked farm targets
  - tracked bosses/domains per character
- Character portraits on the Farm tab currently use the same Enka-provided `iconUrl` pattern as the Home `CharacterCard`. Tamagui `Image` rendering was more reliable when width/height were passed directly without extra style-based sizing.
- Recommendation ingestion is still manual for now. A script-assisted importer is a good future improvement, but Phase 4 keeps the JSON hand-curated.

### Phase 5 — Nice to Have (Later)

- [ ] Export/import build guides as JSON (share builds, backup/restore)
- [ ] Wish/pity counter (manual input)
- [ ] Push notifications for domain rotation (today's farmable materials)
- [ ] Multiple UID / account support
- [ ] Share build card as image
- [ ] Team composition builder
- [ ] Remote build guide sync (fetch/push JSON from Contabo VPS)
- [ ] Auto-fetch recommended builds via scraper/API — feed into the same `RecommendedBuild[]` JSON shape so the UI requires no changes
- [ ] Multiple build roles per character (e.g. "Chasca DPS" vs "Chasca Anemo DPS") — already supported by the data model, just needs more JSON entries and a role selector in the UI

---

## Coding Conventions

### General

- **Strict TypeScript** — no `any` types. Use `unknown` + type narrowing when dealing with API responses.
- **Functional components only** — no class components.
- **Named exports** — prefer named over default exports (except for Expo Router pages which require default exports).
- **Barrel exports** — use `index.ts` files in component directories for clean imports.
- **Path aliases** — configure `@/` → `src/` in `tsconfig.json` for clean imports.

### File Naming

- Components: `PascalCase.tsx` (e.g. `CharacterCard.tsx`)
- Hooks: `camelCase.ts` prefixed with `use` (e.g. `useEnkaUser.ts`)
- Utilities: `kebab-case.ts` (e.g. `artifact-scorer.ts`)
- Types: `kebab-case.ts` (e.g. `character.ts`)
- Data files: `kebab-case.json` (e.g. `artifact-sets.json`)

### Component Structure

```typescript
// 1. Imports
// 2. Types/interfaces (component-specific)
// 3. Component function
// 4. Styles use Tamagui
```

### State Management Rules

- **Zustand** for client state (UID, preferences, farm checklist)
- **TanStack Query** for server state (Enka data, static game data)
- **Never mix** — don't put API response data in Zustand. Let TanStack Query own it.
- **Persist** Zustand stores to SQLite for offline access

### Error Handling

- Wrap API calls in try/catch at the hook level
- Use TanStack Query's `error` state for UI error boundaries
- Show user-friendly messages, not raw errors
- Implement retry with exponential backoff for Enka API (respect 429)

### Commit Convention

- Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
- Scope by feature area: `feat(enka): add TTL-based cache invalidation`

---

## Important Notes

- **Enka Showcase Limitation:** The app can ONLY show characters that the user has placed in their in-game Character Showcase (max 8). The app should clearly communicate this to the user and guide them to set up their showcase.
- **Respect Rate Limits:** Always cache responses and honor the `ttl` field. Don't spam the Enka API.
- **Offline First:** Cache the last fetched data locally. The app should work without network for viewing previously fetched builds.
- **No Account Auth:** This app never handles Mihoyo/HoYoverse login credentials. It only uses the public UID-based Enka API.
- **Attribution:** Credit Enka.Network, genshin.dev, and community build guide sources in the app's About section.
- **Game Updates:** When Genshin Impact updates (new characters, artifact sets), the static game data and build guides need manual updates. Plan for this in the data architecture.

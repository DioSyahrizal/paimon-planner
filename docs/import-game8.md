# Importing Game8 Build Guides

Use `import-guide:game8` to convert one or more Game8-style text snippets into app recommendation data.

## Where to put the raw guide file

Place the text file in:

```text
src/data/build-raw/
```

Example:

```text
src/data/build-raw/ayato.txt
```

## How to run the importer

Dry run only:

```bash
npm run import-guide:game8 -- src/data/build-raw/ayato.txt
```

Write changes into `src/data/recommended-builds.json`:

```bash
npm run import-guide:game8 -- src/data/build-raw/ayato.txt --write
```

## Important notes

- The `--` after `npm run import-guide:game8` is required. Without it, npm may swallow flags like `--write`.
- `--write` is required to update `src/data/recommended-builds.json`.
- One raw file can contain multiple builds for the same character.
- Builds are upserted by `characterId + role`.

## Input file format

Each build in the text file should be a full Game8-style block with its own:

- build heading
- role line (optional if the heading already expresses the role cleanly)
- `Best Weapon`
- `Replacement Weapons`
- `Best Artifacts`
- `Artifact Main Stats`
- `Artifact Sub Stats`
- optional goal stat section
- optional talent priority section

If one file contains multiple builds, place the build blocks one after another.

## Example input file

```txt
Ayato Sub-DPS Build
Hydro Sub-DPS
Best Weapon
Mistsplitter Reforged Image Mistsplitter Reforged
Replacement Weapons
1. Skyward Blade Image Skyward Blade
2. Primordial Jade Cutter Image Primordial Jade Cutter
3. Amenoma Kageuchi Image Amenoma Kageuchi
Best Artifacts
Genshin - Emblem of Severed Fate Image Emblem of Severed Fate x4
Artifact Main Stats
Genshin - HourglassSands: ATK% or ER
Genshin - GobletGoblet: Hydro DMG Bonus
Genshin - CircletCirclet: CRIT Rate or CRIT DMG
Artifact Sub Stats
Energy Recharge, CRIT Rate, CRIT DMG, ATK%, HP%

Ayato Goal Stat Values
Stat Goal Value
ATK 2,000
CRIT Rate 70 ~ 80%
CRIT DMG 160% or above
Energy Recharge 100 ~ 130%

Ayato's Talent Priority
Sub-DPS
1st 2nd 3rd
Elemental Burst Elemental Skill Normal Attack


Ayato Hyperbloom Build
Hyperbloom Hydro Applicator
Best Weapon
Skyward Blade Image Skyward Blade
Replacement Weapons
1. Amenoma Kageuchi Image Amenoma Kageuchi
2. Favonius Sword Image Favonius Sword
Best Artifacts
Genshin - Heart of Depth Image Heart of Depth x4
Artifact Main Stats
Genshin - HourglassSands: ATK% or Energy Recharge
Genshin - GobletGoblet: Hydro DMG Bonus
Genshin - CircletCirclet: CRIT Rate or CRIT DMG
Artifact Sub Stats
Energy Recharge, CRIT Rate, CRIT DMG, ATK%

Ayato Goal Stat Values
Stat Goal Value
ATK 1,800
CRIT Rate 60 ~ 70%
CRIT DMG 140% or above
Energy Recharge 120 ~ 140%

Ayato's Talent Priority
Hyperbloom
1st 2nd 3rd
Elemental Skill Elemental Burst Normal Attack
```

## Expected output

After a successful `--write` run:

- the parsed builds are added or updated in `src/data/recommended-builds.json`
- the character detail page will show a role picker when more than one build exists for that character

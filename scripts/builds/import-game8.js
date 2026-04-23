#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "../..");
const BUILDS_PATH = path.join(PROJECT_ROOT, "src/data/recommended-builds.json");
const ARTIFACT_SETS_PATH = path.join(PROJECT_ROOT, "src/data/artifact-sets.json");
const AVATARS_PATH = path.join(PROJECT_ROOT, "src/data/enka-store/avatars.json");
const WEAPONS_PATH = path.join(PROJECT_ROOT, "src/data/enka-store/weapons.json");
const LOCS_PATH = path.join(PROJECT_ROOT, "src/data/enka-store/locs.json");

const VALID_STATS = new Set([
  "HP",
  "HP%",
  "ATK",
  "ATK%",
  "DEF",
  "DEF%",
  "EM",
  "ER%",
  "CR%",
  "CD%",
  "Healing%",
  "Pyro DMG%",
  "Hydro DMG%",
  "Anemo DMG%",
  "Electro DMG%",
  "Dendro DMG%",
  "Cryo DMG%",
  "Geo DMG%",
  "Physical DMG%",
]);

const TALENT_MAP = {
  "normal attack": "normal",
  "normal": "normal",
  "elemental skill": "skill",
  "skill": "skill",
  "elemental burst": "burst",
  "burst": "burst",
};

const STAT_ALIASES = {
  hp: "HP",
  "hp%": "HP%",
  "hp percent": "HP%",
  atk: "ATK",
  "atk%": "ATK%",
  "atk percent": "ATK%",
  def: "DEF",
  "def%": "DEF%",
  "def percent": "DEF%",
  em: "EM",
  "elemental mastery": "EM",
  "energy recharge": "ER%",
  "energy recharge%": "ER%",
  "energy recharge percent": "ER%",
  er: "ER%",
  "er%": "ER%",
  "crit rate": "CR%",
  "crit rate%": "CR%",
  cr: "CR%",
  "cr%": "CR%",
  "crit dmg": "CD%",
  "crit damage": "CD%",
  "crit dmg%": "CD%",
  "crit damage%": "CD%",
  cd: "CD%",
  "cd%": "CD%",
  healing: "Healing%",
  "healing bonus": "Healing%",
  "healing bonus%": "Healing%",
  "pyro dmg bonus": "Pyro DMG%",
  pyro: "Pyro DMG%",
  "pyro dmg": "Pyro DMG%",
  "pyro dmg%": "Pyro DMG%",
  "hydro dmg bonus": "Hydro DMG%",
  hydro: "Hydro DMG%",
  "hydro dmg": "Hydro DMG%",
  "hydro dmg%": "Hydro DMG%",
  "anemo dmg bonus": "Anemo DMG%",
  anemo: "Anemo DMG%",
  "anemo dmg": "Anemo DMG%",
  "anemo dmg%": "Anemo DMG%",
  "electro dmg bonus": "Electro DMG%",
  electro: "Electro DMG%",
  "electro dmg": "Electro DMG%",
  "electro dmg%": "Electro DMG%",
  "dendro dmg bonus": "Dendro DMG%",
  dendro: "Dendro DMG%",
  "dendro dmg": "Dendro DMG%",
  "dendro dmg%": "Dendro DMG%",
  "cryo dmg bonus": "Cryo DMG%",
  cryo: "Cryo DMG%",
  "cryo dmg": "Cryo DMG%",
  "cryo dmg%": "Cryo DMG%",
  "geo dmg bonus": "Geo DMG%",
  geo: "Geo DMG%",
  "geo dmg": "Geo DMG%",
  "geo dmg%": "Geo DMG%",
  "physical dmg bonus": "Physical DMG%",
  physical: "Physical DMG%",
  "physical dmg": "Physical DMG%",
  "physical dmg%": "Physical DMG%",
};

const SECTION_HEADINGS = new Set([
  "Best Weapon",
  "Replacement Weapons",
  "Best Artifacts",
  "Artifact Main Stats",
  "Artifact Sub Stats",
  "Artifact Substats",
]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function normalizeKey(value) {
  return value
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(image|genshin|hourglasssands|gobletgoblet|circletcirclet)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function createLookup(entries) {
  const map = new Map();

  for (const entry of entries) {
    const key = normalizeKey(entry.name);
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(entry);
  }

  return map;
}

function buildCharacterLookup() {
  const avatars = readJson(AVATARS_PATH);
  const locs = readJson(LOCS_PATH);
  const locEN = locs.EN || locs.en || {};

  const entries = Object.entries(avatars)
    .map(([id, value]) => {
      const nameHash = value && typeof value === "object" ? value.NameTextMapHash : undefined;
      const name = nameHash ? locEN[String(nameHash)] : undefined;

      if (!name) {
        return null;
      }

      return { id, name };
    })
    .filter(Boolean);

  return createLookup(entries);
}

function buildWeaponLookup() {
  const weapons = readJson(WEAPONS_PATH);
  const locs = readJson(LOCS_PATH);
  const locEN = locs.EN || locs.en || {};

  const entries = Object.entries(weapons)
    .map(([id, value]) => {
      const weapon = value && typeof value === "object" ? value : null;
      const nameHash = weapon ? weapon.NameTextMapHash : undefined;
      const directName = nameHash ? locEN[String(nameHash)] : undefined;
      const plusOffset = nameHash ? locEN[String(Number(nameHash) + 512)] : undefined;
      const minusOffset = nameHash ? locEN[String(Number(nameHash) - 512)] : undefined;
      const name = directName || plusOffset || minusOffset;

      if (!name) {
        return null;
      }

      return { id, name };
    })
    .filter(Boolean);

  return createLookup(entries);
}

function buildArtifactLookup() {
  const artifactSets = readJson(ARTIFACT_SETS_PATH);
  const entries = Object.entries(artifactSets).map(([id, name]) => ({ id, name }));
  return createLookup(entries);
}

function resolveEntry(rawName, lookup, label) {
  const normalized = normalizeKey(rawName);

  if (!normalized) {
    throw new Error(`Cannot resolve empty ${label} name.`);
  }

  const direct = lookup.get(normalized);
  if (direct && direct.length === 1) {
    return direct[0];
  }
  if (direct && direct.length > 1) {
    throw new Error(`Ambiguous ${label} "${rawName}" matched multiple entries.`);
  }

  const candidates = [];

  for (const [key, entries] of lookup.entries()) {
    if (key.includes(normalized) || normalized.includes(key)) {
      candidates.push(...entries);
    }
  }

  const deduped = Array.from(
    new Map(candidates.map((entry) => [`${entry.id}:${entry.name}`, entry])).values(),
  );

  if (deduped.length === 1) {
    return deduped[0];
  }

  throw new Error(
    deduped.length === 0
      ? `Could not resolve ${label} "${rawName}".`
      : `Ambiguous ${label} "${rawName}" matched: ${deduped.map((entry) => entry.name).join(", ")}`,
  );
}

function extractSection(text, startLabel, endLabels) {
  const startIndex = text.indexOf(startLabel);
  if (startIndex === -1) {
    return "";
  }

  const sectionStart = startIndex + startLabel.length;
  const remaining = text.slice(sectionStart);
  const endIndex = endLabels
    .map((label) => remaining.indexOf(label))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];

  return (endIndex === undefined ? remaining : remaining.slice(0, endIndex)).trim();
}

function characterHeadingVariants(characterName, suffix) {
  return [`${characterName} ${suffix}`, `${characterName}'s ${suffix}`];
}

function cleanLine(line) {
  return line.replace(/\s+/g, " ").trim();
}

function getNonEmptyLines(section) {
  return section
    .split(/\r?\n/)
    .map(cleanLine)
    .filter(Boolean);
}

function inferCharacterName(text) {
  const goalMatch = text.match(/^\s*([A-Za-z' -]+?)\s+Goal Stat Values\s*$/m);
  if (goalMatch) {
    return goalMatch[1].replace(/'s$/i, "").trim();
  }

  const talentMatch = text.match(/^\s*([A-Za-z' -]+?)\s+Talent Priority\s*$/m);
  if (talentMatch) {
    return talentMatch[1].replace(/'s$/i, "").trim();
  }

  throw new Error("Could not infer character name from guide text.");
}

function parseRole(text) {
  const lines = getNonEmptyLines(text);
  const firstLine = lines[0];
  if (!firstLine) {
    throw new Error("Guide text is empty.");
  }

  if (
    lines[1] &&
    /builds?$/i.test(firstLine) &&
    !SECTION_HEADINGS.has(lines[1])
  ) {
    return lines[1].replace(/\s+Builds?$/i, "").trim();
  }

  return firstLine.replace(/\s+Builds?$/i, "").trim();
}

function stripLeadingIndex(line) {
  return line.replace(/^\d+\.\s*/, "").trim();
}

function stripDuplicateImageName(line) {
  const parts = line.split(/\s+Image\s+/i).map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return parts[parts.length - 1];
  }
  return line;
}

function extractTrailingNote(line) {
  const notes = [];
  let cleaned = line;

  const matches = cleaned.match(/\(([^)]+)\)/g) || [];
  for (const match of matches) {
    const note = match.replace(/[()]/g, "").trim();
    if (note) {
      notes.push(note);
    }
  }

  cleaned = cleaned.replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
  return { cleaned, note: notes.join(", ") || undefined };
}

function normalizeNameFromLine(line) {
  const cleaned = stripDuplicateImageName(stripLeadingIndex(cleanLine(line)))
    .replace(/^[-:]\s*/, "")
    .trim();

  const duplicatedWordMatch = cleaned.match(/^([A-Za-z]+)\s+\1'?s\s+/i);
  if (duplicatedWordMatch) {
    return cleaned.slice(duplicatedWordMatch[1].length + 1).trim();
  }

  return cleaned;
}

function parseWeapons(text) {
  const bestWeaponSection = extractSection(text, "Best Weapon", ["Replacement Weapons"]);
  const replacementSection = extractSection(text, "Replacement Weapons", ["Best Artifacts"]);

  const bestWeaponLines = getNonEmptyLines(bestWeaponSection);
  const replacementLines = getNonEmptyLines(replacementSection);

  const weapons = [];

  if (bestWeaponLines[0]) {
    const { cleaned, note } = extractTrailingNote(normalizeNameFromLine(bestWeaponLines[0]));
    weapons.push({ weaponName: cleaned, tier: "S", note });
  }

  for (const line of replacementLines) {
    const { cleaned, note } = extractTrailingNote(normalizeNameFromLine(line));
    weapons.push({ weaponName: cleaned, tier: "A", note });
  }

  return weapons.filter((weapon) => weapon.weaponName);
}

function parseArtifacts(text) {
  const artifactSection = extractSection(text, "Best Artifacts", ["Artifact Main Stats"]);
  const artifactLines = getNonEmptyLines(artifactSection);

  return artifactLines.map((line) => {
    const cleaned = normalizeNameFromLine(line);
    const pieceMatch = cleaned.match(/(.+?)\s*x([24])$/i);
    if (!pieceMatch) {
      throw new Error(`Could not parse artifact set line "${line}".`);
    }

    return {
      setName: pieceMatch[1].trim(),
      pieces: Number(pieceMatch[2]),
    };
  });
}

function normalizeStatLabel(raw) {
  const cleaned = raw
    .trim()
    .replace(/%/g, "%")
    .replace(/\s+/g, " ")
    .replace(/^crit$/i, "CR%")
    .replace(/\.$/, "");

  if (VALID_STATS.has(cleaned)) {
    return cleaned;
  }

  const normalized = normalizeKey(cleaned).replace(/\bpercent\b/g, "").trim();
  const alias = STAT_ALIASES[normalized];
  if (!alias) {
    throw new Error(`Unknown stat label "${raw}".`);
  }

  return alias;
}

function parseStatList(value) {
  return value
    .split(/\s+or\s+|,/i)
    .map((part) => part.trim())
    .filter(Boolean)
    .map(normalizeStatLabel);
}

function parseMainStats(text) {
  const mainStatsSection = extractSection(text, "Artifact Main Stats", ["Artifact Sub Stats"]);
  const lines = getNonEmptyLines(mainStatsSection);
  const mainStats = {
    sands: [],
    goblet: [],
    circlet: [],
  };

  for (const line of lines) {
    const cleaned = cleanLine(line);
    const [rawLabel, rawValue] = cleaned.split(":").map((part) => part.trim());
    if (!rawLabel || !rawValue) {
      continue;
    }

    if (/sands/i.test(rawLabel)) {
      mainStats.sands = parseStatList(rawValue);
    } else if (/goblet/i.test(rawLabel)) {
      mainStats.goblet = parseStatList(rawValue);
    } else if (/circlet/i.test(rawLabel)) {
      mainStats.circlet = parseStatList(rawValue);
    }
  }

  return mainStats;
}

function parseSubstats(text, characterName) {
  const startLabel = text.includes("Artifact Sub Stats")
    ? "Artifact Sub Stats"
    : "Artifact Substats";
  const substatsSection = extractSection(text, startLabel, [
    ...characterHeadingVariants(characterName, "Goal Stat Values"),
    ...characterHeadingVariants(characterName, "Talent Priority"),
  ]);
  const substatLine = getNonEmptyLines(substatsSection).join(", ");
  return parseStatList(substatLine);
}

function parseFirstNumber(value) {
  const match = value.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : undefined;
}

function normalizeGoalStatKey(raw) {
  return normalizeStatLabel(raw);
}

function parseGoalStats(text, characterName) {
  const [startLabel, altStartLabel] = characterHeadingVariants(characterName, "Goal Stat Values");
  const endLabels = characterHeadingVariants(characterName, "Talent Priority");
  const effectiveStartLabel = text.includes(startLabel) ? startLabel : altStartLabel;
  const goalSection = extractSection(text, effectiveStartLabel, endLabels);
  const lines = getNonEmptyLines(goalSection);
  const goalStats = {};
  const notes = [];

  for (const line of lines) {
    if (/^(stat|goal value|stat goal value)$/i.test(line)) {
      continue;
    }

    const statMatch = line.match(
      /^(ATK|HP|DEF|CRIT Rate|CRIT DMG|CRIT Damage|Energy Recharge|Elemental Mastery|EM|ER)\s+(.+)$/i,
    );

    if (statMatch) {
      const stat = normalizeGoalStatKey(statMatch[1]);
      const value = parseFirstNumber(statMatch[2]);
      if (value !== undefined) {
        goalStats[stat] = value;
        continue;
      }
    }

    notes.push(line);
  }

  return {
    goalStats,
    notes,
  };
}

function parseTalentPriority(text, characterName) {
  const [label, altLabel] = characterHeadingVariants(characterName, "Talent Priority");
  const talentSection = extractSection(text, text.includes(label) ? label : altLabel, []);
  const lines = getNonEmptyLines(talentSection).filter(
    (line) => !/^(\d+(st|nd|rd|th))(\s+\d+(st|nd|rd|th))*$/i.test(line),
  );

  const priority = [];

  for (const line of lines) {
    const matches = line.match(/Elemental Skill|Elemental Burst|Normal Attack/gi) || [line];

    for (const token of matches) {
      const normalized = TALENT_MAP[normalizeKey(token)];
      if (normalized && !priority.includes(normalized)) {
        priority.push(normalized);
      }
    }
  }

  for (const token of lines) {
    const normalized = TALENT_MAP[normalizeKey(token)];
    if (normalized && !priority.includes(normalized)) {
      priority.push(normalized);
    }
  }

  return priority;
}

function resolveBuild(parsed, lookups) {
  const character = resolveEntry(parsed.characterName, lookups.characters, "character");
  const artifactSetOption = {
    sets: parsed.artifactSets.map((set) => {
      const resolved = resolveEntry(set.setName, lookups.artifacts, "artifact set");
      return {
        setId: resolved.id,
        setName: resolved.name,
        pieces: set.pieces,
      };
    }),
    label: "Best in Slot",
    tier: "S",
  };

  const weapons = parsed.weapons.map((weapon, index) => {
    const resolved = resolveEntry(weapon.weaponName, lookups.weapons, "weapon");
    return {
      weaponId: resolved.id,
      weaponName: resolved.name,
      refinement: "R1",
      tier: index === 0 ? "S" : "A",
      ...(weapon.note ? { note: weapon.note } : {}),
    };
  });

  return {
    characterId: character.id,
    characterName: character.name,
    role: parsed.role,
    artifactSets: [artifactSetOption],
    mainStats: parsed.mainStats,
    substatPriority: parsed.substatPriority,
    ...(Object.keys(parsed.goalStats).length > 0 ? { goalStats: parsed.goalStats } : {}),
    ...(parsed.talentPriority.length > 0 ? { talentPriority: parsed.talentPriority } : {}),
    weapons,
    ...(parsed.notes.length > 0 ? { notes: parsed.notes.join(" ") } : {}),
    source: "Game8",
    lastUpdated: new Date().toISOString().slice(0, 10),
  };
}

function validateBuild(build) {
  const missingMainStats = ["sands", "goblet", "circlet"].filter((slot) => build.mainStats[slot].length === 0);
  if (missingMainStats.length > 0) {
    throw new Error(`Missing main stat recommendations for: ${missingMainStats.join(", ")}`);
  }

  const invalidSubstats = build.substatPriority.filter((stat) => !VALID_STATS.has(stat));
  if (invalidSubstats.length > 0) {
    throw new Error(`Invalid substats found: ${invalidSubstats.join(", ")}`);
  }
}

function upsertBuild(build) {
  const existing = readJson(BUILDS_PATH);
  const index = existing.findIndex(
    (entry) => entry.characterId === build.characterId && entry.role === build.role,
  );

  if (index >= 0) {
    existing[index] = build;
  } else {
    existing.push(build);
  }

  fs.writeFileSync(BUILDS_PATH, `${JSON.stringify(existing, null, 2)}\n`, "utf8");
  return index >= 0 ? "updated" : "added";
}

function parseGuideText(text) {
  const characterName = inferCharacterName(text);
  const role = parseRole(text);
  const artifactSets = parseArtifacts(text);
  const mainStats = parseMainStats(text);
  const substatPriority = parseSubstats(text, characterName);
  const { goalStats, notes } = parseGoalStats(text, characterName);
  const talentPriority = parseTalentPriority(text, characterName);
  const weapons = parseWeapons(text);

  return {
    characterName,
    role,
    artifactSets,
    mainStats,
    substatPriority,
    goalStats,
    talentPriority,
    weapons,
    notes,
  };
}

function parseArgs(argv) {
  const args = { inputPath: "", write: false };

  for (const arg of argv) {
    if (arg === "--write") {
      args.write = true;
    } else if (!args.inputPath) {
      args.inputPath = arg;
    }
  }

  if (!args.inputPath) {
    throw new Error("Usage: node scripts/builds/import-game8.js <input-file> [--write]");
  }

  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const inputPath = path.resolve(PROJECT_ROOT, args.inputPath);
  const rawText = fs.readFileSync(inputPath, "utf8");
  const parsed = parseGuideText(rawText);

  const lookups = {
    characters: buildCharacterLookup(),
    weapons: buildWeaponLookup(),
    artifacts: buildArtifactLookup(),
  };

  const build = resolveBuild(parsed, lookups);
  validateBuild(build);

  console.log(JSON.stringify(build, null, 2));

  if (!args.write) {
    console.log("\nDry run only. Re-run with --write to save into src/data/recommended-builds.json.");
    return;
  }

  const action = upsertBuild(build);
  console.log(`\nBuild ${action} in ${BUILDS_PATH}`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

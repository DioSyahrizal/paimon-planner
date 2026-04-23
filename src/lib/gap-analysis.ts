import type { ArtifactSlot, StatType } from "@/types/artifact";
import type { GapAnalysis, RecommendedBuild, StatGap } from "@/types/build";
import type { Character, StatBlock } from "@/types/character";

const STAT_BLOCK_KEY: Partial<Record<StatType, keyof StatBlock>> = {
  ATK: "atk",
  HP: "hp",
  DEF: "def",
  EM: "em",
  "ER%": "er",
  "CR%": "cr",
  "CD%": "cd",
};

// These keys in StatBlock are stored as decimals (0.35 = 35%) — multiply by 100 for display/comparison
const DECIMAL_STAT_KEYS = new Set<keyof StatBlock>([
  "er",
  "cr",
  "cd",
  "elementalDmgBonus",
  "healingBonus",
]);

function checkArtifactSetMatch(
  character: Character,
  build: RecommendedBuild,
): boolean {
  return build.artifactSets.some((option) =>
    option.sets.every((s) => {
      const count = character.artifacts.filter(
        (a) =>
          a.setId === s.setId ||
          a.setName.toLowerCase() === s.setName.toLowerCase(),
      ).length;
      return count >= s.pieces;
    }),
  );
}

function checkMainStatMatch(
  character: Character,
  build: RecommendedBuild,
): Record<ArtifactSlot, boolean> {
  const slots: ArtifactSlot[] = [
    "flower",
    "feather",
    "sands",
    "goblet",
    "circlet",
  ];
  const result = {} as Record<ArtifactSlot, boolean>;

  for (const slot of slots) {
    const artifact = character.artifacts.find((a) => a.slotType === slot);
    if (!artifact) {
      result[slot] = false;
      continue;
    }

    // Flower and feather always have fixed main stats
    if (slot === "flower" || slot === "feather") {
      result[slot] = true;
      continue;
    }

    const recommended = build.mainStats[slot as "sands" | "goblet" | "circlet"];
    result[slot] = recommended.includes(artifact.mainStat.stat);
  }

  return result;
}

function checkWeaponTier(
  character: Character,
  build: RecommendedBuild,
): "S" | "A" | "B" | "unranked" {
  const match = build.weapons.find(
    (w) =>
      w.weaponId === character.weapon.id ||
      w.weaponName.toLowerCase() === character.weapon.name.toLowerCase(),
  );
  return match?.tier ?? "unranked";
}

function computeSubstatGaps(
  character: Character,
  build: RecommendedBuild,
): StatGap[] {
  const gaps: StatGap[] = [];

  for (const stat of build.substatPriority) {
    const statKey = STAT_BLOCK_KEY[stat];
    const rawValue = statKey ? (character.totalStats[statKey] ?? 0) : 0;
    const current =
      statKey && DECIMAL_STAT_KEYS.has(statKey) ? rawValue * 100 : rawValue;
    const recommended = build.goalStats?.[stat] ?? 0;

    if (recommended > 0) {
      gaps.push({
        stat,
        current,
        recommended,
        delta: current - recommended,
      });
    }
  }

  return gaps;
}

function computeSubstatCoverage(
  character: Character,
  build: RecommendedBuild,
): number {
  const top4 = build.substatPriority.slice(0, 4);
  const allSubstats = character.artifacts.flatMap((a) =>
    a.subStats.map((s) => s.stat),
  );
  const presentSet = new Set(allSubstats);
  const matches = top4.filter((s) => presentSet.has(s as StatType)).length;
  return matches / top4.length;
}

function computeOverallScore(
  setMatch: boolean,
  mainStatMatch: Record<ArtifactSlot, boolean>,
  substatCoverage: number,
  weaponTier: "S" | "A" | "B" | "unranked",
): number {
  const setScore = setMatch ? 30 : 0;

  const mainStatSlots: ArtifactSlot[] = ["sands", "goblet", "circlet"];
  const mainStatHits = mainStatSlots.filter((s) => mainStatMatch[s]).length;
  const mainStatScore = (mainStatHits / mainStatSlots.length) * 20;

  const substatScore = substatCoverage * 30;

  const weaponScores: Record<string, number> = {
    S: 20,
    A: 14,
    B: 8,
    unranked: 0,
  };
  const weaponScore = weaponScores[weaponTier] ?? 0;

  return Math.round(setScore + mainStatScore + substatScore + weaponScore);
}

export function analyzeGap(
  character: Character,
  build: RecommendedBuild,
): GapAnalysis {
  const artifactSetMatch = checkArtifactSetMatch(character, build);
  const mainStatMatch = checkMainStatMatch(character, build);
  const weaponTier = checkWeaponTier(character, build);
  const substatGaps = computeSubstatGaps(character, build);
  const substatCoverage = computeSubstatCoverage(character, build);
  const overallScore = computeOverallScore(
    artifactSetMatch,
    mainStatMatch,
    substatCoverage,
    weaponTier,
  );

  return {
    characterId: character.id,
    overallScore,
    artifactSetMatch,
    mainStatMatch,
    substatGaps,
    weaponTier,
  };
}

#!/bin/bash

# Updates all Enka Network store files and regenerates artifact-sets.json.
# Run this after each Genshin Impact patch.
# Usage: bash scripts/update-enka-data.sh

set -e

BASE_URL="https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/gi"
STORE_DIR="src/data/enka-store"
DATA_DIR="src/data"

echo "Updating Enka store files..."

curl -sf "$BASE_URL/avatars.json" -o "$STORE_DIR/avatars.json"
echo "  avatars.json"

curl -sf "$BASE_URL/locs.json" -o "$STORE_DIR/locs.json"
echo "  locs.json"

curl -sf "$BASE_URL/weapons.json" -o "$STORE_DIR/weapons.json"
echo "  weapons.json"

curl -sf "$BASE_URL/relics.json" -o "$STORE_DIR/relics.json"
echo "  relics.json"

echo "Regenerating artifact-sets.json..."

python3 - <<'EOF'
import json

with open("src/data/enka-store/relics.json") as f:
    relics = json.load(f)

with open("src/data/enka-store/locs.json") as f:
    locs = json.load(f)

en = locs.get("en", locs.get("EN", locs))
sets = relics["Sets"]

result = {}
missing = []
for set_id, data in sets.items():
    name_hash = str(data["Name"])
    name = en.get(name_hash)
    if name:
        result[set_id] = name
    else:
        missing.append((set_id, name_hash))

with open("src/data/artifact-sets.json", "w") as f:
    json.dump(result, f, indent=2, ensure_ascii=False)
    f.write("\n")

print(f"  artifact-sets.json ({len(result)} sets resolved)")
if missing:
    print(f"  WARNING: {len(missing)} sets missing from locs.json: {missing}")
EOF

echo "Done."

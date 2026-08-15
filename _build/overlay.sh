#!/bin/bash
set -e
SRC_DAY="$1"
SOLUTION="$2"
DEST_DAY="$3"

rm -rf "$DEST_DAY"
mkdir -p "$DEST_DAY"

# copy src day (excluding node_modules/dist/coverage)
cd "$SRC_DAY"
find . -mindepth 1 -maxdepth 1 ! -name node_modules ! -name dist ! -name coverage -exec cp -r {} "$DEST_DAY/" \;
cp -f .gitignore "$DEST_DAY/.gitignore" 2>/dev/null || true

# overlay solution files (excluding SOLUTION.md)
cd "$SOLUTION"
find . -type f ! -name SOLUTION.md | while read -r f; do
  rel="${f#./}"
  destpath="$DEST_DAY/$rel"
  mkdir -p "$(dirname "$destpath")"
  cp "$f" "$destpath"
done

echo "Built $DEST_DAY from $SRC_DAY + $SOLUTION"

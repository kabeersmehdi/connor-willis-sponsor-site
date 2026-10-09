#!/bin/sh
# Rebuild site/assets/car.glb from the raw Sketchfab download.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
IN="$1"; OUT="$2"
node "$HERE/prepare-model.mjs" "$IN" "$HERE/_stage.glb"
"$HERE/node_modules/.bin/gltf-transform" draco "$HERE/_stage.glb" "$OUT" --method edgebreaker
rm -f "$HERE/_stage.glb"
ls -la "$OUT"

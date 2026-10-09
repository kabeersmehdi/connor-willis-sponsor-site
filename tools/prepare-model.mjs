// Deterministic asset pipeline for the sponsorship car model.
// Input : Sketchfab GLB "F1 2022 Generic V3" (CC BY 4.0, TheoDevF1 via DaniFold)
// Output: a GLB with the baked third-party marks removed (F1 logos, Pirelli),
//         livery materials reset to neutral so the site can paint them at runtime,
//         then deduplicated, pruned and welded. Draco compression runs as a
//         separate CLI step (see run.sh).
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, weld } from '@gltf-transform/functions';

const [, , input, output] = process.argv;
if (!input || !output) { console.error('usage: node prepare-model.mjs in.glb out.glb'); process.exit(1); }

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(input);
const root = doc.getRoot();

// Materials whose base colour maps carry third-party marks. Maps are dropped,
// colours reset. The site paints Livery / Livery_Wings with its own shader.
const STRIP = {
  Livery:       { color: [1, 1, 1, 1],            metal: 0,   rough: 0.30 },
  Livery_Wings: { color: [1, 1, 1, 1],            metal: 0,   rough: 0.30 },
  tyres:        { color: [0.055, 0.055, 0.06, 1], metal: 0,   rough: 0.82 },
};
// Materials kept as-is but with tuned PBR factors.
const TUNE = {
  chrome: { metal: 1.0,  rough: 0.30 },
  rims:   { metal: 0.85, rough: 0.35 },
  mirror: { color: [0.95, 0.95, 0.95, 1], metal: 1.0, rough: 0.06 },
  brake:  { color: [0.32, 0.32, 0.33, 1], metal: 0.7, rough: 0.45 },
  carbon: { metal: 0.15, rough: 0.50 },
  Black:  { metal: 0.0,  rough: 0.65 },
  Steer:  { metal: 0.0,  rough: 0.75 },
  generic:{ metal: 0.3,  rough: 0.60 },
};

const seen = [];
for (const m of root.listMaterials()) {
  const n = m.getName();
  seen.push(n);
  const s = STRIP[n];
  if (s) {
    m.setBaseColorTexture(null);
    m.setBaseColorFactor(s.color);
    m.setMetallicFactor(s.metal);
    m.setRoughnessFactor(s.rough);
  }
  const t = TUNE[n];
  if (t) {
    if (t.color) m.setBaseColorFactor(t.color);
    m.setMetallicFactor(t.metal);
    m.setRoughnessFactor(t.rough);
  }
}
console.log('materials:', seen.join(', '));

await doc.transform(dedup(), prune(), weld());

const texLeft = root.listTextures().map(t => t.getName() || t.getURI() || '(unnamed)');
console.log('textures kept:', texLeft.length, texLeft.join(', '));
await io.write(output, doc);
console.log('wrote', output);

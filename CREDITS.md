# Credits and licences

## 3D car model
- **Base model:** "F1 2022 Generic V3 (reuploaded from TheoDevF1)" by DaniFold on Sketchfab, original work by TheoDevF1.
  https://sketchfab.com/3d-models/55c119e7096a4322bc375c9b4f5a162d
- **Licence:** Creative Commons Attribution 4.0 (CC BY 4.0). https://creativecommons.org/licenses/by/4.0/
- **Changes made:** the baked base-colour textures for the body, wings and tyres were removed (they carried Formula 1 and Pirelli marks), the body is repainted at runtime with the page's own two-tone livery shader, the number 99 and the sponsor panels are projected decals, PBR factors were tuned, and the file was deduplicated, welded and Draco-compressed (`tools/prepare-model.mjs`).
- **Note:** this model is a generic 2022-style single-seater used as a stand-in. Connor's real car is a Tatuus MSV GB4-025. The page says so in the legend, the spec card and the FAQ.

## Lighting
- **HDRI:** "Studio Small 09" from Poly Haven, CC0. https://polyhaven.com/a/studio_small_09

## Photos and logos
- All photographs, the Connor Willis Racing wordmark and the partner logos come from connorwillisracing.com and belong to Connor Willis Racing and the respective partners. They are used here for Connor's own sponsorship page.

## Software
- three.js (MIT), loaded from jsDelivr. Draco decoder (Apache 2.0) shipped in `site/assets/draco/`.
- Fonts: Racing Sans One and Inter (SIL Open Font License), subset to Latin and served from `site/assets/fonts/`.
- Design system (colours, type scale, button and card shapes): exported from Relume on 14 October 2026 for the Connor Willis Sponsorship Programme. The React components in that export were used as layout references only; the page is hand-written HTML and CSS.
- Model pipeline: glTF Transform (MIT).

## Facts used in the copy (checked 16 September 2026; season results updated 9 October 2026)
- Final 2026 standings (9th, 221 points; Hillspeed runner-up in the teams' standings), car number and team: https://www.gb-4.net/standings and https://www.gb-4.net/drivers/2026/connor-willis
- Third place in race three of the Brands Hatch finale, 27 September 2026: https://www.msv.com/news/2026/sept/27/race-three-report
- Career history: https://hillspeed.co.uk/connor-willis-gb4/ and https://www.connorwillisracing.com/about
- Silverstone reversed-grid win and season summary: https://www.pitdebrief.com/post/willis-targets-strong-gb4-finish-after-breakthrough-rookie-season-in-2026/
- GB4 car (Tatuus MSV GB4-025, Mountune 2.0 engine, halo, single-plane wings): https://www.msv.com/news/2024/jun/19/gb4-championship-upgrades-to-tatuus-msv-gb4025-car-for-2025
- Calendar and live streaming on MSV TV: https://feederseries.net/2026/04/23/gb4-2026-season-guide/

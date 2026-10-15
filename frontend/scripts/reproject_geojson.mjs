/**
 * reproject_geojson.mjs
 * 
 * Converts the IMD subdivision GeoJSON from its projected CRS to WGS84 (lon/lat).
 * 
 * The IMD official sd_boundary.json uses a projected coordinate system.
 * Based on the coordinate ranges (X: -400k to +500k, Y: 700k to 3600k),
 * this is consistent with EPSG:32643 (WGS84 UTM Zone 43N) or EPSG:32644
 * (UTM Zone 44N). We try UTM Zone 44N first since most of India falls there,
 * and verify that the reprojected Kerala centroid is near 10°N 76°E.
 * 
 * Usage:
 *   node scripts/reproject_geojson.mjs [input_geojson] [output_geojson] [epsg_code]
 * 
 * Default: reads ../public/imd_subdivisions.geojson, writes back reprojected.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import proj4 from 'proj4';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Define source projections to try ────────────────────────────────────────
const PROJECTIONS = {
  // WGS84 UTM Zone 43N — covers ~72°E–78°E
  'EPSG:32643': '+proj=utm +zone=43 +datum=WGS84 +units=m +no_defs',
  // WGS84 UTM Zone 44N — covers ~78°E–84°E  
  'EPSG:32644': '+proj=utm +zone=44 +datum=WGS84 +units=m +no_defs',
  // Kalianpur 1975 / India Zone IIb (used by Survey of India)
  'EPSG:24343': '+proj=lcc +lat_1=12 +lat_2=28 +lat_0=19 +lon_0=80 +x_0=2000000 +y_0=2000000 +datum=Kalianpur1975 +units=m +no_defs',
  // WGS84 / Plate Carree (EPSG:4326 but in metres — unlikely)
  // Indian National Grid (Lambert Conformal Conic)
  'INDIA_LCC': '+proj=lcc +lat_1=12.47294444444445 +lat_2=35.17280555555556 +lat_0=23.81329444444444 +lon_0=80 +x_0=0 +y_0=0 +a=6377276.345 +b=6356075.41314024 +units=m +no_defs',
};

const INPUT  = path.resolve(__dirname, '../public/imd_subdivisions.geojson');
const OUTPUT = path.resolve(__dirname, '../public/imd_subdivisions_wgs84.geojson');

// ── Load input ────────────────────────────────────────────────────────────────
const rawText = fs.readFileSync(INPUT, 'utf8').replace(/^\uFEFF/, ''); // strip BOM
const geojson = JSON.parse(rawText);

// ── Coordinate reprojection ───────────────────────────────────────────────────
function reprojectCoords(coords, fromProj) {
  if (!Array.isArray(coords[0])) {
    // Leaf-level: [x, y] pair
    const [lon, lat] = proj4(fromProj, 'EPSG:4326', [coords[0], coords[1]]);
    return [+lon.toFixed(6), +lat.toFixed(6)];
  }
  return coords.map((c) => reprojectCoords(c, fromProj));
}

function reprojectGeometry(geometry, fromProj) {
  return {
    ...geometry,
    coordinates: reprojectCoords(geometry.coordinates, fromProj),
  };
}

// ── Try each projection and find the one that places Kerala correctly ─────────
// Kerala centroid should be approximately 10°N, 76°E
let bestProj = null;
let bestGeojson = null;

for (const [name, projStr] of Object.entries(PROJECTIONS)) {
  try {
    proj4.defs(name, projStr);
    const reprojected = {
      ...geojson,
      features: geojson.features.map((f) => ({
        ...f,
        geometry: reprojectGeometry(f.geometry, name),
      })),
    };

    // Find Kerala and check its centroid
    const kerala = reprojected.features.find(
      (f) => f.properties.subdivisio === 'KERALA'
    );
    if (!kerala) continue;

    const coords = kerala.geometry.coordinates.flat(Infinity);
    const lons = [], lats = [];
    for (let i = 0; i < coords.length; i += 2) {
      lons.push(coords[i]);
      lats.push(coords[i + 1]);
    }
    const centLon = lons.reduce((a, b) => a + b) / lons.length;
    const centLat = lats.reduce((a, b) => a + b) / lats.length;

    console.log(`${name}: Kerala centroid ≈ ${centLat.toFixed(2)}°N, ${centLon.toFixed(2)}°E`);

    // Kerala should be ~8–13°N, ~74–78°E
    if (centLat > 7 && centLat < 15 && centLon > 73 && centLon < 79) {
      console.log(`  ✓ MATCH — using ${name}`);
      bestProj = name;
      bestGeojson = reprojected;
      break;
    }
  } catch (e) {
    console.log(`${name}: ERROR — ${e.message}`);
  }
}

if (!bestGeojson) {
  console.error('ERROR: No projection produced valid WGS84 coordinates for Kerala.');
  console.error('Please inspect the source GeoJSON and determine its CRS manually.');
  process.exit(1);
}

// ── Write output ──────────────────────────────────────────────────────────────
// Remove any CRS field (GeoJSON RFC 7946 mandates WGS84 with no CRS member)
const { crs: _crs, ...cleanGeojson } = bestGeojson;
fs.writeFileSync(OUTPUT, JSON.stringify(cleanGeojson), 'utf8');
console.log(`\nWrote ${OUTPUT}`);
console.log(`Features: ${cleanGeojson.features.length}`);

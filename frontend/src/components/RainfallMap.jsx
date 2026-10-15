import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { fetchMapData } from '../services/api';

// ─── GeoJSON "subdivisio" field → dataset SUBDIVISION name ───────────────────
// 27 names match exactly (case-insensitive); these 9 require explicit mapping.
const GEO_TO_DATA = {
  'A & N ISLAND':            'ANDAMAN & NICOBAR ISLANDS',
  'HAR. CHD & DELHI':        'HARYANA DELHI & CHANDIGARH',
  'MARATHWADA':              'MATATHWADA',
  'N M M T':                 'NAGA MANI MIZO TRIPURA',
  'N. I. KARNATAKA':         'NORTH INTERIOR KARNATAKA',
  'RAYALASEEMA':             'RAYALSEEMA',
  'S. I. KARNATAKA':         'SOUTH INTERIOR KARNATAKA',
  'SHWB & SIKKIM':           'SUB HIMALAYAN WEST BENGAL & SIKKIM',
  'TAMILNADU & PONDICHERY':  'TAMIL NADU',
};

function geoToDataset(geoName) {
  const upper = (geoName || '').toUpperCase().trim();
  return GEO_TO_DATA[upper] || upper;
}

// ─── Title-case helper ────────────────────────────────────────────────────────
function toTitle(s) {
  return (s || '').replace(/\b\w+/g, (w) =>
    ['&', 'AND', 'OF'].includes(w) ? w.toLowerCase() : w[0] + w.slice(1).toLowerCase()
  );
}

// ─── Colour scale (YlGnBu sequential) ────────────────────────────────────────
// Fixed breaks based on actual 1901–2015 Indian rainfall distribution.
// West Rajasthan receives as little as ~60 mm/yr; NE India up to ~6 300 mm/yr.
const ANNUAL_BREAKS = [300, 600, 1000, 1500, 2200, 3500];
const PALETTE       = ['#ffffcc', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#0c2c84'];
const NO_DATA_COLOR = '#cbd5e1'; // slate-300 — clearly distinct from the data palette

function getColor(value, breaks) {
  if (value == null) return NO_DATA_COLOR;
  for (let i = 0; i < breaks.length; i++) {
    if (value < breaks[i]) return PALETTE[i];
  }
  return PALETTE[PALETTE.length - 1];
}

/**
 * Compute quantile-based breaks from the actual value distribution.
 * Used for non-annual fields (months/seasons) so the scale always spans
 * the real range and subdivisions are distinguishable by colour.
 */
function quantileBreaks(values) {
  const valid = values.filter((v) => v != null && !isNaN(v)).sort((a, b) => a - b);
  if (valid.length < 7) return ANNUAL_BREAKS;
  const q = (p) => valid[Math.max(0, Math.round((valid.length - 1) * p))];
  return [q(0.15), q(0.30), q(0.45), q(0.60), q(0.75), q(0.90)].map(Math.round);
}

// ─── Period / field options ───────────────────────────────────────────────────
const FIELD_OPTIONS = [
  { value: 'annual', label: 'Annual Total' },
  { value: 'junSep', label: 'SW Monsoon (Jun–Sep)' },
  { value: 'janFeb', label: 'Winter (Jan–Feb)' },
  { value: 'marMay', label: 'Pre-Monsoon (Mar–May)' },
  { value: 'octDec', label: 'Post-Monsoon (Oct–Dec)' },
  { value: 'jan', label: 'January' },
  { value: 'feb', label: 'February' },
  { value: 'mar', label: 'March' },
  { value: 'apr', label: 'April' },
  { value: 'may', label: 'May' },
  { value: 'jun', label: 'June' },
  { value: 'jul', label: 'July' },
  { value: 'aug', label: 'August' },
  { value: 'sep', label: 'September' },
  { value: 'oct', label: 'October' },
  { value: 'nov', label: 'November' },
  { value: 'dec', label: 'December' },
];

// ─── FitBounds on GeoJSON load ────────────────────────────────────────────────
// Fits the Leaflet map to the full extent of the GeoJSON on first render.
// Must run inside MapContainer (useMap hook) and wait for the map to be ready.
function FitBoundsOnLoad({ geoJson }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (!geoJson || fitted.current) return;

    function doFit() {
      try {
        // Recompute Leaflet's pixel container size before fitBounds
        map.invalidateSize();
        const layer = L.geoJSON(geoJson);
        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          // Pad so island territories (A&N, Lakshadweep) aren't clipped
          map.fitBounds(bounds, { padding: [32, 32], maxZoom: 6 });
          fitted.current = true;
        }
      } catch (_) {
        // Fallback: keep the default centre/zoom set on MapContainer
      }
    }

    // whenReady fires after Leaflet has initialised and sized the canvas
    if (map._loaded) {
      doFit();
    } else {
      map.whenReady(doFit);
    }
  }, [geoJson, map]);

  return null;
}

// ─── Legend ───────────────────────────────────────────────────────────────────
function MapLegend({ breaks, field }) {
  const fieldLabel = FIELD_OPTIONS.find((f) => f.value === field)?.label ?? field;
  const fmt = (v) => v >= 10 ? Math.round(v).toLocaleString('en-IN') : v.toFixed(1);
  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-white/96 rounded-xl
                    shadow-md border border-slate-200 p-3 text-xs pointer-events-none select-none">
      <p className="font-semibold text-slate-700 mb-2">{fieldLabel} (mm)</p>
      {PALETTE.map((color, i) => {
        const lo = i === 0 ? 0 : breaks[i - 1];
        const hi = i < breaks.length ? breaks[i] : null;
        const label = hi ? `${fmt(lo)}–${fmt(hi)}` : `>${fmt(lo)}`;
        return (
          <div key={i} className="flex items-center gap-2 mb-1">
            <div className="w-4 h-3 rounded-sm shrink-0" style={{ background: color }} />
            <span className="text-slate-600">{label}</span>
          </div>
        );
      })}
      <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-slate-100">
        <div className="w-4 h-3 rounded-sm shrink-0" style={{ background: NO_DATA_COLOR }} />
        <span className="text-slate-400">No data</span>
      </div>
    </div>
  );
}

// ─── Info panel ───────────────────────────────────────────────────────────────
function InfoPanel({ info, year, field }) {
  if (!info) return null;
  const fieldLabel = FIELD_OPTIONS.find((f) => f.value === field)?.label ?? field;
  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white/96 rounded-xl
                    shadow-md border border-slate-200 p-4 text-sm min-w-[200px] max-w-[240px]">
      <p className="font-semibold text-slate-800 leading-tight mb-1">
        {toTitle(info.subdivision)}
      </p>
      <p className="text-xs text-slate-400 mb-3">{fieldLabel} · {year}</p>
      {info.rainfall != null ? (
        <>
          <p className="text-2xl font-bold text-teal-600 tabular-nums">
            {info.rainfall.toLocaleString('en-IN', { maximumFractionDigits: 1 })} mm
          </p>
          {info.historicalMean != null && (
            <p className="text-xs text-slate-500 mt-1.5">
              Historical mean: {info.historicalMean.toLocaleString('en-IN', { maximumFractionDigits: 1 })} mm
            </p>
          )}
          {info.deviationPct != null && (
            <p className={`text-xs font-semibold mt-0.5 ${info.deviationPct >= 0 ? 'text-teal-600' : 'text-amber-600'}`}>
              {info.deviationPct > 0 ? '+' : ''}{info.deviationPct}% vs historical avg
            </p>
          )}
        </>
      ) : (
        <p className="text-slate-400 text-xs italic">No observation recorded for this year</p>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function RainfallMap() {
  const [geoJson,       setGeoJson]       = useState(null);
  const [selectedYear,  setSelectedYear]  = useState(2015);
  const [inputYear,     setInputYear]     = useState('2015');
  const [selectedField, setSelectedField] = useState('annual');
  const [breaks,        setBreaks]        = useState(ANNUAL_BREAKS);
  const [loading,       setLoading]       = useState(false);
  const [geoError,      setGeoError]      = useState(null);
  const [apiError,      setApiError]      = useState(null);
  const [hoveredInfo,   setHoveredInfo]   = useState(null);
  const [clickedInfo,   setClickedInfo]   = useState(null);
  // Incremented each time fresh rainfall data arrives; triggers GeoJSON remount + restyle
  const [dataVersion,   setDataVersion]   = useState(0);

  // Refs — readable inside stable Leaflet event callbacks without causing re-renders
  const lookupRef     = useRef({});   // subdivision → { rainfall, historicalMean, deviationPct }
  const clickedSubRef = useRef(null); // currently clicked subdivision name

  // ── Load GeoJSON once from local public/ file ─────────────────────────────
  useEffect(() => {
    fetch('/imd_subdivisions.geojson')
      .then((r) => {
        if (!r.ok) throw new Error(`GeoJSON HTTP ${r.status}`);
        return r.json();
      })
      .then(setGeoJson)
      .catch(() => setGeoError('Failed to load IMD subdivision boundary data.'));
  }, []);

  // ── Fetch rainfall when year or field changes ─────────────────────────────
  // AbortController prevents a slow earlier request from overwriting a newer one.
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setApiError(null);

    fetchMapData(selectedYear, selectedField)
      .then((rows) => {
        if (controller.signal.aborted) return; // discard stale response

        // Build lookup keyed by dataset subdivision name
        const lookup = {};
        rows.forEach((r) => { lookup[r.subdivision] = r; });
        lookupRef.current = lookup;

        // Compute colour breaks from the real value distribution
        const vals = rows.map((r) => r.rainfall);
        setBreaks(selectedField === 'annual' ? ANNUAL_BREAKS : quantileBreaks(vals));

        // Clear any pinned selection from a previous period (values have changed)
        setClickedInfo(null);
        clickedSubRef.current = null;

        // Increment version → GeoJSON key changes → remount with fresh styles
        setDataVersion((v) => v + 1);
        setLoading(false);
      })
      .catch((e) => {
        if (controller.signal.aborted) return;
        setApiError(e.message || 'Failed to fetch rainfall data from API.');
        setLoading(false);
      });

    return () => controller.abort();
  }, [selectedYear, selectedField]);

  // ── Style each GeoJSON feature ────────────────────────────────────────────
  // This callback is recreated whenever dataVersion or breaks change, which only
  // happens after lookupRef.current has already been updated with fresh data.
  // The GeoJSON component re-mounts (key changes) at the same time, so it always
  // calls this function with the latest colours.
  const styleFeature = useCallback(
    (feature) => {
      const dataName = geoToDataset(feature.properties.subdivisio);
      const rainfall = lookupRef.current[dataName]?.rainfall ?? null;
      return {
        fillColor:   getColor(rainfall, breaks),
        fillOpacity: 0.80,
        color:       '#94a3b8',   // slate-400 borders visible on white background
        weight:      0.7,
        opacity:     1,
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dataVersion, breaks]
  );

  // ── Hover + click event handlers ──────────────────────────────────────────
  // Stable callback — all mutable values are read via refs.
  const onEachFeature = useCallback((feature, layer) => {
    const geoName  = (feature.properties.subdivisio || '').toUpperCase().trim();
    const dataName = geoToDataset(geoName);

    function restoreStyle() {
      const isSelected = clickedSubRef.current === dataName;
      layer.setStyle({
        color:       isSelected ? '#0f172a' : '#94a3b8',
        weight:      isSelected ? 2 : 0.7,
        fillOpacity: 0.80,
      });
    }

    layer.on({
      mouseover() {
        const row = lookupRef.current[dataName];
        setHoveredInfo({ subdivision: dataName, ...row });
        layer.setStyle({ color: '#0f172a', weight: 2, fillOpacity: 0.95 });
        layer.bringToFront();
      },
      mouseout() {
        setHoveredInfo(null);
        restoreStyle();
      },
      click() {
        const row = lookupRef.current[dataName];
        if (clickedSubRef.current === dataName) {
          clickedSubRef.current = null;
          setClickedInfo(null);
          layer.setStyle({ color: '#94a3b8', weight: 0.7, fillOpacity: 0.80 });
        } else {
          clickedSubRef.current = dataName;
          setClickedInfo({ subdivision: dataName, ...row });
          layer.setStyle({ color: '#0f172a', weight: 2, fillOpacity: 0.90 });
        }
      },
    });
  }, []); // [] — stable: reads refs only

  // ── Year input helpers ────────────────────────────────────────────────────
  function commitYear(raw) {
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n >= 1901 && n <= 2015) {
      setSelectedYear(n);
      setInputYear(String(n));
    } else {
      setInputYear(String(selectedYear));
    }
  }

  const displayInfo = hoveredInfo || clickedInfo;

  // ── Geographic bounds — restrict panning to the Indian subcontinent ───────
  // Approximately: 6°N–38°N, 66°E–100°E (covers all 36 IMD subdivisions +
  // comfortable margin including A&N Islands and Lakshadweep).
  const MAX_BOUNDS = [[4, 62], [40, 100]];

  return (
    <div className="card mb-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <p className="section-title">Rainfall Choropleth Map</p>
          <p className="section-sub">
            IMD meteorological subdivision boundaries · select a year and period below
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-end gap-4">
          {/* Year slider + text input */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Year&nbsp;
              <span className="font-semibold text-slate-700">{selectedYear}</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1901" max="2015" step="1"
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(+e.target.value);
                  setInputYear(e.target.value);
                }}
                className="w-36 accent-teal-500 cursor-pointer"
                aria-label="Select year"
              />
              <input
                id="map-year-input"
                type="number"
                min="1901" max="2015"
                value={inputYear}
                onChange={(e) => setInputYear(e.target.value)}
                onBlur={(e) => commitYear(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && commitYear(e.target.value)}
                className="form-input w-20 text-center tabular-nums"
                aria-label="Year number input"
              />
            </div>
          </div>

          {/* Period selector */}
          <div>
            <label htmlFor="map-field-select" className="block text-xs font-medium text-slate-500 mb-1">
              Period / Month
            </label>
            <select
              id="map-field-select"
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              className="form-input w-52"
            >
              {FIELD_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Clear clicked selection */}
          {clickedInfo && (
            <button
              className="btn btn-ghost text-xs"
              onClick={() => {
                setClickedInfo(null);
                clickedSubRef.current = null;
              }}
            >
              Clear selection
            </button>
          )}
        </div>
      </div>

      {/* ── Map container ──────────────────────────────────────────────── */}
      <div
        className="relative rounded-xl overflow-hidden border border-slate-200"
        style={{ height: '500px' }}
      >
        {/* Loading overlay — semi-transparent so the previous map is still visible */}
        {loading && (
          <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
            <div className="spinner" />
          </div>
        )}

        {/* API error */}
        {apiError && !loading && (
          <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-white/90 rounded-xl">
            <p className="text-red-500 text-sm text-center px-6">{apiError}</p>
          </div>
        )}

        {/* GeoJSON load error */}
        {geoError && (
          <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-white/90 rounded-xl">
            <p className="text-red-500 text-sm text-center px-6">{geoError}</p>
          </div>
        )}

        {/* Leaflet map */}
        {!geoError && (
          <MapContainer
            // Initial centre/zoom — overridden by FitBoundsOnLoad once GeoJSON arrives
            center={[22, 80]}
            zoom={5}
            minZoom={4}
            maxZoom={10}
            maxBounds={MAX_BOUNDS}
            maxBoundsViscosity={0.85}
            style={{ height: '100%', width: '100%', background: '#e8f0f7' }}
            zoomControl
            attributionControl={false}
          >
            {/* No tile layer — pure white background for clean choropleth appearance.
                No external tile service dependency, no API key required, works offline.
                This matches the reference 'Positron-style' clean white map design. */}

            {/* Auto-fit to GeoJSON extent on first load */}
            <FitBoundsOnLoad geoJson={geoJson} />

            {/* Choropleth layer — key forces full remount when data changes */}
            {geoJson && (
              <GeoJSON
                key={`${selectedYear}-${selectedField}-${dataVersion}`}
                data={geoJson}
                style={styleFeature}
                onEachFeature={onEachFeature}
              />
            )}
          </MapContainer>
        )}

        {/* Legend */}
        <MapLegend breaks={breaks} field={selectedField} />

        {/* Hover / click info panel */}
        <InfoPanel info={displayInfo} year={selectedYear} field={selectedField} />

        {/* Instruction hint */}
        {!displayInfo && !loading && geoJson && (
          <div className="absolute bottom-4 right-4 z-[1000] text-xs text-slate-400
                          bg-white/90 rounded-lg px-2.5 py-1.5 border border-slate-200 pointer-events-none">
            Hover to inspect · Click to pin
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="text-xs text-slate-400 mt-2">
        Boundaries: India Meteorological Department · mausam.imd.gov.in (36 official meteorological subdivisions) ·
        Non-annual colour breaks are quantile-derived from {selectedYear} data ·
        Grey = no observation recorded for that subdivision and year
      </p>
    </div>
  );
}

/**
 * API service layer.
 * All HTTP requests to the Spring Boot backend go through this module.
 * Base URL reads from Vite's environment variable; falls back to localhost:8080.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/rainfall';

/**
 * Generic GET request helper with query parameter support.
 */
async function get(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url.toString());
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(errorBody.error || `HTTP ${response.status}`);
  }
  return response.json();
}

// ── Endpoints ─────────────────────────────────────────────────────────

/** Dataset metadata (columns, source, coverage). */
export const fetchMetadata = () => get('/metadata');

/** Summary statistics for the dashboard. */
export const fetchSummary = (filters = {}) => get('/summary', filters);

/** Yearly average rainfall, optionally filtered. */
export const fetchYearly = (filters = {}) => get('/yearly', filters);

/** Monthly average rainfall, optionally filtered. */
export const fetchMonthly = (filters = {}) => get('/monthly', filters);

/** Average rainfall by Indian meteorological season. */
export const fetchSeasonal = (filters = {}) => get('/seasonal', filters);

/** Year-by-year seasonal breakdown. */
export const fetchSeasonalByYear = (filters = {}) => get('/seasonal/yearly', filters);

/** Descriptive statistics (mean, median, std dev, etc.). */
export const fetchStatistics = (filters = {}) => get('/statistics', filters);

/**
 * Paginated, sortable rainfall records.
 * @param {object} filters - { startYear, endYear, subdivision }
 * @param {number} page    - 0-indexed page number
 * @param {number} size    - records per page
 * @param {string} sortBy  - 'year' | 'annual' | 'subdivision'
 * @param {boolean} ascending
 */
export const fetchRecords = (filters = {}, page = 0, size = 50, sortBy = 'year', ascending = true) =>
  get('/records', { ...filters, page, size, sortBy, ascending });

/** List all available subdivisions. */
export const fetchSubdivisions = () => get('/subdivisions');

/**
 * Compare two years.
 * @param {number} year1
 * @param {number} year2
 * @param {string} subdivision
 */
export const fetchCompare = (year1, year2, subdivision) =>
  get('/compare', { year1, year2, subdivision });

/**
 * Choropleth map data — per-subdivision rainfall for a given year and field.
 * @param {number} year   - 1901–2015
 * @param {string} field  - 'annual' | 'jan'..'dec' | 'janFeb' | 'marMay' | 'junSep' | 'octDec'
 */
export const fetchMapData = (year, field = 'annual') =>
  get('/map-data', { year, field });

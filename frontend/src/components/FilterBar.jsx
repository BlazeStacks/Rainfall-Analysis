import { Info } from 'lucide-react';
import { fetchSubdivisions } from '../services/api';
import { useApi } from '../hooks/useApi';

/**
 * Shared filter bar used on multiple pages.
 * Manages year range and meteorological subdivision selection.
 *
 * The "All Subdivisions (mean)" option computes the arithmetic mean
 * across all 36 IMD subdivisions.  It is NOT an area-weighted or
 * population-weighted national average.
 */
export default function FilterBar({ filters, onChange, showSubdivision = true }) {
  const { data: subdivisions } = useApi(fetchSubdivisions, []);

  const handle = (key) => (e) =>
    onChange({ ...filters, [key]: e.target.value || undefined });

  /** Convert ALL-CAPS IMD name to readable Title Case. */
  const toTitle = (s) =>
    s.replace(/\b\w+/g, (w) =>
      ['&', 'AND', 'OF'].includes(w)
        ? w.toLowerCase()
        : w[0] + w.slice(1).toLowerCase()
    );

  return (
    <div className="card mb-6 flex flex-wrap gap-4 items-end">
      {/* Start Year */}
      <div>
        <label
          htmlFor="filter-start-year"
          className="block text-xs font-medium text-slate-500 mb-1"
        >
          Start Year
        </label>
        <input
          id="filter-start-year"
          type="number"
          min="1901"
          max="2015"
          value={filters.startYear || ''}
          onChange={handle('startYear')}
          placeholder="1901"
          className="form-input w-28"
        />
      </div>

      {/* End Year */}
      <div>
        <label
          htmlFor="filter-end-year"
          className="block text-xs font-medium text-slate-500 mb-1"
        >
          End Year
        </label>
        <input
          id="filter-end-year"
          type="number"
          min="1901"
          max="2015"
          value={filters.endYear || ''}
          onChange={handle('endYear')}
          placeholder="2015"
          className="form-input w-28"
        />
      </div>

      {/* Meteorological Subdivision */}
      {showSubdivision && (
        <div>
          <div className="flex items-center gap-1 mb-1">
            <label
              htmlFor="filter-subdivision"
              className="text-xs font-medium text-slate-500"
            >
              Meteorological Subdivision
            </label>
            <span
              title={
                '"All Subdivisions (mean)" is the arithmetic mean across all 36 IMD ' +
                'meteorological subdivisions for each data point. It is an unweighted mean ' +
                'and is not equivalent to a population-weighted or area-weighted national ' +
                'rainfall average.'
              }
              className="text-slate-400 hover:text-slate-600 cursor-help transition-colors"
            >
              <Info size={12} />
            </span>
          </div>
          <select
            id="filter-subdivision"
            value={filters.subdivision || ''}
            onChange={handle('subdivision')}
            className="form-input w-56"
          >
            <option value="">All Subdivisions (mean)</option>
            {(subdivisions || []).map((s) => (
              <option key={s} value={s}>
                {toTitle(s)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Reset */}
      <button
        id="filter-reset-btn"
        className="btn btn-ghost"
        onClick={() => onChange({})}
      >
        Reset
      </button>
    </div>
  );
}

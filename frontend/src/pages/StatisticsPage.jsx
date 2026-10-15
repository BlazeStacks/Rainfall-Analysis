import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { fetchStatistics } from '../services/api';
import { LoadingSpinner, ErrorBanner } from '../components/StatusComponents';
import FilterBar from '../components/FilterBar';
import { fmt } from '../utils/format';

/** Individual statistic row with formula explanation. */
function StatRow({ label, value, formula, interpretation, unit = 'mm', highlight = false }) {
  return (
    <div className={`rounded-xl border p-5 transition-all ${highlight ? 'border-teal-200 bg-teal-50' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className={`text-sm font-semibold ${highlight ? 'text-teal-800' : 'text-slate-700'}`}>{label}</p>
          {formula && (
            <p className="text-xs text-slate-400 font-mono mt-0.5">{formula}</p>
          )}
          {interpretation && (
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">{interpretation}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className={`text-2xl font-bold ${highlight ? 'text-teal-700' : 'text-slate-800'}`}>
            {fmt(value, 2)}
          </p>
          <p className="text-xs text-slate-400">{unit}</p>
        </div>
      </div>
    </div>
  );
}

export default function StatisticsPage() {
  const [filters, setFilters] = useState({});

  const { data: stats, loading, error } = useApi(
    () => fetchStatistics(filters), [JSON.stringify(filters)]);

  if (error) return <ErrorBanner message={error} />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Statistical Analysis</h1>
        <p className="text-slate-500 text-sm mt-1">
          Descriptive statistics for annual rainfall — computed using population formulas.
        </p>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      <div className="card mb-6 bg-slate-50 border-slate-200">
        <p className="text-sm font-medium text-slate-700 mb-1">📐 About these statistics</p>
        <p className="text-xs text-slate-500 leading-relaxed">
          All statistics are computed from the <strong>annual rainfall (mm)</strong> values of the filtered records.
          Each record is one <em>subdivision–year observation</em>. When no subdivision filter is applied,
          the dataset contains 36 subdivisions × ~115 years ≈ 4,090 valid observations with unequal
          geographic areas — these statistics therefore reflect the <strong>distribution across
          subdivision-year observations</strong>, not a population-weighted or area-weighted national average.
          Variance and standard deviation use the <em>population</em> formula (dividing by <em>n</em>)
          because the dataset represents the complete available historical record, not a sample.
          Observations with missing annual values are excluded.
          <strong> Count</strong> shown below reflects valid observations used.
        </p>
      </div>


      {loading ? <LoadingSpinner /> : stats ? (
        <>
          {/* Record count badge */}
          <div className="mb-4 flex items-center gap-2">
            <span className="badge badge-teal">
              {(stats.count || 0).toLocaleString('en-IN')} observations
            </span>
            <span className="text-xs text-slate-400">used in calculations</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatRow
              label="Arithmetic Mean"
              value={stats.mean}
              formula="μ = Σxᵢ / n"
              interpretation="The sum of all annual rainfall values divided by the number of observations. The most commonly used measure of central tendency."
              highlight
            />
            <StatRow
              label="Median"
              value={stats.median}
              formula="Middle value of sorted dataset"
              interpretation="The middle observation when all values are sorted in order. Less sensitive to extreme values than the mean."
            />
            <StatRow
              label="Minimum"
              value={stats.min}
              formula="min(x₁, x₂, …, xₙ)"
              interpretation="The lowest annual rainfall recorded in the selected period and region."
            />
            <StatRow
              label="Maximum"
              value={stats.max}
              formula="max(x₁, x₂, …, xₙ)"
              interpretation="The highest annual rainfall recorded in the selected period and region."
            />
            <StatRow
              label="Range"
              value={stats.range}
              formula="Range = Max − Min"
              interpretation="The spread between the highest and lowest values. Indicates the total variability in the dataset."
            />
            <StatRow
              label="Population Variance"
              value={stats.variance}
              formula="σ² = Σ(xᵢ − μ)² / n"
              interpretation="Measures how spread out the values are around the mean. Computed using the population formula (÷ n)."
              unit="mm²"
            />
            <StatRow
              label="Standard Deviation"
              value={stats.stdDev}
              formula="σ = √σ²"
              interpretation="The square root of variance. Expressed in the same unit as rainfall (mm). A higher value means greater year-to-year variability."
              highlight
            />
            <StatRow
              label="Coefficient of Variation"
              value={stats.cv}
              formula="CV = (σ / μ) × 100"
              interpretation="Relative variability expressed as a percentage of the mean. Useful for comparing variability across regions with different average rainfalls."
              unit="%"
            />
          </div>
        </>
      ) : null}
    </div>
  );
}

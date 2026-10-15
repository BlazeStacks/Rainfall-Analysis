import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import { useApi } from '../hooks/useApi';
import { fetchYearly, fetchMonthly, fetchCompare, fetchSubdivisions } from '../services/api';
import { LoadingSpinner, ErrorBanner } from '../components/StatusComponents';
import FilterBar from '../components/FilterBar';
import { fmt, fmtMm, fmtPct } from '../utils/format';

function RainTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-xl border border-white/10">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {fmt(p.value, 1)} mm</p>
      ))}
    </div>
  );
}

export default function RainfallAnalysis() {
  const [filters, setFilters] = useState({});
  const [compareY1, setCompareY1] = useState('1980');
  const [compareY2, setCompareY2] = useState('2010');
  const [compareSub, setCompareSub] = useState('');
  const [compareResult, setCompareResult] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError,  setCompareError]   = useState(null);

  const { data: yearly,  loading: yl, error: ye } = useApi(() => fetchYearly(filters),  [JSON.stringify(filters)]);
  const { data: monthly, loading: ml }             = useApi(() => fetchMonthly(filters), [JSON.stringify(filters)]);
  const { data: subdivisions }                     = useApi(fetchSubdivisions, []);

  const meanRainfall = yearly?.length
    ? yearly.reduce((s, d) => s + d.rainfall, 0) / yearly.length
    : null;

  async function runCompare() {
    if (!compareY1 || !compareY2 || compareY1 === compareY2) {
      setCompareError('Please select two different years.'); return;
    }
    setCompareLoading(true); setCompareError(null);
    try {
      const res = await fetchCompare(+compareY1, +compareY2, compareSub || undefined);
      setCompareResult(res);
    } catch (e) {
      setCompareError(e.message);
    } finally {
      setCompareLoading(false);
    }
  }

  if (ye) return <ErrorBanner message={ye} />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Rainfall Analysis</h1>
        <p className="text-slate-500 text-sm mt-1">
          Explore yearly and monthly rainfall trends with regional and period filters
        </p>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      {/* Yearly trend with mean reference line */}
      <div className="card mb-6">
        <p className="section-title">Annual Rainfall Over Time</p>
        <p className="section-sub">
          Average of all selected subdivisions per year.
          {meanRainfall && ` Dashed line = period mean (${fmtMm(meanRainfall)}).`}
        </p>
        {yl ? <LoadingSpinner /> : yearly?.length ? (
          <div className="chart-wrapper h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yearly} margin={{ top: 5, right: 15, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false}
                       interval={Math.floor(yearly.length / 8)} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <Tooltip content={<RainTooltip />} />
                {meanRainfall && (
                  <ReferenceLine y={meanRainfall} stroke="#f59e0b" strokeDasharray="6 3"
                                 label={{ value: 'Mean', position: 'right', fontSize: 10, fill: '#f59e0b' }} />
                )}
                <Line type="monotone" dataKey="rainfall" name="Rainfall"
                      stroke="#14b8a6" strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : <p className="text-center text-slate-400 py-12">No data</p>}
      </div>

      {/* Year-over-year change */}
      <div className="card mb-6">
        <p className="section-title">Year-over-Year Change (%)</p>
        <p className="section-sub">
          Percentage change = ((current − previous) / previous) × 100
        </p>
        {yl ? <LoadingSpinner /> : (
          <div className="chart-wrapper h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={(yearly || []).filter(d => d.changePercent != null)}
                margin={{ top: 5, right: 15, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false}
                       interval={Math.floor((yearly?.length || 1) / 8)} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false}
                       tickFormatter={v => `${v}%`} />
                <Tooltip formatter={(v) => [`${v.toFixed(1)}%`, 'Change']}
                         labelFormatter={l => `Year ${l}`} />
                <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 2" />
                <Bar dataKey="changePercent" name="YoY Change %"
                     radius={[3, 3, 0, 0]} maxBarSize={8}
                     fill="#3b82f6"
                     label={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Monthly distribution */}
      <div className="card mb-6">
        <p className="section-title">Monthly Rainfall Distribution</p>
        <p className="section-sub">Average rainfall per month for the selected period and region (mm)</p>
        {ml ? <LoadingSpinner /> : monthly?.length ? (
          <div className="chart-wrapper h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <Tooltip content={<RainTooltip />} />
                <Bar dataKey="rainfall" name="Avg Rainfall" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : <p className="text-center text-slate-400 py-10">No data</p>}
      </div>

      {/* Year comparison tool */}
      <div className="card">
        <p className="section-title">Year Comparison Tool</p>
        <p className="section-sub">Compare two specific years side-by-side against the historical mean</p>
        <div className="flex flex-wrap gap-4 items-end mb-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Year 1</label>
            <input id="compare-year1" type="number" min="1901" max="2015"
                   value={compareY1} onChange={e => setCompareY1(e.target.value)}
                   className="form-input w-28" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Year 2</label>
            <input id="compare-year2" type="number" min="1901" max="2015"
                   value={compareY2} onChange={e => setCompareY2(e.target.value)}
                   className="form-input w-28" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Meteorological Subdivision (optional)</label>
            <select id="compare-subdivision" value={compareSub}
                    onChange={e => setCompareSub(e.target.value)} className="form-input w-64">
              <option value="">All Subdivisions (mean)</option>
              {(subdivisions || []).map(s => (
                <option key={s} value={s}>
                  {s.replace(/\b\w+/g, w => ['&','AND','OF'].includes(w) ? w.toLowerCase() : w[0]+w.slice(1).toLowerCase())}
                </option>
              ))}
            </select>
          </div>
          <button id="compare-btn" className="btn btn-primary" onClick={runCompare}
                  disabled={compareLoading}>
            {compareLoading ? 'Comparing…' : 'Compare'}
          </button>
        </div>

        {compareError && <p className="text-red-500 text-sm">{compareError}</p>}

        {compareResult && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            {[compareResult.year1, compareResult.year2].map(y => (
              <div key={y.year} className="rounded-xl border border-slate-200 p-4">
                <p className="text-lg font-bold text-slate-800">{y.year}</p>
                <p className="text-3xl font-bold text-teal-600 mt-1">{fmtMm(y.rainfall)}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {y.deviationFromMean != null
                    ? `${fmtPct(y.deviationFromMean)} vs historical mean`
                    : '—'}
                </p>
              </div>
            ))}
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
              <p className="text-sm font-medium text-slate-600">Comparison</p>
              <p className="text-xl font-bold text-slate-800 mt-1">
                {compareResult.differenceAbsolute != null
                  ? `${compareResult.differenceAbsolute > 0 ? '+' : ''}${fmt(compareResult.differenceAbsolute, 1)} mm`
                  : '—'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {compareResult.differencePercent != null
                  ? `${fmtPct(compareResult.differencePercent)} relative change`
                  : ''}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Historical mean: {fmtMm(compareResult.historicalMean)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

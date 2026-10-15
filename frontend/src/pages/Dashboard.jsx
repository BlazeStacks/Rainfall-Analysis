import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Cloud, Droplets, TrendingUp, TrendingDown, Calendar, Activity } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { fetchSummary, fetchYearly, fetchMonthly, fetchSeasonal } from '../services/api';
import { LoadingSpinner, ErrorBanner } from '../components/StatusComponents';
import FilterBar from '../components/FilterBar';
import RainfallMap from '../components/RainfallMap';
import { fmt, fmtMm, fmtPct, SEASON_COLORS, SEASON_NAMES } from '../utils/format';

/** Recharts custom tooltip */
function RainTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-xl border border-white/10">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {fmt(p.value, 1)} mm
        </p>
      ))}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color = 'teal' }) {
  const colors = {
    teal:   'text-teal-600 bg-teal-50 border-teal-100',
    blue:   'text-blue-600 bg-blue-50 border-blue-100',
    amber:  'text-amber-600 bg-amber-50 border-amber-100',
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    red:    'text-red-600 bg-red-50 border-red-100',
    violet: 'text-violet-600 bg-violet-50 border-violet-100',
  };
  return (
    <div className="stat-card">
      <div className={`inline-flex p-2.5 rounded-xl border mb-3 ${colors[color]}`}>
        <Icon size={18} />
      </div>
      <p className="text-2xl font-bold text-slate-800 leading-tight">{value}</p>
      <p className="text-sm font-medium text-slate-600 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const [filters, setFilters] = useState({});

  const { data: summary, loading: sl, error: se } = useApi(
    () => fetchSummary(filters), [JSON.stringify(filters)]);
  const { data: yearly, loading: yl } = useApi(
    () => fetchYearly(filters), [JSON.stringify(filters)]);
  const { data: monthly, loading: ml } = useApi(
    () => fetchMonthly(filters), [JSON.stringify(filters)]);
  const { data: seasonal } = useApi(
    () => fetchSeasonal(filters), [JSON.stringify(filters)]);

  if (se) return <ErrorBanner message={se} />;

  const trend = (() => {
    if (!yearly || yearly.length < 10) return null;
    const first5 = yearly.slice(0, 5).map(d => d.rainfall);
    const last5  = yearly.slice(-5).map(d => d.rainfall);
    const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
    const diff = avg(last5) - avg(first5);
    return { diff, pct: ((diff / avg(first5)) * 100) };
  })();

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          Overview of India's rainfall from the selected period · Data: IMD via data.gov.in
        </p>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      {sl ? <LoadingSpinner /> : summary && (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            <StatCard icon={Droplets}    label="Mean Annual (All Subdivisions)" value={fmtMm(summary.averageAnnual)}  color="teal" />
            <StatCard icon={TrendingUp}  label="Highest Annual"      value={fmtMm(summary.maxAnnual)}      color="blue"
                      sub={summary.highestRainfallYear ? `Year ${summary.highestRainfallYear}` : null} />
            <StatCard icon={TrendingDown} label="Lowest Annual"      value={fmtMm(summary.minAnnual)}      color="red"
                      sub={summary.lowestRainfallYear ? `Year ${summary.lowestRainfallYear}` : null} />
            <StatCard icon={Activity}    label="Std Deviation"       value={fmtMm(summary.stdDev)}         color="indigo" />
            <StatCard icon={Calendar}    label="Period"
                      value={`${summary.selectedStartYear}–${summary.selectedEndYear}`}
                      color="amber" />
            <StatCard icon={Cloud}       label="Records Analysed"
                      value={(summary.filteredRecords || 0).toLocaleString('en-IN')}
                      sub={`${summary.subdivisions} subdivisions`}
                      color="violet" />
          </div>

          {/* Trend insight */}
          {trend && (
            <div className={`mb-6 rounded-xl px-5 py-3.5 border text-sm flex items-center gap-3
              ${trend.diff >= 0
                ? 'bg-teal-50 border-teal-200 text-teal-700'
                : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
              {trend.diff >= 0 ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
              <span>
                Comparing first 5 years to last 5 years of the selected period:
                rainfall has <strong>{trend.diff >= 0 ? 'increased' : 'decreased'}</strong> by{' '}
                <strong>{Math.abs(trend.pct).toFixed(1)}%</strong>{' '}
                ({trend.diff >= 0 ? '+' : ''}{trend.diff.toFixed(1)} mm on average).
                This is a descriptive observation only.
              </span>
            </div>
          )}
        </>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 mb-6">
        {/* Yearly trend */}
        <div className="card xl:col-span-3">
          <p className="section-title">Yearly Rainfall Trend</p>
          <p className="section-sub">Average rainfall across selected subdivisions per year (mm)</p>
          {yl ? <LoadingSpinner message="Loading chart…" /> : yearly?.length ? (
            <div className="chart-wrapper h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={yearly} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#14b8a6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false}
                         interval={Math.floor((yearly.length) / 8)} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false}
                         tickFormatter={v => `${v}`} />
                  <Tooltip content={<RainTooltip />} />
                  <Area type="monotone" dataKey="rainfall" name="Rainfall"
                        stroke="#14b8a6" strokeWidth={2}
                        fill="url(#grad1)" dot={false} activeDot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="text-slate-400 text-sm py-8 text-center">No data</p>}
        </div>

        {/* Seasonal distribution */}
        <div className="card xl:col-span-2">
          <p className="section-title">Seasonal Distribution</p>
          <p className="section-sub">Average contribution by Indian meteorological season</p>
          {seasonal?.length ? (
            <div className="space-y-3 mt-2">
              {seasonal.map(s => (
                <div key={s.season}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">{s.seasonName}</span>
                    <span className="text-slate-500">{fmtMm(s.rainfall)} · {fmt(s.contribution, 1)}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                         style={{
                           width: `${s.contribution || 0}%`,
                           background: SEASON_COLORS[s.season] || '#14b8a6'
                         }} />
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-slate-400 text-sm py-8 text-center">No data</p>}
        </div>
      </div>

      {/* Rainfall choropleth map */}
      <RainfallMap />

      {/* Monthly distribution bar chart */}
      <div className="card">
        <p className="section-title">Monthly Rainfall Distribution</p>
        <p className="section-sub">Average monthly rainfall for the selected period (mm)</p>
        {ml ? <LoadingSpinner message="Loading chart…" /> : monthly?.length ? (
          <div className="chart-wrapper h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <Tooltip content={<RainTooltip />} />
                <Bar dataKey="rainfall" name="Rainfall" fill="#3b82f6"
                     radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : <p className="text-slate-400 text-sm py-8 text-center">No data</p>}
      </div>
    </div>
  );
}

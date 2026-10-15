import { useState } from 'react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, RadarChart,
  Radar, PolarGrid, PolarAngleAxis
} from 'recharts';
import { useApi } from '../hooks/useApi';
import { fetchSeasonal, fetchSeasonalByYear } from '../services/api';
import { LoadingSpinner, ErrorBanner } from '../components/StatusComponents';
import FilterBar from '../components/FilterBar';
import { fmt, fmtMm, SEASON_COLORS, SEASON_NAMES } from '../utils/format';

function SeasonTooltip({ active, payload, label }) {
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

const SEASON_KEYS = ['winter', 'preMonsoon', 'swMonsoon', 'postMonsoon'];

/** Explanation card for each season */
function SeasonInfo({ season, data }) {
  const info = {
    winter:      { emoji: '❄️',  desc: 'January–February. Western disturbances bring rain to North India.' },
    preMonsoon:  { emoji: '🌤️',  desc: 'March–May. Hot, dry, with thunderstorms in peninsular India.' },
    swMonsoon:   { emoji: '🌧️',  desc: 'June–September. South-west monsoon. Most of India\'s annual rainfall.' },
    postMonsoon: { emoji: '🌦️',  desc: 'October–December. North-east monsoon affects the south-east coast.' },
  };
  const { emoji, desc } = info[season.season] || {};
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{emoji}</span>
        <div>
          <p className="font-semibold text-slate-800 text-sm">{season.seasonName}</p>
          <p className="text-xs text-slate-500">{fmtMm(season.rainfall)} avg · {fmt(season.contribution, 1)}% of annual</p>
        </div>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
      {/* mini contribution bar */}
      <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full"
             style={{ width: `${season.contribution || 0}%`, background: SEASON_COLORS[season.season] }} />
      </div>
    </div>
  );
}

export default function SeasonalAnalysis() {
  const [filters, setFilters] = useState({});

  const { data: seasonal,      loading: sl, error: se } = useApi(() => fetchSeasonal(filters),      [JSON.stringify(filters)]);
  const { data: seasonalByYear, loading: byl }           = useApi(() => fetchSeasonalByYear(filters), [JSON.stringify(filters)]);

  if (se) return <ErrorBanner message={se} />;

  // Build radar data from seasonal averages
  const radarData = (seasonal || []).map(s => ({
    season: s.seasonName.split(' ')[0],
    value:  s.rainfall || 0,
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Seasonal Analysis</h1>
        <p className="text-slate-500 text-sm mt-1">
          Rainfall patterns across India's four meteorological seasons
        </p>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      {/* Season definition note */}
      <div className="card mb-6 bg-blue-50 border border-blue-200">
        <p className="text-sm font-medium text-blue-800 mb-1">Meteorological Season Definitions</p>
        <p className="text-xs text-blue-700 leading-relaxed">
          <strong>Winter:</strong> Jan–Feb &nbsp;|&nbsp;
          <strong>Pre-Monsoon:</strong> Mar–May &nbsp;|&nbsp;
          <strong>SW Monsoon:</strong> Jun–Sep &nbsp;|&nbsp;
          <strong>Post-Monsoon:</strong> Oct–Dec
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Seasonal values are derived from monthly columns in the IMD dataset.
          Seasonal contribution = (seasonal rainfall / annual rainfall) × 100.
        </p>
      </div>

      {/* Season info cards */}
      {sl ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {(seasonal || []).map(s => <SeasonInfo key={s.season} season={s} />)}
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Seasonal bar */}
        <div className="card xl:col-span-2">
          <p className="section-title">Average Rainfall by Season</p>
          <p className="section-sub">Computed from monthly rainfall columns (mm)</p>
          {sl ? <LoadingSpinner /> : seasonal?.length ? (
            <div className="chart-wrapper h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={seasonal} margin={{ top: 5, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="seasonName" tick={{ fontSize: 10, fill: '#94a3b8' }}
                         tickLine={false} axisLine={false}
                         angle={-15} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<SeasonTooltip />} />
                  <Bar dataKey="rainfall" name="Avg Rainfall" radius={[6, 6, 0, 0]} maxBarSize={60}>
                    {(seasonal || []).map((s, i) => (
                      <Cell key={i} fill={SEASON_COLORS[s.season]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="text-center text-slate-400 py-10">No data</p>}
        </div>

        {/* Radar */}
        <div className="card">
          <p className="section-title">Seasonal Radar</p>
          <p className="section-sub">Relative rainfall distribution shape</p>
          {sl ? <LoadingSpinner /> : radarData.length ? (
            <div className="chart-wrapper h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="season" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Radar name="Rainfall" dataKey="value"
                         stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="text-center text-slate-400 py-10">No data</p>}
        </div>
      </div>

      {/* Year-by-year seasonal stacked chart */}
      <div className="card">
        <p className="section-title">Year-by-Year Seasonal Breakdown</p>
        <p className="section-sub">
          Stacked rainfall per season per year. Helps identify seasonal anomalies.
        </p>
        {byl ? <LoadingSpinner /> : seasonalByYear?.length ? (
          <div className="chart-wrapper h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seasonalByYear} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false}
                       interval={Math.floor((seasonalByYear.length || 1) / 8)} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <Tooltip content={<SeasonTooltip />} />
                <Legend iconType="square" iconSize={10}
                        formatter={v => SEASON_NAMES[v] || v} wrapperStyle={{ fontSize: 11 }} />
                {SEASON_KEYS.map(key => (
                  <Bar key={key} dataKey={key} stackId="a"
                       fill={SEASON_COLORS[key]} name={key} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : <p className="text-center text-slate-400 py-10">No data</p>}
      </div>
    </div>
  );
}
